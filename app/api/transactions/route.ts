import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Build the query conditions
    let whereConditions = [`t.user_id = '${userId}'`]
    
    if (accountId) {
      whereConditions.push(`t.account_id = ${parseInt(accountId)}`)
    }
    
    if (startDate) {
      whereConditions.push(`t.transaction_date >= '${startDate}'`)
    }
    
    if (endDate) {
      whereConditions.push(`t.transaction_date <= '${endDate}'`)
    }

    const whereClause = whereConditions.join(' AND ')

    // Get transactions with account and category information
    const transactions = await sql`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.transaction_date,
        t.is_recurring,
        t.recurring_frequency,
        t.tags,
        t.notes,
        t.created_at,
        a.name as account_name,
        a.currency as account_currency,
        at.name as account_type,
        at.icon as account_type_icon,
        tc.name as category_name,
        tc.description as category_description,
        tc.icon as category_icon,
        tc.color as category_color,
        tc.is_income as category_is_income
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN account_types at ON a.account_type_id = at.id
      JOIN transaction_categories tc ON t.category_id = tc.id
      WHERE t.user_id = ${userId}
        ${accountId ? sql`AND t.account_id = ${parseInt(accountId)}` : sql``}
        ${startDate ? sql`AND t.transaction_date >= ${startDate}` : sql``}
        ${endDate ? sql`AND t.transaction_date <= ${endDate}` : sql``}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id.toString(),
      amount: Number(transaction.amount),
      description: transaction.description,
      transactionDate: transaction.transaction_date,
      isRecurring: transaction.is_recurring,
      recurringFrequency: transaction.recurring_frequency,
      tags: transaction.tags || [],
      notes: transaction.notes,
      account: transaction.account_name ? {
        name: transaction.account_name,
        currency: transaction.account_currency,
        type: {
          name: transaction.account_type,
          icon: transaction.account_type_icon
        }
      } : {
        name: 'Deleted Account',
        currency: 'LKR',
        type: {
          name: 'deleted',
          icon: 'MoreHorizontal'
        }
      },
      category: {
        name: transaction.category_name,
        description: transaction.category_description,
        icon: transaction.category_icon,
        color: transaction.category_color,
        isIncome: transaction.category_is_income
      },
      createdAt: transaction.created_at
    }))

    // Get total count for pagination
    const totalResult = await sql`
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE t.user_id = ${userId}
        ${accountId ? sql`AND t.account_id = ${parseInt(accountId)}` : sql``}
        ${startDate ? sql`AND t.transaction_date >= ${startDate}` : sql``}
        ${endDate ? sql`AND t.transaction_date <= ${endDate}` : sql``}
    `

    const total = parseInt(totalResult[0].total)

    return NextResponse.json({ 
      transactions: formattedTransactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Transactions GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    const { 
      accountId, 
      categoryName, 
      amount, 
      description = '', 
      transactionDate = new Date().toISOString(),
      isRecurring = false,
      recurringFrequency = null,
      recurringEndDate = null,
      tags = [],
      notes = ''
    } = await request.json()

    if (!userId || !accountId || !categoryName || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: accountId, categoryName, amount' 
      }, { status: 400 })
    }

    // Verify account belongs to user
    const accountCheck = await sql`
      SELECT id FROM accounts WHERE id = ${parseInt(accountId)} AND user_id = ${userId}
    `

    if (accountCheck.length === 0) {
      return NextResponse.json({ 
        error: 'Account not found or not accessible' 
      }, { status: 404 })
    }

    // Get category ID
    const categoryResult = await sql`
      SELECT id FROM transaction_categories WHERE name = ${categoryName}
    `

    if (categoryResult.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid transaction category' 
      }, { status: 400 })
    }

    const categoryId = categoryResult[0].id

    // Create new transaction
    const result = await sql`
      INSERT INTO transactions (
        user_id, account_id, category_id, amount, description, 
        transaction_date, is_recurring, recurring_frequency, 
        recurring_end_date, tags, notes
      )
      VALUES (
        ${userId}, ${parseInt(accountId)}, ${categoryId}, ${amount}, ${description},
        ${transactionDate}, ${isRecurring}, ${recurringFrequency},
        ${recurringEndDate}, ${tags}, ${notes}
      )
      RETURNING 
        id, amount, description, transaction_date, is_recurring, 
        recurring_frequency, tags, notes, created_at
    `

    // Get the complete transaction data with joined information
    const completeTransaction = await sql`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.transaction_date,
        t.is_recurring,
        t.recurring_frequency,
        t.tags,
        t.notes,
        t.created_at,
        a.name as account_name,
        a.currency as account_currency,
        at.name as account_type,
        at.icon as account_type_icon,
        tc.name as category_name,
        tc.description as category_description,
        tc.icon as category_icon,
        tc.color as category_color,
        tc.is_income as category_is_income
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN account_types at ON a.account_type_id = at.id
      JOIN transaction_categories tc ON t.category_id = tc.id
      WHERE t.id = ${result[0].id}
    `

    const newTransaction = {
      id: completeTransaction[0].id.toString(),
      amount: Number(completeTransaction[0].amount),
      description: completeTransaction[0].description,
      transactionDate: completeTransaction[0].transaction_date,
      isRecurring: completeTransaction[0].is_recurring,
      recurringFrequency: completeTransaction[0].recurring_frequency,
      tags: completeTransaction[0].tags || [],
      notes: completeTransaction[0].notes,
      account: completeTransaction[0].account_name ? {
        name: completeTransaction[0].account_name,
        currency: completeTransaction[0].account_currency,
        type: {
          name: completeTransaction[0].account_type,
          icon: completeTransaction[0].account_type_icon
        }
      } : {
        name: 'Deleted Account',
        currency: 'LKR',
        type: {
          name: 'deleted',
          icon: 'MoreHorizontal'
        }
      },
      category: {
        name: completeTransaction[0].category_name,
        description: completeTransaction[0].category_description,
        icon: completeTransaction[0].category_icon,
        color: completeTransaction[0].category_color,
        isIncome: completeTransaction[0].category_is_income
      },
      createdAt: completeTransaction[0].created_at
    }

    return NextResponse.json({ transaction: newTransaction })

  } catch (error) {
    console.error('Transactions POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    const { 
      id, 
      categoryName, 
      amount, 
      description, 
      transactionDate,
      tags,
      notes
    } = await request.json()

    if (!userId || !id) {
      return NextResponse.json({ 
        error: 'Missing required fields: id' 
      }, { status: 400 })
    }

    // Get category ID if categoryName is provided
    let categoryId = null
    if (categoryName) {
      const categoryResult = await sql`
        SELECT id FROM transaction_categories WHERE name = ${categoryName}
      `
      if (categoryResult.length === 0) {
        return NextResponse.json({ 
          error: 'Invalid transaction category' 
        }, { status: 400 })
      }
      categoryId = categoryResult[0].id
    }

    const result = await sql`
      UPDATE transactions 
      SET 
        category_id = COALESCE(${categoryId}, category_id),
        amount = COALESCE(${amount}, amount),
        description = COALESCE(${description}, description),
        transaction_date = COALESCE(${transactionDate}, transaction_date),
        tags = COALESCE(${tags}, tags),
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Get the updated transaction data
    const updatedTransaction = await sql`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.transaction_date,
        t.is_recurring,
        t.recurring_frequency,
        t.tags,
        t.notes,
        t.created_at,
        a.name as account_name,
        a.currency as account_currency,
        at.name as account_type,
        at.icon as account_type_icon,
        tc.name as category_name,
        tc.description as category_description,
        tc.icon as category_icon,
        tc.color as category_color,
        tc.is_income as category_is_income
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN account_types at ON a.account_type_id = at.id
      JOIN transaction_categories tc ON t.category_id = tc.id
      WHERE t.id = ${parseInt(id)}
    `

    const transaction = {
      id: updatedTransaction[0].id.toString(),
      amount: Number(updatedTransaction[0].amount),
      description: updatedTransaction[0].description,
      transactionDate: updatedTransaction[0].transaction_date,
      isRecurring: updatedTransaction[0].is_recurring,
      recurringFrequency: updatedTransaction[0].recurring_frequency,
      tags: updatedTransaction[0].tags || [],
      notes: updatedTransaction[0].notes,
      account: updatedTransaction[0].account_name ? {
        name: updatedTransaction[0].account_name,
        currency: updatedTransaction[0].account_currency,
        type: {
          name: updatedTransaction[0].account_type,
          icon: updatedTransaction[0].account_type_icon
        }
      } : {
        name: 'Deleted Account',
        currency: 'LKR',
        type: {
          name: 'deleted',
          icon: 'MoreHorizontal'
        }
      },
      category: {
        name: updatedTransaction[0].category_name,
        description: updatedTransaction[0].category_description,
        icon: updatedTransaction[0].category_icon,
        color: updatedTransaction[0].category_color,
        isIncome: updatedTransaction[0].category_is_income
      },
      createdAt: updatedTransaction[0].created_at
    }

    return NextResponse.json({ transaction })

  } catch (error) {
    console.error('Transactions PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')

    if (!userId || !id) {
      return NextResponse.json({ 
        error: 'Missing required fields: id' 
      }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM transactions 
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Transactions DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
