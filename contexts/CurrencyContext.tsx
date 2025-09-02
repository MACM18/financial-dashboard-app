"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("LKR");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load currency preference from localStorage
    if (typeof window !== "undefined") {
      const savedCurrency = localStorage.getItem("user_currency");
      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      }
    }
    setIsLoading(false);
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_currency", newCurrency);
    }
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        isLoading 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}