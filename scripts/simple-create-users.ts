#!/usr/bin/env npx tsx

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;

async function testUserTable() {
  const sql = neon(DATABASE_URL!);
  
  try {
    // Try a simple select to see if the table exists
    console.log('Testing if users table exists...');
    try {
      const result = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`✅ Users table exists with ${result[0].count} rows`);
      return;
    } catch (error) {
      console.log('Users table does not exist, creating it...');
    }
    
    // Create the table with a very simple approach
    console.log('Creating users table...');
    await sql`
      CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          display_name TEXT,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    console.log('✅ Users table created');
    
    // Test again
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ Verified: Users table exists with ${result[0].count} rows`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testUserTable();
