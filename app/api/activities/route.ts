import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authHeader.split(" ")[1];
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get recent activities from various sources
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const currentYear = currentDate.getFullYear();

    // Get recent budget updates (actual amounts added/updated)
    const budgetActivities = await sql`
      SELECT 
        'budget_update' as type,
        category as description,
        'Budget Update' as category,
        actual_amount as amount,
        updated_at as date,
        CASE 
          WHEN actual_amount > 0 THEN 'expense'
          ELSE 'income'
        END as transaction_type
      FROM budgets 
      WHERE user_id = ${userId} 
        AND month = ${currentMonth} 
        AND year = ${currentYear}
        AND actual_amount > 0
      ORDER BY updated_at DESC 
      LIMIT 3
    `;

    // Get recent savings contributions
    const savingsActivities = await sql`
      SELECT 
        'savings_contribution' as type,
        name as description,
        'Savings Goal' as category,
        current_amount as amount,
        updated_at as date,
        'savings' as transaction_type
      FROM savings_goals 
      WHERE user_id = ${userId} 
        AND current_amount > 0
      ORDER BY updated_at DESC 
      LIMIT 2
    `;

    // Get recent debt payments (calculate from original vs current)
    const debtActivities = await sql`
      SELECT 
        'debt_payment' as type,
        name as description,
        'Debt Payment' as category,
        monthly_payment as amount,
        updated_at as date,
        'payment' as transaction_type
      FROM debts 
      WHERE user_id = ${userId} 
        AND monthly_payment > 0
      ORDER BY updated_at DESC 
      LIMIT 2
    `;

    // Combine all activities
    const allActivities = [
      ...budgetActivities.map((activity: any) => ({
        id: `budget_${activity.description}`,
        type: activity.type,
        description: activity.description,
        category: activity.category,
        amount: parseFloat(activity.amount),
        date: activity.date,
        transactionType: activity.transaction_type
      })),
      ...savingsActivities.map((activity: any) => ({
        id: `savings_${activity.description}`,
        type: activity.type,
        description: activity.description,
        category: activity.category,
        amount: parseFloat(activity.amount),
        date: activity.date,
        transactionType: activity.transaction_type
      })),
      ...debtActivities.map((activity: any) => ({
        id: `debt_${activity.description}`,
        type: activity.type,
        description: activity.description,
        category: activity.category,
        amount: parseFloat(activity.amount),
        date: activity.date,
        transactionType: activity.transaction_type
      }))
    ];

    // Sort by date and take most recent 5
    const recentActivities = allActivities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // If no real activities, provide some sample based on actual data
    if (recentActivities.length === 0) {
      // Get some basic data to create meaningful sample activities
      const totalBudget = await sql`
        SELECT COALESCE(SUM(budgeted_amount), 0) as total
        FROM budgets 
        WHERE user_id = ${userId} AND month = ${currentMonth} AND year = ${currentYear}
      `;

      const totalSavings = await sql`
        SELECT COALESCE(SUM(current_amount), 0) as total
        FROM savings_goals 
        WHERE user_id = ${userId} AND is_completed = false
      `;

      const totalDebt = await sql`
        SELECT COALESCE(SUM(current_balance), 0) as total
        FROM debts 
        WHERE user_id = ${userId} AND is_paid_off = false
      `;

      const sampleActivities = [];
      
      if (parseFloat(totalBudget[0]?.total || "0") > 0) {
        sampleActivities.push({
          id: "sample_budget",
          type: "budget_update",
          description: "Monthly Budget Setup",
          category: "Budget Management",
          amount: parseFloat(totalBudget[0].total),
          date: new Date().toISOString(),
          transactionType: "setup"
        });
      }

      if (parseFloat(totalSavings[0]?.total || "0") > 0) {
        sampleActivities.push({
          id: "sample_savings",
          type: "savings_contribution",
          description: "Savings Progress",
          category: "Savings Goal",
          amount: parseFloat(totalSavings[0].total),
          date: new Date().toISOString(),
          transactionType: "savings"
        });
      }

      if (parseFloat(totalDebt[0]?.total || "0") > 0) {
        sampleActivities.push({
          id: "sample_debt",
          type: "debt_tracking",
          description: "Debt Management",
          category: "Debt Tracking",
          amount: parseFloat(totalDebt[0].total),
          date: new Date().toISOString(),
          transactionType: "tracking"
        });
      }

      return NextResponse.json({ 
        activities: sampleActivities.length > 0 ? sampleActivities : [{
          id: "welcome",
          type: "welcome",
          description: "Welcome to FinanceApp",
          category: "Getting Started",
          amount: 0,
          date: new Date().toISOString(),
          transactionType: "info"
        }]
      });
    }

    return NextResponse.json({ activities: recentActivities });

  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
