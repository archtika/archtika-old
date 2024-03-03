import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createSchema('media').execute()

    await db.schema
        .createType('media.asset_type')
        .asEnum(['image', 'video', 'audio'])
        .execute()

    await db.schema
        .createTable('media.media_asset')
        .addColumn('id', 'serial', (col) => col.primaryKey().notNull())
        .addColumn('user_id', 'varchar(20)', (col) =>
            col.notNull().references('auth.auth_user.id')
        )
        .addColumn('asset_type', sql`media.asset_type`, (col) => col.notNull())
        .addColumn('asset_name', 'varchar', (col) => col.notNull())
        .addColumn('asset_url', 'varchar', (col) => col.notNull())
        .addColumn('file_size', 'integer', (col) => col.notNull())
        .addColumn('pixel_width', 'integer')
        .addColumn('pixel_height', 'integer')
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamptz')
        .execute()
}
