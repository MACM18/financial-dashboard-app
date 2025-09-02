import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

interface UserPreferences {
  user_id: string;
  currency: string;
  theme: string;
  notifications: boolean;
  budget_alerts: boolean;
  monthly_budget: number | null;
  created_at: Date;
  updated_at: Date;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user preferences
    const result = await sql`
      SELECT * FROM user_preferences WHERE user_id = ${userId}
    `;

    let preferences = result[0] as UserPreferences | undefined;

    // If no preferences exist, create default ones
    if (!preferences) {
      const defaultPreferences = {
        user_id: userId,
        currency: 'LKR', // Default to LKR as specified in the issue
        theme: 'system',
        notifications: true,
        budget_alerts: true,
        monthly_budget: null
      };

      const createResult = await sql`
        INSERT INTO user_preferences (user_id, currency, theme, notifications, budget_alerts, monthly_budget)
        VALUES (${userId}, ${defaultPreferences.currency}, ${defaultPreferences.theme}, ${defaultPreferences.notifications}, ${defaultPreferences.budget_alerts}, ${defaultPreferences.monthly_budget})
        RETURNING *
      `;

      preferences = createResult[0] as UserPreferences;
    }

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('User preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { currency, theme, notifications, budget_alerts, monthly_budget } = body;

    // Update user preferences
    const result = await sql`
      INSERT INTO user_preferences (user_id, currency, theme, notifications, budget_alerts, monthly_budget)
      VALUES (${userId}, ${currency || 'LKR'}, ${theme || 'system'}, ${notifications ?? true}, ${budget_alerts ?? true}, ${monthly_budget})
      ON CONFLICT (user_id) 
      DO UPDATE SET
        currency = COALESCE(${currency}, user_preferences.currency),
        theme = COALESCE(${theme}, user_preferences.theme),
        notifications = COALESCE(${notifications}, user_preferences.notifications),
        budget_alerts = COALESCE(${budget_alerts}, user_preferences.budget_alerts),
        monthly_budget = COALESCE(${monthly_budget}, user_preferences.monthly_budget),
        updated_at = NOW()
      RETURNING *
    `;

    const preferences = result[0] as UserPreferences;
    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('User preferences update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}