import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET /api/debts
export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization")
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const userId = authHeader.replace("Bearer ", "")
		if (!userId) {
			return NextResponse.json({ error: "User ID required" }, { status: 400 })
		}

		const debts = await sql`
			SELECT id, name, original_amount, total_amount, current_balance, minimum_payment, monthly_payment, interest_rate, due_date, debt_type, is_paid_off
			FROM debts
			WHERE user_id = ${userId}
			ORDER BY created_at DESC
		`

		const formatted = debts.map((d: any) => ({
			id: d.id.toString(),
			name: d.name,
			// Provide both for compatibility across components
			originalAmount: Number(d.original_amount ?? d.total_amount ?? 0),
			totalAmount: Number(d.total_amount ?? d.original_amount ?? 0),
			currentBalance: Number(d.current_balance ?? 0),
			minimumPayment: Number(d.minimum_payment ?? 0),
			monthlyPayment: Number(d.monthly_payment ?? d.minimum_payment ?? 0),
			interestRate: Number(d.interest_rate ?? 0),
			dueDate: d.due_date ? new Date(d.due_date).toISOString() : null,
			debtType: d.debt_type,
			isPaidOff: Boolean(d.is_paid_off),
		}))

		return NextResponse.json({ debts: formatted })
	} catch (error) {
		console.error("Debts GET error:", error)
		return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 })
	}
}

// POST /api/debts
export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization")
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const userId = authHeader.replace("Bearer ", "")
		const body = await request.json().catch(() => null)
		if (!body) {
			return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
		}

		const {
			name,
			totalAmount,
			currentBalance,
			minimumPayment,
			interestRate = 0,
			dueDate = null,
			debtType,
		} = body as Record<string, any>

		if (!userId || !name || totalAmount == null || currentBalance == null || minimumPayment == null || !debtType) {
			return NextResponse.json(
				{ error: "Missing required fields: name, totalAmount, currentBalance, minimumPayment, debtType" },
				{ status: 400 }
			)
		}

		const inserted = await sql`
			INSERT INTO debts (
				user_id, name, original_amount, total_amount, current_balance,
				monthly_payment, minimum_payment, interest_rate, due_date, debt_type
			)
			VALUES (
				${userId}, ${name}, ${totalAmount}, ${totalAmount}, ${currentBalance},
				${minimumPayment}, ${minimumPayment}, ${interestRate}, ${dueDate ? new Date(dueDate) : null}, ${debtType}
			)
			RETURNING id, name, original_amount, total_amount, current_balance, minimum_payment, monthly_payment, interest_rate, due_date, debt_type, is_paid_off
		`

		const r = inserted[0] as any
		const debt = {
			id: r.id.toString(),
			name: r.name,
			originalAmount: Number(r.original_amount ?? r.total_amount ?? 0),
			totalAmount: Number(r.total_amount ?? r.original_amount ?? 0),
			currentBalance: Number(r.current_balance ?? 0),
			minimumPayment: Number(r.minimum_payment ?? 0),
			monthlyPayment: Number(r.monthly_payment ?? r.minimum_payment ?? 0),
			interestRate: Number(r.interest_rate ?? 0),
			dueDate: r.due_date ? new Date(r.due_date).toISOString() : null,
			debtType: r.debt_type,
			isPaidOff: Boolean(r.is_paid_off),
		}

		return NextResponse.json({ debt })
	} catch (error) {
		console.error("Debts POST error:", error)
		return NextResponse.json({ error: "Failed to create debt" }, { status: 500 })
	}
}

// PUT /api/debts
export async function PUT(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization")
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const userId = authHeader.replace("Bearer ", "")
		const body = await request.json().catch(() => null)
		if (!body) {
			return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
		}

		const {
			id,
			name,
			totalAmount,
			currentBalance,
			minimumPayment,
			interestRate,
			dueDate,
			debtType,
			isPaidOff,
		} = body as Record<string, any>

		if (!userId || !id) {
			return NextResponse.json({ error: "Missing required field: id" }, { status: 400 })
		}

		// Load existing values to support partial updates
		const existing = await sql`SELECT * FROM debts WHERE id = ${parseInt(id)} AND user_id = ${userId}`
		if (existing.length === 0) {
			return NextResponse.json({ error: "Debt not found" }, { status: 404 })
		}
		const prev = existing[0] as any

		const nextName = name ?? prev.name
		const nextTotal = totalAmount ?? prev.total_amount ?? prev.original_amount
		const nextBalance = currentBalance ?? prev.current_balance
		const nextMinPay = minimumPayment ?? prev.minimum_payment
		const nextMonthly = prev.monthly_payment ?? nextMinPay
		const nextRate = interestRate ?? prev.interest_rate ?? 0
		const nextDue = dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : prev.due_date
		const nextType = debtType ?? prev.debt_type
		const nextPaid = isPaidOff ?? prev.is_paid_off ?? (nextBalance === 0)

		const updated = await sql`
			UPDATE debts
			SET 
				name = ${nextName},
				total_amount = ${nextTotal},
				current_balance = ${nextBalance},
				minimum_payment = ${nextMinPay},
				monthly_payment = ${nextMonthly},
				interest_rate = ${nextRate},
				due_date = ${nextDue},
				debt_type = ${nextType},
				is_paid_off = ${nextPaid},
				updated_at = NOW()
			WHERE id = ${parseInt(id)} AND user_id = ${userId}
			RETURNING id, name, original_amount, total_amount, current_balance, minimum_payment, monthly_payment, interest_rate, due_date, debt_type, is_paid_off
		`

		const r = updated[0] as any
		const debt = {
			id: r.id.toString(),
			name: r.name,
			originalAmount: Number(r.original_amount ?? r.total_amount ?? 0),
			totalAmount: Number(r.total_amount ?? r.original_amount ?? 0),
			currentBalance: Number(r.current_balance ?? 0),
			minimumPayment: Number(r.minimum_payment ?? 0),
			monthlyPayment: Number(r.monthly_payment ?? r.minimum_payment ?? 0),
			interestRate: Number(r.interest_rate ?? 0),
			dueDate: r.due_date ? new Date(r.due_date).toISOString() : null,
			debtType: r.debt_type,
			isPaidOff: Boolean(r.is_paid_off),
		}

		return NextResponse.json({ debt })
	} catch (error) {
		console.error("Debts PUT error:", error)
		return NextResponse.json({ error: "Failed to update debt" }, { status: 500 })
	}
}

// DELETE /api/debts?id=123
export async function DELETE(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization")
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}
		const userId = authHeader.replace("Bearer ", "")

		const { searchParams } = new URL(request.url)
		const id = searchParams.get("id")
		if (!id) {
			return NextResponse.json({ error: "Missing required field: id" }, { status: 400 })
		}

		const result = await sql`
			DELETE FROM debts
			WHERE id = ${parseInt(id)} AND user_id = ${userId}
			RETURNING id
		`

		if (result.length === 0) {
			return NextResponse.json({ error: "Debt not found" }, { status: 404 })
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Debts DELETE error:", error)
		return NextResponse.json({ error: "Failed to delete debt" }, { status: 500 })
	}
}

