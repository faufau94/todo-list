import { mysqlTable, text, serial, timestamp, boolean } from 'drizzle-orm/mysql-core'

export const todos = mysqlTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  desc: text('desc').notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp().notNull().defaultNow(),
})
