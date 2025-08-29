import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { randomBytes, createHash } from "crypto"

const sql = neon(process.env.DATABASE_URL!)

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

function generateId() {
  return randomBytes(16).toString("hex")
}

export async function POST(req: NextRequest) {
  const { email, password, displayName } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }
  try {
    const id = generateId()
    const password_hash = hashPassword(password)
    const [user] = (await sql`
      INSERT INTO users (id, email, display_name, password_hash)
      VALUES (${id}, ${email}, ${displayName}, ${password_hash})
      RETURNING id, email, display_name
    `) as { id: string; email: string; display_name: string }[]
    // Set session cookie (for demo, just return user)
    return NextResponse.json({ id: user.id, email: user.email, displayName: user.display_name })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 })
  }
}
