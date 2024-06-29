import { type Kysely, sql } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
  await sql`
    CREATE FUNCTION components.remove_empty_gaps()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    DECLARE
      current_page_id UUID;
      current_website_id UUID;
      deleted_row_start INT;
      deleted_row_end INT;
      row_span INT;
      channel_name TEXT;
      payload JSON;
      sender_id UUID;
    BEGIN
      current_page_id := OLD.page_id;

      SELECT website_id, last_modified_by
      INTO current_website_id, sender_id
      FROM structure.page p
      JOIN structure.website w ON p.website_id = w.id
      WHERE p.id = current_page_id;
    
      SELECT row_start, row_end
      INTO deleted_row_start, deleted_row_end
      FROM components.component_position
      WHERE component_id = OLD.id;
    
      row_span := deleted_row_end - deleted_row_start + 1;

      UPDATE components.component_position cp
      SET row_start = row_start - row_span,
          row_end = row_end - row_span
      FROM components.component c
      JOIN structure.page p ON c.page_id = p.id
      WHERE cp.row_start > deleted_row_end
      AND cp.component_id = c.id
      AND c.type != 'footer'
      AND p.website_id = current_website_id
      AND (OLD.type = 'header' OR c.page_id = current_page_id);

      channel_name := 'components_' || current_page_id;
      payload := json_build_object(
        'operation_type', 'shift-positions',
        'data', json_build_object(),
        'senderId', sender_id
      );

      PERFORM pg_notify(channel_name, payload::text);
      
      RETURN OLD;
    END;
    $$;

    CREATE TRIGGER remove_empty_gaps
    BEFORE DELETE ON components.component
    FOR EACH ROW
    WHEN (OLD.type IN ('header', 'section'))
    EXECUTE FUNCTION components.remove_empty_gaps();


    CREATE FUNCTION components.adjust_positions_on_insert()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    DECLARE
      current_page_id UUID;
      current_website_id UUID;
      new_row_start INT;
      new_row_end INT;
      footer_row_start INT;
      footer_row_end INT;
      channel_name TEXT;
      payload JSON;
      sender_id UUID;
    BEGIN
      current_page_id := NEW.page_id;

      SELECT website_id, last_modified_by
      INTO current_website_id, sender_id
      FROM structure.page p
      JOIN structure.website w ON p.website_id = w.id
      WHERE p.id = current_page_id;

      SELECT COALESCE(MAX(cp.row_end), 0) + 1 INTO new_row_start
      FROM components.component_position cp
      JOIN components.component c ON cp.component_id = c.id
      JOIN structure.page p ON c.page_id = p.id
      WHERE c.type IN ('header', 'section')
      AND p.website_id = current_website_id;

      new_row_end := new_row_start + 1;

      SELECT cp.row_start, cp.row_end INTO footer_row_start, footer_row_end
      FROM components.component_position cp
      JOIN components.component c ON cp.component_id = c.id
      JOIN structure.page p ON c.page_id = p.id
      WHERE c.type = 'footer'
      AND p.website_id = current_website_id;

      IF NEW.type = 'header' THEN
        UPDATE components.component_position cp
        SET row_start = row_start + 2,
            row_end = row_end + 2
        FROM components.component c
        JOIN structure.page p ON c.page_id = p.id
        WHERE cp.component_id = c.id
        AND c.type = 'section'
        AND p.website_id = current_website_id;
      END IF;

      IF footer_row_start IS NOT NULL AND footer_row_start <= new_row_end THEN
        UPDATE components.component_position cp
        SET row_start = new_row_end + 1,
            row_end = new_row_end + footer_row_end - footer_row_start + 1
        FROM components.component c
        JOIN structure.page p ON c.page_id = p.id
        WHERE cp.component_id = c.id
        AND c.type = 'footer'
        AND p.website_id = current_website_id;
      END IF;

      channel_name := 'components_' || current_page_id;
      payload := json_build_object(
        'operation_type', 'shift-positions',
        'data', json_build_object(),
        'senderId', sender_id
      );

      PERFORM pg_notify(channel_name, payload::text);

      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER adjust_positions_on_insert
    AFTER INSERT ON components.component
    FOR EACH ROW
    WHEN (NEW.type IN ('header', 'section', 'footer'))
    EXECUTE FUNCTION components.adjust_positions_on_insert();


    CREATE FUNCTION components.adjust_positions_on_position_update()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    DECLARE
      current_page_id UUID;
      current_website_id UUID;
      row_span INT;
      component_type TEXT;
      channel_name TEXT;
      payload JSON;
      sender_id UUID;
    BEGIN
      SELECT type
      INTO component_type
      FROM components.component
      WHERE id = NEW.component_id;

      IF component_type = 'header' OR component_type = 'section' THEN
        SELECT page_id
        INTO current_page_id
        FROM components.component
        WHERE id = NEW.component_id;

        SELECT website_id, last_modified_by
        INTO current_website_id, sender_id
        FROM structure.page p
        JOIN structure.website w ON p.website_id = w.id
        WHERE p.id = current_page_id;

        row_span := NEW.row_end - OLD.row_end;

        UPDATE components.component_position cp
        SET row_start = row_start + row_span,
            row_end = row_end + row_span
        FROM components.component c
        JOIN structure.page p ON c.page_id = p.id
        WHERE cp.component_id = c.id
        AND cp.row_start > OLD.row_end
        AND c.type IN ('section', 'footer')
        AND p.website_id = current_website_id
        AND (component_type = 'header' OR c.page_id = current_page_id OR c.type = 'footer');
      END IF;

      channel_name := 'components_' || current_page_id;
      payload := json_build_object(
        'operation_type', 'shift-positions',
        'data', json_build_object(),
        'senderId', sender_id
      );

      PERFORM pg_notify(channel_name, payload::text);

      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER adjust_positions_on_position_update
    AFTER UPDATE ON components.component_position
    FOR EACH ROW
    WHEN (pg_trigger_depth() = 0)
    EXECUTE FUNCTION components.adjust_positions_on_position_update();
  `.execute(db);
}

export async function down(db: Kysely<DB>) {
  await sql`DROP TRIGGER remove_empty_gaps ON components.component`.execute(db);
  await sql`DROP TRIGGER adjust_positions_on_insert ON components.component`.execute(
    db,
  );
  await sql`DROP TRIGGER adjust_positions_on_position_update ON components.component_position`.execute(
    db,
  );
  await sql`DROP FUNCTION components.remove_empty_gaps()`.execute(db);
  await sql`DROP FUNCTION components.adjust_positions_on_insert()`.execute(db);
  await sql`DROP FUNCTION components.adjust_positions_on_position_update()`.execute(
    db,
  );
}
