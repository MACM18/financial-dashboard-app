"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrencySymbol, formatCurrency } from '@/lib/currency';

export interface UserPreferences {
  currency: string;
  theme: string;
  notifications: boolean;
  budget_alerts: boolean;
  monthly_budget: number | null;
}

export function useCurrency() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<string>('LKR'); // Default to LKR
  const [loading, setLoading] = useState(true);

  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/user/preferences`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrency(data.preferences?.currency || 'LKR');
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setCurrency('LKR'); // Fallback to LKR
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  const getCurrencySymbolForUser = useCallback(() => {
    return getCurrencySymbol(currency);
  }, [currency]);

  const formatCurrencyForUser = useCallback((amount: number) => {
    return formatCurrency(amount, currency);
  }, [currency]);

  return {
    currency,
    setCurrency,
    loading,
    getCurrencySymbol: getCurrencySymbolForUser,
    formatCurrency: formatCurrencyForUser,
    refreshPreferences: loadUserPreferences,
  };
}