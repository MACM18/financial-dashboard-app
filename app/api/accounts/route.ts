import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get all accounts for the user with account type information
    const accounts = await sql`
      SELECT 
        a.id,
        a.name,
        a.balance,
        a.currency,
        a.description,
        a.is_active,
        a.created_at,
        at.name as account_type,
        at.description as account_type_description,
        at.icon as account_type_icon
      FROM accounts a
      JOIN account_types at ON a.account_type_id = at.id
      WHERE a.user_id = ${userId}
      ORDER BY a.is_active DESC, a.created_at DESC
    `

    const formattedAccounts = accounts.map(account => ({
      id: account.id.toString(),
      name: account.name,
      balance: Number(account.balance),
      currency: account.currency,
      description: account.description,
      isActive: account.is_active,
      accountType: {
        name: account.account_type,
        description: account.account_type_description,
        icon: account.account_type_icon
      },
      createdAt: account.created_at
    }))

    return NextResponse.json({ accounts: formattedAccounts })

  } catch (error) {
    console.error('Accounts GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
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
    const { name, accountType, balance = 0, currency = 'USD', description = '' } = await request.json()

    if (!userId || !name || !accountType) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, accountType' 
      }, { status: 400 })
    }

    // Get account type ID
    const accountTypeResult = await sql`
      SELECT id FROM account_types WHERE name = ${accountType}
    `

    if (accountTypeResult.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid account type' 
      }, { status: 400 })
    }

    const accountTypeId = accountTypeResult[0].id

    // Create new account
    const result = await sql`
      INSERT INTO accounts (user_id, name, account_type_id, balance, currency, description)
      VALUES (${userId}, ${name}, ${accountTypeId}, ${balance}, ${currency}, ${description})
      RETURNING 
        id, name, balance, currency, description, is_active, created_at,
        (SELECT at.name FROM account_types at WHERE at.id = ${accountTypeId}) as account_type,
        (SELECT at.description FROM account_types at WHERE at.id = ${accountTypeId}) as account_type_description,
        (SELECT at.icon FROM account_types at WHERE at.id = ${accountTypeId}) as account_type_icon
    `

    const newAccount = {
      id: result[0].id.toString(),
      name: result[0].name,
      balance: Number(result[0].balance),
      currency: result[0].currency,
      description: result[0].description,
      isActive: result[0].is_active,
      accountType: {
        name: result[0].account_type,
        description: result[0].account_type_description,
        icon: result[0].account_type_icon
      },
      createdAt: result[0].created_at
    }

    return NextResponse.json({ account: newAccount })

  } catch (error) {
    console.error('Accounts POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
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
    const { id, name, description, isActive } = await request.json()

    if (!userId || !id) {
      return NextResponse.json({ 
        error: 'Missing required fields: id' 
      }, { status: 400 })
    }

    const result = await sql`
      UPDATE accounts 
      SET 
        name = ${name},
        description = ${description},
        is_active = ${isActive !== undefined ? isActive : true},
        updated_at = NOW()
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING 
        id, name, balance, currency, description, is_active, created_at,
        (SELECT at.name FROM account_types at WHERE at.id = account_type_id) as account_type,
        (SELECT at.description FROM account_types at WHERE at.id = account_type_id) as account_type_description,
        (SELECT at.icon FROM account_types at WHERE at.id = account_type_id) as account_type_icon
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const updatedAccount = {
      id: result[0].id.toString(),
      name: result[0].name,
      balance: Number(result[0].balance),
      currency: result[0].currency,
      description: result[0].description,
      isActive: result[0].is_active,
      accountType: {
        name: result[0].account_type,
        description: result[0].account_type_description,
        icon: result[0].account_type_icon
      },
      createdAt: result[0].created_at
    }

    return NextResponse.json({ account: updatedAccount })

  } catch (error) {
    console.error('Accounts PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
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

    // Check if account has transactions
    const transactionCount = await sql`
      SELECT COUNT(*) as count FROM transactions WHERE account_id = ${parseInt(id)} AND user_id = ${userId}
    `

    if (transactionCount[0].count > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete account with existing transactions. Please deactivate instead.' 
      }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM accounts 
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Accounts DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
