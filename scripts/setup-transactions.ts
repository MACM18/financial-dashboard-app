import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

// Load environment variables
config()

async function setupTransactionTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    console.log('🚀 Setting up accounts and transactions tables...')

    console.log('Creating tables step by step...')

    // 1. Create account_types table
    console.log('Creating account_types table...')
    await sql`
      CREATE TABLE IF NOT EXISTS account_types (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          icon TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // 2. Insert default account types
    console.log('Inserting default account types...')
    await sql`
      INSERT INTO account_types (name, description, icon) VALUES
          ('cash', 'Physical cash and cash equivalents', 'Banknote'),
          ('checking', 'Bank checking account', 'CreditCard'),
          ('savings', 'Bank savings account', 'PiggyBank'),
          ('credit_card', 'Credit card account', 'CreditCard'),
          ('investment', 'Investment and brokerage accounts', 'TrendingUp'),
          ('crypto', 'Cryptocurrency wallets', 'Bitcoin'),
          ('other', 'Other financial accounts', 'Wallet')
      ON CONFLICT (name) DO NOTHING
    `

    // 3. Create accounts table
    console.log('Creating accounts table...')
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          account_type_id INTEGER NOT NULL REFERENCES account_types(id),
          balance DECIMAL(15,2) NOT NULL DEFAULT 0,
          currency TEXT DEFAULT 'USD',
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // 4. Create transaction_categories table
    console.log('Creating transaction_categories table...')
    await sql`
      CREATE TABLE IF NOT EXISTS transaction_categories (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          icon TEXT,
          color TEXT,
          is_income BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // 5. Insert default transaction categories
    console.log('Inserting default transaction categories...')
    await sql`
      INSERT INTO transaction_categories (name, description, icon, color, is_income) VALUES
          ('salary', 'Regular salary and wages', 'DollarSign', 'green', true),
          ('freelance', 'Freelance work and side income', 'Briefcase', 'green', true),
          ('investment_income', 'Dividends, interest, and investment returns', 'TrendingUp', 'green', true),
          ('gift', 'Gifts and monetary presents', 'Gift', 'green', true),
          ('other_income', 'Other income sources', 'Plus', 'green', true),
          ('food', 'Food and dining expenses', 'Utensils', 'red', false),
          ('transport', 'Transportation and fuel', 'Car', 'red', false),
          ('housing', 'Rent, mortgage, and utilities', 'Home', 'red', false),
          ('healthcare', 'Medical and health expenses', 'Heart', 'red', false),
          ('entertainment', 'Entertainment and leisure', 'Tv', 'red', false),
          ('shopping', 'Shopping and personal purchases', 'ShoppingBag', 'red', false),
          ('education', 'Education and learning expenses', 'BookOpen', 'red', false),
          ('insurance', 'Insurance premiums and fees', 'Shield', 'red', false),
          ('utilities', 'Electricity, water, internet, phone', 'Zap', 'red', false),
          ('debt_payment', 'Loan and debt payments', 'CreditCard', 'red', false),
          ('savings_transfer', 'Transfers to savings accounts', 'PiggyBank', 'blue', false),
          ('investment', 'Investment purchases', 'TrendingUp', 'blue', false),
          ('other_expense', 'Other miscellaneous expenses', 'Minus', 'red', false)
      ON CONFLICT (name) DO NOTHING
    `

    // 6. Create transactions table
    console.log('Creating transactions table...')
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          account_id INTEGER NOT NULL REFERENCES accounts(id),
          category_id INTEGER NOT NULL REFERENCES transaction_categories(id),
          amount DECIMAL(15,2) NOT NULL,
          description TEXT,
          transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
          is_recurring BOOLEAN DEFAULT FALSE,
          recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
          recurring_end_date TIMESTAMP WITH TIME ZONE,
          tags TEXT[],
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // 7. Create transfers table
    console.log('Creating transfers table...')
    await sql`
      CREATE TABLE IF NOT EXISTS transfers (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          from_account_id INTEGER NOT NULL REFERENCES accounts(id),
          to_account_id INTEGER NOT NULL REFERENCES accounts(id),
          amount DECIMAL(15,2) NOT NULL,
          description TEXT,
          transfer_date TIMESTAMP WITH TIME ZONE NOT NULL,
          fee DECIMAL(15,2) DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // 8. Create indexes
    console.log('Creating indexes...')
    await sql`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON accounts(user_id, is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_account ON transactions(user_id, account_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transfers_from_account ON transfers(from_account_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transfers_to_account ON transfers(to_account_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transfers_date ON transfers(transfer_date)`

    console.log('✅ Successfully created accounts and transactions tables!')
    
    // Test the setup by checking if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'transactions', 'account_types', 'transaction_categories', 'transfers')
      ORDER BY table_name
    `
    
    console.log('📋 Created tables:', tables.map(t => t.table_name).join(', '))

    // Check if default data was inserted
    const accountTypes = await sql`SELECT COUNT(*) as count FROM account_types`
    const transactionCategories = await sql`SELECT COUNT(*) as count FROM transaction_categories`
    
    console.log(`📊 Account types: ${accountTypes[0].count}`)
    console.log(`📊 Transaction categories: ${transactionCategories[0].count}`)

  } catch (error) {
    console.error('❌ Error setting up tables:', error)
    throw error
  }
}

// Run the setup
setupTransactionTables()
  .then(() => {
    console.log('🎉 Transaction system setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
