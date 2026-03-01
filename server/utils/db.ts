import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../db/schema'

const pool = mysql.createPool(useRuntimeConfig().databaseUrl!)
export const db = drizzle(pool, { schema, mode: 'default' })
