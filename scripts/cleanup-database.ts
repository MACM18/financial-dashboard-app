import { Pool } from '@neondatabase/serverless';

async function cleanupTransactionalData() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('🧹 Starting cleanup of transactional data...');

    // Start a transaction to ensure all operations complete together
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Delete all transfers (this will also update account balances via triggers)
      const transferResult = await client.query('DELETE FROM transfers');
      console.log(`✅ Deleted ${transferResult.rowCount} transfers`);

      // 2. Delete all transactions (this will also update account balances via triggers)
      const transactionResult = await client.query('DELETE FROM transactions');
      console.log(`✅ Deleted ${transactionResult.rowCount} transactions`);

      // 3. Reset all account balances to 0 (since we deleted all transactions)
      const accountResetResult = await client.query('UPDATE accounts SET balance = 0');
      console.log(`✅ Reset ${accountResetResult.rowCount} account balances to $0`);

      // 4. Delete all accounts
      const accountResult = await client.query('DELETE FROM accounts');
      console.log(`✅ Deleted ${accountResult.rowCount} accounts`);

      // 5. Clear budget data
      const budgetResult = await client.query('DELETE FROM budgets');
      console.log(`✅ Deleted ${budgetResult.rowCount} budget entries`);

      // 6. Clear savings goals
      const savingsResult = await client.query('DELETE FROM savings_goals');
      console.log(`✅ Deleted ${savingsResult.rowCount} savings goals`);

      // 7. Clear debt data
      const debtPaymentResult = await client.query('DELETE FROM debt_payments');
      console.log(`✅ Deleted ${debtPaymentResult.rowCount} debt payments`);

      const debtResult = await client.query('DELETE FROM debts');
      console.log(`✅ Deleted ${debtResult.rowCount} debts`);

      // 8. Clear user preferences

      // Commit the transaction
      await client.query('COMMIT');
      console.log('✅ All transactional data cleanup completed successfully!');

      // Show remaining data
      console.log('\n📊 Remaining data summary:');
      
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`👥 Users: ${userCount.rows[0].count}`);

      const accountTypeCount = await client.query('SELECT COUNT(*) FROM account_types');
      console.log(`🏦 Account Types: ${accountTypeCount.rows[0].count}`);

      const categoryCount = await client.query('SELECT COUNT(*) FROM transaction_categories');
      console.log(`📂 Transaction Categories: ${categoryCount.rows[0].count}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Optional: Keep reference data (account types and transaction categories)
async function cleanupButKeepReferenceData() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('🧹 Starting cleanup of user data (keeping reference data)...');

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Delete user-specific data only
      const transferResult = await client.query('DELETE FROM transfers');
      console.log(`✅ Deleted ${transferResult.rowCount} transfers`);

      const transactionResult = await client.query('DELETE FROM transactions');
      console.log(`✅ Deleted ${transactionResult.rowCount} transactions`);

      const accountResult = await client.query('DELETE FROM accounts');
      console.log(`✅ Deleted ${accountResult.rowCount} accounts`);

      const budgetResult = await client.query('DELETE FROM budgets');
      console.log(`✅ Deleted ${budgetResult.rowCount} budget entries`);

      const savingsResult = await client.query('DELETE FROM savings_goals');
      console.log(`✅ Deleted ${savingsResult.rowCount} savings goals`);

      const debtPaymentResult = await client.query('DELETE FROM debt_payments');
      console.log(`✅ Deleted ${debtPaymentResult.rowCount} debt payments`);

      const debtResult = await client.query('DELETE FROM debts');
      console.log(`✅ Deleted ${debtResult.rowCount} debts`);


      await client.query('COMMIT');
      console.log('✅ User data cleanup completed successfully!');
      console.log('ℹ️  Reference data (account types, transaction categories) preserved');

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run cleanup based on command line argument
const args = process.argv.slice(2);
const keepReferenceData = args.includes('--keep-reference');

if (keepReferenceData) {
  cleanupButKeepReferenceData();
} else {
  cleanupTransactionalData();
}
