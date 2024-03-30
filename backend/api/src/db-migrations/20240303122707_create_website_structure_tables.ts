import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createSchema('structure').execute()

    await db.schema
        .createTable('structure.website')
        .addColumn('id', 'uuid', (col) =>
            col
                .primaryKey()
                .notNull()
                .defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn('user_id', 'varchar(20)', (col) =>
            col.notNull().references('auth.auth_user.id').onDelete('cascade')
        )
        .addColumn('title', 'varchar', (col) => col.notNull())
        .addColumn('meta_description', 'varchar')
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamptz')
        .addColumn('last_modified_by', 'varchar(20)', (col) =>
            col.notNull().references('auth.auth_user.id').onDelete('cascade')
        )
        .execute()

    await db.schema
        .createTable('structure.page')
        .addColumn('id', 'uuid', (col) =>
            col
                .primaryKey()
                .notNull()
                .defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn('website_id', 'uuid', (col) =>
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

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('structure.page').execute()
    await db.schema.dropTable('structure.website').execute()
    await db.schema.dropSchema('structure').execute()
}
