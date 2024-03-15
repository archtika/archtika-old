import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createSchema('auth').execute()

    await db.schema
        .createTable('auth.auth_user')
        .addColumn('id', 'varchar(20)', (col) => col.primaryKey().notNull())
        .addColumn('username', 'varchar', (col) => col.notNull())
        .addColumn('email', 'varchar', (col) => col.notNull())
        .execute()

    await db.schema
        .createTable('auth.oauth_account')
        .addColumn('provider_id', 'varchar', (col) => col.notNull())
        .addColumn('provider_user_id', 'varchar', (col) => col.notNull())
        .addColumn('user_id', 'varchar(20)', (col) =>
            col.notNull().references('auth.auth_user.id').onDelete('cascade')
        )
        .addPrimaryKeyConstraint('oAuthAccountPrimaryKey', [
            'provider_id',
            'provider_user_id'
        ])
        .execute()

    await db.schema
        .createTable('auth.user_session')
        .addColumn('id', 'varchar(40)', (col) => col.primaryKey().notNull())
        .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
        .addColumn('user_id', 'varchar(20)', (col) =>
            col.notNull().references('auth.auth_user.id').onDelete('cascade')
        )
        .execute()
}
