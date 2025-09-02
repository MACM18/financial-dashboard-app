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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon, color, isIncome } = body

    if (!name || !description || !icon || !color || typeof isIncome !== 'boolean') {
      return NextResponse.json(
        { error: 'Name, description, icon, color, and isIncome are required' },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existingCategory = await sql`
      SELECT id FROM transaction_categories 
      WHERE LOWER(name) = LOWER(${name}) AND is_income = ${isIncome}
    `

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Category with this name already exists for this transaction type' },
        { status: 400 }
      )
    }

    // Create new category
    const result = await sql`
      INSERT INTO transaction_categories (name, description, icon, color, is_income)
      VALUES (${name}, ${description}, ${icon}, ${color}, ${isIncome})
      RETURNING id, name, description, icon, color, is_income
    `

    const newCategory = {
      id: result[0].id.toString(),
      name: result[0].name,
      description: result[0].description,
      icon: result[0].icon,
      color: result[0].color,
      isIncome: result[0].is_income
    }

    return NextResponse.json({ category: newCategory }, { status: 201 })

  } catch (error) {
    console.error('Transaction categories POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
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

    const body = await request.json()
    const { id, name, description, icon, color, isIncome } = body

    if (!id || !name || !description || !icon || !color || typeof isIncome !== 'boolean') {
      return NextResponse.json(
        { error: 'ID, name, description, icon, color, and isIncome are required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await sql`
      SELECT id FROM transaction_categories WHERE id = ${id}
    `

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if another category with the same name exists
    const duplicateCategory = await sql`
      SELECT id FROM transaction_categories 
      WHERE LOWER(name) = LOWER(${name}) AND is_income = ${isIncome} AND id != ${id}
    `

    if (duplicateCategory.length > 0) {
      return NextResponse.json(
        { error: 'Category with this name already exists for this transaction type' },
        { status: 400 }
      )
    }

    // Update category
    const result = await sql`
      UPDATE transaction_categories 
      SET name = ${name}, description = ${description}, icon = ${icon}, 
          color = ${color}, is_income = ${isIncome}
      WHERE id = ${id}
      RETURNING id, name, description, icon, color, is_income
    `

    const updatedCategory = {
      id: result[0].id.toString(),
      name: result[0].name,
      description: result[0].description,
      icon: result[0].icon,
      color: result[0].color,
      isIncome: result[0].is_income
    }

    return NextResponse.json({ category: updatedCategory })

  } catch (error) {
    console.error('Transaction categories PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Check if category is being used by any transactions
    const transactionsUsingCategory = await sql`
      SELECT COUNT(*) as count FROM transactions WHERE category_id = ${id}
    `

    if (transactionsUsingCategory[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by existing transactions' },
        { status: 400 }
      )
    }

    // Delete category
    const result = await sql`
      DELETE FROM transaction_categories WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Category deleted successfully' })

  } catch (error) {
    console.error('Transaction categories DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
