import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('fitness_records', {
 userId: text('user_id').notNull(), id: text('id').notNull(), kind: text('kind').notNull(),
 body: text('body').notNull(), deleted: integer('deleted').notNull().default(0),
 revision: integer('revision').notNull().default(1), updatedAt: text('updated_at').notNull(),
}, t=>[primaryKey({columns:[t.userId,t.id]})]);
