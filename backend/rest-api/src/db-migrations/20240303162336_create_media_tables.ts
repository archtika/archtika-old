import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createSchema('media').execute()

    await db.schema
        .createTable('media.media_asset')
        .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
        .addColumn('user_id', 'varchar(20)', (col) =>
            col.notNull().references('auth.auth_user.id')
        )
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('mimetype', 'varchar', (col) => col.notNull())
        .addColumn('file_hash', 'varchar', (col) => col.notNull())
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .execute()
}
