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
