import { NextRequest, NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
export const revalidate = 0
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

    // Get current date info
    const now = new Date()
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0')
    const currentYear = now.getFullYear()
    const monthName = now.toLocaleString('default', { month: 'long' })

    // Get total budget for current month
    const budgetResult = await sql`
      SELECT 
        COALESCE(SUM(budgeted_amount), 0) as total_budget,
        COALESCE(SUM(actual_amount), 0) as total_spent
      FROM budgets 
      WHERE user_id = ${userId} 
        AND month = ${currentMonth} 
        AND year = ${currentYear}
    `

    // Get active savings goals
    const savingsResult = await sql`
      SELECT 
        COALESCE(SUM(current_amount), 0) as total_saved,
        COALESCE(SUM(target_amount), 0) as total_target
      FROM savings_goals 
      WHERE user_id = ${userId} 
        AND is_completed = false
    `

    // Get active debts
    const debtResult = await sql`
      SELECT 
        COALESCE(SUM(current_balance), 0) as total_debt
      FROM debts 
      WHERE user_id = ${userId} 
        AND is_active = true
    `

    // Get previous month's budget for comparison
    const prevMonth = currentMonth === '01' ? '12' : (parseInt(currentMonth) - 1).toString().padStart(2, '0')
    const prevYear = currentMonth === '01' ? currentYear - 1 : currentYear

    const prevBudgetResult = await sql`
      SELECT 
        COALESCE(SUM(actual_amount), 0) as prev_spent
      FROM budgets 
      WHERE user_id = ${userId} 
        AND month = ${prevMonth} 
        AND year = ${prevYear}
    `

    const totalBudget = Number(budgetResult[0]?.total_budget) || 0
    const totalSpent = Number(budgetResult[0]?.total_spent) || 0
    const totalSaved = Number(savingsResult[0]?.total_saved) || 0
    const totalTarget = Number(savingsResult[0]?.total_target) || 0
    const totalDebt = Number(debtResult[0]?.total_debt) || 0
    const prevSpent = Number(prevBudgetResult[0]?.prev_spent) || 0

    // Calculate statistics
    const remaining = totalBudget - totalSpent
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    const spendingChange = prevSpent > 0 ? ((totalSpent - prevSpent) / prevSpent) * 100 : 0
    const savingsProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

    const stats = [
      {
        title: `${monthName} Budget`,
        value: `$${totalBudget.toFixed(2)}`,
        change: remaining >= 0 ? `$${remaining.toFixed(2)} remaining` : `$${Math.abs(remaining).toFixed(2)} over budget`,
        trend: remaining >= 0 ? "up" : "down" as "up" | "down",
        icon: "DollarSign"
      },
      {
        title: "Total Spent",
        value: `$${totalSpent.toFixed(2)}`,
        change: `${spentPercentage.toFixed(1)}% of budget`,
        trend: spentPercentage <= 80 ? "up" : "down" as "up" | "down",
        icon: "TrendingDown"
      },
      {
        title: "Savings Progress",
        value: `$${totalSaved.toFixed(2)}`,
        change: `${savingsProgress.toFixed(1)}% of goal`,
        trend: savingsProgress > 0 ? "up" : "down" as "up" | "down",
        icon: "Target"
      },
      {
        title: "Total Debt",
        value: `$${totalDebt.toFixed(2)}`,
        change: totalDebt > 0 ? "Active debts" : "Debt free!",
        trend: totalDebt === 0 ? "up" : "down" as "up" | "down",
        icon: "TrendingUp"
      }
    ]

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
