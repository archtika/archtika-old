import { Kysely, sql } from 'kysely'
import { DB } from 'kysely-codegen'

export async function up(db: Kysely<DB>) {
    await db.schema.createSchema('media').execute()

    await db.schema
        .createTable('media.media_asset')
        .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
        .addColumn('user_id', 'varchar(20)', (col) =>
            col.notNull().references('auth.auth_user.id').onDelete('cascade')
        )
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('mimetype', 'varchar', (col) => col.notNull())
        .addColumn('file_hash', 'varchar', (col) => col.notNull())
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addUniqueConstraint('uniqueFileHash', ['file_hash', 'user_id'])
        .execute()
}

export async function down(db: Kysely<DB>) {
    await db.schema.dropTable('media.media_asset').execute()
    await db.schema.dropSchema('media').execute()
}
