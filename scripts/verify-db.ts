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

async function verifyDatabase() {
  const sql = neon(DATABASE_URL!);
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected successfully');
    console.log(`   Current time: ${result[0].current_time}`);

    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('\n📋 Tables in database:');
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found. You may need to run the SQL setup script.');
    } else {
      tables.forEach((table: any) => {
        console.log(`   ✓ ${table.table_name}`);
      });
    }

    // Check for users table specifically
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
      console.log('\n⚠️  Users table not found. Authentication may not work.');
    }

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

verifyDatabase().then(() => {
  console.log('\n✨ Database verification complete!');
  process.exit(0);
});
