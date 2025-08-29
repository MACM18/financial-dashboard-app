import { NextResponse } from "next/server"

export async function POST() {
  // For demo: just return success (clear session cookie in real app)
  return NextResponse.json({ success: true })
}
