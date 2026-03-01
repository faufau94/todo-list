import { db } from '../utils/db'
import { todos } from '../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await db.insert(todos).values({ title: body.title, desc: body.desc })
})
