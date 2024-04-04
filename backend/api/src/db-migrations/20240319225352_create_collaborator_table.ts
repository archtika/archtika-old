import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    db.schema.createSchema('collaboration').execute()

    db.schema
        .createTable('collaboration.collaborator')
        .addColumn('website_id', 'uuid', (col) =>
            col.references('structure.website.id').notNull().onDelete('cascade')
        )
        .addColumn('user_id', 'varchar(20)', (col) =>
            col.references('auth.auth_user.id').notNull()
        )
        .addColumn('permission_level', 'integer', (col) =>
            col.notNull().defaultTo(10)
        )
        .addColumn('invited_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addPrimaryKeyConstraint('collaboratorPrimaryKey', [
            'website_id',
            'user_id'
        ])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    db.schema.dropTable('collaboration.collaborator').execute()
    db.schema.dropSchema('collaboration').execute()
}
