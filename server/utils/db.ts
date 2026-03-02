import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../db/schema'

const config = useRuntimeConfig()

const pool = mysql.createPool({
  host: config.dbHost,
  port: Number(config.dbPort),
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
})
export const db = drizzle(pool, { schema, mode: 'default' })
