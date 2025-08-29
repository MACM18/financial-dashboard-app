import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Use current month/year if not provided
    const now = new Date()
    const currentMonth = month || (now.getMonth() + 1).toString().padStart(2, '0')
    const currentYear = year || now.getFullYear().toString()

    const budgets = await sql`
      SELECT id, category, budgeted_amount, actual_amount, notes, month, year
      FROM budgets 
      WHERE user_id = ${userId} 
        AND month = ${currentMonth} 
        AND year = ${parseInt(currentYear)}
      ORDER BY category
    `

    const formattedBudgets = budgets.map(budget => ({
      id: budget.id.toString(),
      category: budget.category,
      budgetedAmount: Number(budget.budgeted_amount),
      actualAmount: Number(budget.actual_amount),
      notes: budget.notes || '',
      month: budget.month,
      year: budget.year
    }))

    return NextResponse.json({ budgets: formattedBudgets })

  } catch (error) {
    console.error('Budget GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
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
    const { category, budgetedAmount, actualAmount = 0, notes = '', month, year } = await request.json()

    if (!userId || !category || budgetedAmount === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: category, budgetedAmount' 
      }, { status: 400 })
    }

    // Use current month/year if not provided
    const now = new Date()
    const currentMonth = month || (now.getMonth() + 1).toString().padStart(2, '0')
    const currentYear = year || now.getFullYear()

    const result = await sql`
      INSERT INTO budgets (user_id, category, budgeted_amount, actual_amount, notes, month, year)
      VALUES (${userId}, ${category}, ${budgetedAmount}, ${actualAmount}, ${notes}, ${currentMonth}, ${currentYear})
      RETURNING id, category, budgeted_amount, actual_amount, notes, month, year
    `

    const newBudget = {
      id: result[0].id.toString(),
      category: result[0].category,
      budgetedAmount: Number(result[0].budgeted_amount),
      actualAmount: Number(result[0].actual_amount),
      notes: result[0].notes || '',
      month: result[0].month,
      year: result[0].year
    }

    return NextResponse.json({ budget: newBudget })

  } catch (error) {
    console.error('Budget POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create budget' },
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
    const { id, category, budgetedAmount, actualAmount, notes } = await request.json()

    if (!userId || !id) {
      return NextResponse.json({ 
        error: 'Missing required fields: id' 
      }, { status: 400 })
    }

    const result = await sql`
      UPDATE budgets 
      SET 
        category = ${category},
        budgeted_amount = ${budgetedAmount},
        actual_amount = ${actualAmount},
        notes = ${notes || ''},
        updated_at = NOW()
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING id, category, budgeted_amount, actual_amount, notes, month, year
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    const updatedBudget = {
      id: result[0].id.toString(),
      category: result[0].category,
      budgetedAmount: Number(result[0].budgeted_amount),
      actualAmount: Number(result[0].actual_amount),
      notes: result[0].notes || '',
      month: result[0].month,
      year: result[0].year
    }

    return NextResponse.json({ budget: updatedBudget })

  } catch (error) {
    console.error('Budget PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update budget' },
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
      DELETE FROM budgets 
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Budget DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
}
