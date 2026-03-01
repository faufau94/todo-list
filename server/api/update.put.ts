import { db } from '../utils/db'
import { todos } from '../db/schema'
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    return await db.update(todos).set({ title: body.title, desc: body.desc, completed: body.completed }).where(eq(todos.id, body.id))
})
