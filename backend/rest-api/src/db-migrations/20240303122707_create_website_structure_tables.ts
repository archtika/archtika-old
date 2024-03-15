import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createSchema('structure').execute()

    await db.schema
        .createTable('structure.website')
        .addColumn('id', 'serial', (col) => col.primaryKey().notNull())
        .addColumn('user_id', 'varchar(20)', (col) =>
            col.notNull().references('auth.auth_user.id').onDelete('cascade')
        )
        .addColumn('title', 'varchar', (col) => col.notNull())
        .addColumn('meta_description', 'varchar')
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamptz')
        .execute()

    await db.schema
        .createTable('structure.page')
        .addColumn('id', 'serial', (col) => col.primaryKey().notNull())
        .addColumn('website_id', 'integer', (col) =>
            col.notNull().references('structure.website.id').onDelete('cascade')
        )
        .addColumn('route', 'varchar', (col) => col.notNull())
        .addColumn('title', 'varchar', (col) => col.notNull())
        .addColumn('meta_description', 'varchar')
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamptz')
        .addUniqueConstraint('uniqueRoute', ['website_id', 'route'])
        .execute()
}
