import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all available account types
    const accountTypes = await sql`
      SELECT id, name, description, icon
      FROM account_types
      ORDER BY name
    `

    const formattedAccountTypes = accountTypes.map(type => ({
      id: type.id.toString(),
      name: type.name,
      description: type.description,
      icon: type.icon
    }))

    return NextResponse.json({ accountTypes: formattedAccountTypes })

  } catch (error) {
    console.error('Account types GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account types' },
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
    const { name, description, icon } = body

    if (!name || !description || !icon) {
      return NextResponse.json(
        { error: 'Name, description, and icon are required' },
        { status: 400 }
      )
    }

    // Check if account type already exists
    const existingType = await sql`
      SELECT id FROM account_types WHERE LOWER(name) = LOWER(${name})
    `

    if (existingType.length > 0) {
      return NextResponse.json(
        { error: 'Account type with this name already exists' },
        { status: 400 }
      )
    }

    // Create new account type
    const result = await sql`
      INSERT INTO account_types (name, description, icon)
      VALUES (${name}, ${description}, ${icon})
      RETURNING id, name, description, icon
    `

    const newAccountType = {
      id: result[0].id.toString(),
      name: result[0].name,
      description: result[0].description,
      icon: result[0].icon
    }

    return NextResponse.json({ accountType: newAccountType }, { status: 201 })

  } catch (error) {
    console.error('Account types POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create account type' },
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
    const { id, name, description, icon } = body

    if (!id || !name || !description || !icon) {
      return NextResponse.json(
        { error: 'ID, name, description, and icon are required' },
        { status: 400 }
      )
    }

    // Check if account type exists
    const existingType = await sql`
      SELECT id FROM account_types WHERE id = ${id}
    `

    if (existingType.length === 0) {
      return NextResponse.json(
        { error: 'Account type not found' },
        { status: 404 }
      )
    }

    // Check if another account type with the same name exists
    const duplicateType = await sql`
      SELECT id FROM account_types WHERE LOWER(name) = LOWER(${name}) AND id != ${id}
    `

    if (duplicateType.length > 0) {
      return NextResponse.json(
        { error: 'Account type with this name already exists' },
        { status: 400 }
      )
    }

    // Update account type
    const result = await sql`
      UPDATE account_types 
      SET name = ${name}, description = ${description}, icon = ${icon}
      WHERE id = ${id}
      RETURNING id, name, description, icon
    `

    const updatedAccountType = {
      id: result[0].id.toString(),
      name: result[0].name,
      description: result[0].description,
      icon: result[0].icon
    }

    return NextResponse.json({ accountType: updatedAccountType })

  } catch (error) {
    console.error('Account types PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update account type' },
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

    // Check if account type is being used by any accounts
    const accountsUsingType = await sql`
      SELECT COUNT(*) as count FROM accounts WHERE account_type_id = ${id}
    `

    if (accountsUsingType[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account type that is being used by existing accounts' },
        { status: 400 }
      )
    }

    // Delete account type
    const result = await sql`
      DELETE FROM account_types WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Account type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Account type deleted successfully' })

  } catch (error) {
    console.error('Account types DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account type' },
      { status: 500 }
    )
  }
}
