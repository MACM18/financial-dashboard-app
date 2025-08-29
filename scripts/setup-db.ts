import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"
import { join } from "path"

const sql = neon(process.env.DATABASE_URL!)

async function setupDatabase() {
  try {
    console.log("Setting up database tables...")
    
    // Read and execute the SQL file
    const sqlFile = readFileSync(join(process.cwd(), "scripts", "create_financial_tables.sql"), "utf8")
    const statements = sqlFile.split(";").filter(s => s.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql`${statement}`
      }
    }
    
    console.log("✅ Database tables created successfully!")
    
    // Test connection
    const result = await sql`SELECT 1 as test`
    console.log("✅ Database connection test passed")
    
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  setupDatabase()
}

export { setupDatabase }
