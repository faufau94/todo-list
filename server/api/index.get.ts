import { db } from '../utils/db'
import { todos } from '../db/schema'

export default defineEventHandler(async (event) => {
  return await db.select().from(todos)
})
