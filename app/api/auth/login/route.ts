import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { createHash } from "crypto"

const sql = neon(process.env.DATABASE_URL!)

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }
  try {
    const password_hash = hashPassword(password)
    const [user] = (await sql`
      SELECT id, email, display_name FROM users WHERE email = ${email} AND password_hash = ${password_hash}
    `) as { id: string; email: string; display_name: string }[]
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }
    // Set session cookie (for demo, just return user)
    return NextResponse.json({ id: user.id, email: user.email, displayName: user.display_name })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 })
  }
}
