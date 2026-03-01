import { db } from '../utils/db'
import { todos } from '../db/schema'
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    return await db.delete(todos).where(eq(todos.id, Number(query.id)))
})
