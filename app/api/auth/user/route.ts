import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  // For demo: get userId from query param or cookie (replace with real session logic in prod)
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ user: null })
  const [user] = (await sql`
    SELECT id, email, display_name FROM users WHERE id = ${userId}
  `) as { id: string; email: string; display_name: string }[]
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({ user: { id: user.id, email: user.email, displayName: user.display_name } })
}
