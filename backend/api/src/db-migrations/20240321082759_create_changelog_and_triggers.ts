import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createSchema('tracking').execute()
    await db.schema
        .createType('tracking.entity_type')
        .asEnum([
            'website',
            'page',
            'component',
            'component-position',
            'collaborator'
        ])
        .execute()
    await db.schema
        .createType('tracking.entity_action_type')
        .asEnum(['create', 'update', 'delete'])
        .execute()

    await db.schema
        .createTable('tracking.change_log')
        .addColumn('id', 'uuid', (col) =>
            col
                .primaryKey()
                .notNull()
                .defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn('website_id', 'uuid', (col) =>
            col.references('structure.website.id').notNull().onDelete('cascade')
        )
        .addColumn('user_id', 'varchar(20)', (col) =>
            col.notNull().references('auth.auth_user.id')
        )
        .addColumn('entity_type', sql`tracking.entity_type`, (col) =>
            col.notNull()
        )
        .addColumn('action_type', sql`tracking.entity_action_type`, (col) =>
            col.notNull()
        )
        .addColumn('previous_value', 'jsonb')
        .addColumn('new_value', 'jsonb')
        .addColumn('change_summary', 'varchar', (col) => col.notNull())
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .execute()

    await sql`
      CREATE FUNCTION tracking.log_change()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $$
      DECLARE
        entity_type_val tracking.entity_type;
        action_type_val tracking.entity_action_type;
        previous_value_val JSONB;
        new_value_val JSONB;
        change_summary_text VARCHAR;
        website_id_val UUID;
        last_modified_by_val VARCHAR;
      BEGIN
        IF TG_TABLE_NAME = 'website' THEN
          entity_type_val := 'website';
          website_id_val := COALESCE(NEW.id, OLD.id);
          last_modified_by_val := COALESCE(NEW.last_modified_by, OLD.last_modified_by);
        ELSIF TG_TABLE_NAME = 'page' THEN
          entity_type_val := 'page';
          website_id_val := COALESCE(NEW.website_id, OLD.website_id);
          SELECT website.last_modified_by INTO last_modified_by_val
          FROM structure.website
          WHERE website.id = website_id_val;
        ELSIF TG_TABLE_NAME = 'component' THEN
          entity_type_val := 'component';
          SELECT page.website_id INTO website_id_val
          FROM structure.page
          WHERE page.id = COALESCE(NEW.page_id, OLD.page_id);
          SELECT website.last_modified_by INTO last_modified_by_val
          FROM structure.website
          WHERE website.id = website_id_val;
        ELSIF TG_TABLE_NAME = 'component_position' THEN
          entity_type_val := 'component-position';
          SELECT page.website_id INTO website_id_val
          FROM structure.page
          WHERE page.id = (
            SELECT component.page_id
            FROM components.component
            WHERE component.id = COALESCE(NEW.component_id, OLD.component_id)
          );
          SELECT website.last_modified_by INTO last_modified_by_val
          FROM structure.website
          WHERE website.id = website_id_val;
        ELSIF TG_TABLE_NAME = 'collaborator' THEN
          entity_type_val := 'collaborator';
          website_id_val := COALESCE(NEW.website_id, OLD.website_id);
          SELECT website.last_modified_by INTO last_modified_by_val
          FROM structure.website
          WHERE website.id = website_id_val;
        END IF;

        IF TG_OP = 'INSERT' THEN
          action_type_val := 'create';
          previous_value_val := row_to_json(OLD);
          new_value_val := row_to_json(NEW);
        ELSIF TG_OP = 'UPDATE' THEN
          action_type_val := 'update';
          previous_value_val := row_to_json(OLD);
          new_value_val := row_to_json(NEW);
        ELSIF TG_OP = 'DELETE' THEN
          action_type_val := 'delete';
          previous_value_val := row_to_json(OLD);
          new_value_val := NULL;
        END IF; 

        change_summary_text := action_type_val || ' ' || TG_TABLE_NAME;

        INSERT INTO tracking.change_log (
          website_id,
          user_id,
          entity_type,
          action_type,
          previous_value,
          new_value,
          change_summary
        )
        VALUES (
          website_id_val,
          last_modified_by_val,
          entity_type_val,
          action_type_val,
          previous_value_val,
          new_value_val,
          change_summary_text
        );      

        RETURN NEW;
      EXCEPTION
        WHEN others THEN
          RAISE WARNING 'Logging failed: %', SQLERRM;
          RETURN NEW;
      END;
      $$;

      CREATE TRIGGER log_website_changes
      AFTER UPDATE OF title, meta_description, updated_at
      ON structure.website
      FOR EACH ROW
      EXECUTE FUNCTION tracking.log_change();

      CREATE CONSTRAINT TRIGGER log_page_changes
      AFTER INSERT OR UPDATE OR DELETE ON structure.page
      FOR EACH ROW
      EXECUTE FUNCTION tracking.log_change();

      CREATE TRIGGER log_component_changes
      AFTER INSERT OR UPDATE OR DELETE ON components.component
      FOR EACH ROW
      EXECUTE FUNCTION tracking.log_change();

      CREATE TRIGGER log_component_position_changes
      AFTER INSERT OR UPDATE ON components.component_position
      FOR EACH ROW
      EXECUTE FUNCTION tracking.log_change();

      CREATE TRIGGER log_collaborator_changes
      AFTER INSERT OR UPDATE OR DELETE ON collaboration.collaborator
      FOR EACH ROW
      EXECUTE FUNCTION tracking.log_change();
    `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('tracking.change_log').execute()
    await sql`DROP TRIGGER log_website_changes ON structure.website`.execute(db)
    await sql`DROP TRIGGER log_page_changes ON structure.page`.execute(db)
    await sql`DROP TRIGGER log_component_changes ON components.component`.execute(
        db
    )
    await sql`DROP TRIGGER log_component_position_changes ON components.component_position`.execute(
        db
    )
    await sql`DROP TRIGGER log_collaborator_changes ON collaboration.collaborator`.execute(
        db
    )
    await sql`DROP FUNCTION tracking.log_change()`.execute(db)
    await db.schema.dropType('tracking.entity_type').execute()
    await db.schema.dropType('tracking.entity_action_type').execute()
    await db.schema.dropSchema('tracking').execute()
}
