#!/usr/bin/env npx tsx

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function setupDatabase() {
  const sql = neon(DATABASE_URL!);
  
  try {
    console.log('🔍 Setting up database...');
    
    // Read the SQL file
    const sqlFile = readFileSync(join(__dirname, 'create_financial_tables.sql'), 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlFile
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Use raw SQL execution
          await sql.unsafe(statement);
          console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
        } catch (error) {
          console.error(`❌ Failed to execute: ${statement.substring(0, 50)}...`);
          console.error(`   Error: ${error}`);
        }
      }
    }

    console.log('\n🔍 Verifying table creation...');
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('\n📋 Tables in database:');
    tables.forEach((table: any) => {
      console.log(`   ✓ ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase().then(() => {
  console.log('\n✨ Database setup complete!');
  process.exit(0);
});
