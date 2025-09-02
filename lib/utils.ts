import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  LKR: "Rs",
}

// Currency formatting utility
export function formatCurrency(
  amount: number, 
  currency: string = "LKR",
  options?: {
    compact?: boolean;
    hideSymbol?: boolean;
    locale?: string;
  }
): string {
  const { compact = false, hideSymbol = false, locale = "en-US" } = options || {};
  
  // Handle special case for compact formatting with custom symbols
  if (compact) {
    const symbol = hideSymbol ? "" : (CURRENCY_SYMBOLS[currency] || currency);
    
    if (amount === 0) return hideSymbol ? "0" : `${symbol}0`;
    
    if (Math.abs(amount) >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    }
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  // For LKR, use custom formatting since Intl.NumberFormat may not have good support
  if (currency === "LKR") {
    const formattedNumber = Math.abs(amount).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const symbol = hideSymbol ? "" : "Rs ";
    const sign = amount < 0 ? "-" : "";
    return `${sign}${symbol}${formattedNumber}`;
  }
  
  // For other currencies, use Intl.NumberFormat
  try {
    return new Intl.NumberFormat(locale, {
      style: hideSymbol ? "decimal" : "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    const symbol = hideSymbol ? "" : (CURRENCY_SYMBOLS[currency] || currency);
    const formattedNumber = Math.abs(amount).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const sign = amount < 0 ? "-" : "";
    return `${sign}${symbol}${formattedNumber}`;
  }
}
