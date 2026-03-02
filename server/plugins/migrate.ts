import { migrate } from 'drizzle-orm/mysql2/migrator'
import { db } from '../utils/db'

async function runMigrations(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await migrate(db, { migrationsFolder: './drizzle' })
      console.log('Database migrations applied')
      return
    } catch (err) {
      if (i === retries - 1) throw err
      console.log(`Waiting for database... (attempt ${i + 1}/${retries})`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

export default defineNitroPlugin(async () => {
  await runMigrations()
})
