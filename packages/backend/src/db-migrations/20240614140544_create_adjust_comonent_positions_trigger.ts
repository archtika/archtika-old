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
      deleted_row_start INT;
      deleted_row_end INT;
      row_span INT;
    BEGIN
      current_page_id := OLD.page_id;
    
      SELECT row_start, row_end
      INTO deleted_row_start, deleted_row_end
      FROM components.component_position
      WHERE component_id = OLD.id;
    
      row_span := deleted_row_end - deleted_row_start + 1;

      IF OLD.type = 'header' OR OLD.type = 'section' THEN
        UPDATE components.component_position cp
        SET row_start = row_start - row_span,
            row_end = row_end - row_span
        FROM components.component c
        WHERE cp.row_start > deleted_row_end
        AND cp.component_id = c.id
        AND c.page_id = current_page_id
        AND c.type != 'footer';
      END IF;
      
      RETURN OLD;
    END;
    $$;

    CREATE TRIGGER remove_empty_gaps
    BEFORE DELETE ON components.component
    FOR EACH STATEMENT
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
    BEGIN
      current_page_id := NEW.page_id;

      SELECT website_id
      INTO current_website_id
      FROM structure.page
      WHERE id = current_page_id;

      SELECT COALESCE(MAX(row_end), 0) + 1 INTO new_row_start
      FROM components.component_position cp
      JOIN components.component c ON cp.component_id = c.id
      WHERE c.type IN ('header', 'section')
      AND EXISTS (
        SELECT 1
        FROM structure.website w
        WHERE w.id = current_website_id
      );

      new_row_end := new_row_start + 1;

      SELECT row_start, row_end INTO footer_row_start, footer_row_end
      FROM components.component_position cp
      JOIN components.component c ON cp.component_id = c.id
      WHERE c.type = 'footer'
      AND EXISTS (
        SELECT 1
        FROM structure.website w
        WHERE w.id = current_website_id
      );

      IF NEW.type = 'header' THEN
        UPDATE components.component_position
        SET row_start = row_start + 2,
            row_end = row_end + 2
        WHERE component_id IN (
          SELECT id FROM components.component
          WHERE type = 'section'
          AND EXISTS (
            SELECT 1
            FROM structure.website w
            WHERE w.id = current_website_id
          )
        );
      END IF;

      IF footer_row_start IS NOT NULL AND footer_row_start <= new_row_end THEN
        UPDATE components.component_position
        SET row_start = new_row_end + 1,
            row_end = new_row_end + 2
        WHERE component_id = (
          SELECT id FROM components.component
          WHERE type = 'footer'
          AND EXISTS (
            SELECT 1
            FROM structure.website w
            WHERE w.id = current_website_id
          )
        );
      END IF;

      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER adjust_positions_on_insert
    AFTER INSERT ON components.component
    FOR EACH ROW
    EXECUTE FUNCTION components.adjust_positions_on_insert();
  `.execute(db);
}

export async function down(db: Kysely<DB>) {
  await sql`DROP TRIGGER remove_empty_gaps ON components.component`.execute(db);
  await sql`DROP TRIGGER adjust_positions_on_insert ON components.component`.execute(
    db,
  );
  await sql`DROP FUNCTION components.remove_empty_gaps()`.execute(db);
  await sql`DROP FUNCTION components.adjust_positions_on_insert()`.execute(db);
}
