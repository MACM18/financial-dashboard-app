#!/usr/bin/env npx tsx

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function createUsersTable() {
  const sql = neon(DATABASE_URL!);
  
  try {
    console.log('🔍 Creating users table...');
    
    // Create users table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          display_name TEXT,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✅ Users table created successfully');
    
    // Create index for email
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    
    console.log('✅ Email index created successfully');

    // Verify table creation
    const userTable = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;

    if (userTable.length > 0) {
      console.log('\n👥 Users table structure:');
      userTable.forEach((col: any) => {
        console.log(`   ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('\n⚠️  Users table still not found!');
    }

  } catch (error) {
    console.error('❌ Users table creation failed:', error);
    process.exit(1);
  }
}

createUsersTable().then(() => {
  console.log('\n✨ Users table setup complete!');
  process.exit(0);
});
