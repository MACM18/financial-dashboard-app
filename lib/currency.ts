// Currency utilities for the financial dashboard app

export interface CurrencyInfo {
  symbol: string;
  code: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar'
  },
  LKR: {
    symbol: 'Rs',
    code: 'LKR',
    name: 'Sri Lankan Rupee'
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro'
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    name: 'British Pound'
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    name: 'Indian Rupee'
  }
};

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string = 'LKR'): string {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || 'Rs';
}

/**
 * Format an amount with the appropriate currency symbol
 */
export function formatCurrency(amount: number, currencyCode: string = 'LKR'): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Get currency info for a given currency code
 */
export function getCurrencyInfo(currencyCode: string = 'LKR'): CurrencyInfo {
  return SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.LKR;
}

/**
 * Get all supported currencies as an array
 */
export function getSupportedCurrencies(): CurrencyInfo[] {
  return Object.values(SUPPORTED_CURRENCIES);
}