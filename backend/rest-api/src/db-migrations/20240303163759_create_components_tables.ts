import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createSchema('components').execute()
    await db.schema
        .createType('components.component_type')
        .asEnum(['text', 'button', 'image', 'video', 'audio', 'accordion'])
        .execute()

    await db.schema
        .createTable('components.component')
        .addColumn('id', 'serial', (col) => col.primaryKey().notNull())
        .addColumn('type', sql`components.component_type`, (col) =>
            col.notNull()
        )
        .addColumn('page_id', 'integer', (col) =>
            col.notNull().references('structure.page.id')
        )
        .addColumn('content', 'jsonb', (col) => col.notNull())
        .addColumn('asset_id', 'integer', (col) =>
            col.references('media.media_asset.id')
        )
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamptz')
        .execute()

    await db.schema
        .createTable('components.component_position')
        .addColumn('component_id', 'integer', (col) =>
            col.notNull().primaryKey().references('components.component.id')
        )
        .addColumn('grid_x', 'integer', (col) => col.notNull())
        .addColumn('grid_y', 'integer', (col) => col.notNull())
        .addColumn('grid_width', 'integer', (col) => col.notNull())
        .addColumn('grid_height', 'integer', (col) => col.notNull())
        .execute()
}
