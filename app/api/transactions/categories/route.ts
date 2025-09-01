import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'income' or 'expense'
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get transaction categories
    let categories
    if (type === 'income') {
      categories = await sql`
        SELECT id, name, description, icon, color, is_income
        FROM transaction_categories
        WHERE is_income = true
        ORDER BY name
      `
    } else if (type === 'expense') {
      categories = await sql`
        SELECT id, name, description, icon, color, is_income
        FROM transaction_categories
        WHERE is_income = false
        ORDER BY name
      `
    } else {
      categories = await sql`
        SELECT id, name, description, icon, color, is_income
        FROM transaction_categories
        ORDER BY is_income DESC, name
      `
    }

    const formattedCategories = categories.map(category => ({
      id: category.id.toString(),
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isIncome: category.is_income
    }))

    return NextResponse.json({ categories: formattedCategories })

  } catch (error) {
    console.error('Transaction categories GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction categories' },
      { status: 500 }
    )
  }
}
