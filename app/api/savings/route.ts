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

    const goals = await sql`
      SELECT id, name, target_amount, current_amount, monthly_contribution, category, target_date, is_completed
      FROM savings_goals 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    const formattedGoals = goals.map(goal => ({
      id: goal.id.toString(),
      name: goal.name,
      targetAmount: Number(goal.target_amount),
      currentAmount: Number(goal.current_amount),
      monthlyContribution: Number(goal.monthly_contribution),
      category: goal.category,
      targetDate: goal.target_date ? new Date(goal.target_date).toISOString() : null,
      isCompleted: goal.is_completed
    }))

    return NextResponse.json({ goals: formattedGoals })

  } catch (error) {
    console.error('Savings goals GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch savings goals' },
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
    const { name, targetAmount, currentAmount = 0, monthlyContribution, category, targetDate } = await request.json()

    if (!userId || !name || !targetAmount || !monthlyContribution || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, targetAmount, monthlyContribution, category' 
      }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO savings_goals (user_id, name, target_amount, current_amount, monthly_contribution, category, target_date)
      VALUES (${userId}, ${name}, ${targetAmount}, ${currentAmount}, ${monthlyContribution}, ${category}, ${targetDate ? new Date(targetDate) : null})
      RETURNING id, name, target_amount, current_amount, monthly_contribution, category, target_date, is_completed
    `

    const newGoal = {
      id: result[0].id.toString(),
      name: result[0].name,
      targetAmount: Number(result[0].target_amount),
      currentAmount: Number(result[0].current_amount),
      monthlyContribution: Number(result[0].monthly_contribution),
      category: result[0].category,
      targetDate: result[0].target_date ? new Date(result[0].target_date).toISOString() : null,
      isCompleted: result[0].is_completed
    }

    return NextResponse.json({ goal: newGoal })

  } catch (error) {
    console.error('Savings goals POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create savings goal' },
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
    const { id, name, targetAmount, currentAmount, monthlyContribution, category, targetDate, isCompleted } = await request.json()

    if (!userId || !id) {
      return NextResponse.json({ 
        error: 'Missing required fields: id' 
      }, { status: 400 })
    }

    const result = await sql`
      UPDATE savings_goals 
      SET 
        name = ${name},
        target_amount = ${targetAmount},
        current_amount = ${currentAmount},
        monthly_contribution = ${monthlyContribution},
        category = ${category},
        target_date = ${targetDate ? new Date(targetDate) : null},
        is_completed = ${isCompleted || false},
        updated_at = NOW()
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING id, name, target_amount, current_amount, monthly_contribution, category, target_date, is_completed
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 })
    }

    const updatedGoal = {
      id: result[0].id.toString(),
      name: result[0].name,
      targetAmount: Number(result[0].target_amount),
      currentAmount: Number(result[0].current_amount),
      monthlyContribution: Number(result[0].monthly_contribution),
      category: result[0].category,
      targetDate: result[0].target_date ? new Date(result[0].target_date).toISOString() : null,
      isCompleted: result[0].is_completed
    }

    return NextResponse.json({ goal: updatedGoal })

  } catch (error) {
    console.error('Savings goals PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update savings goal' },
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
      DELETE FROM savings_goals 
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Savings goals DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete savings goal' },
      { status: 500 }
    )
  }
}
