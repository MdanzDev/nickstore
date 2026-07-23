import { createContext, useContext, useState, ReactNode, useMemo } from "react";

export type Currency = "MYR" | "IDR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRate: number;
  formatPrice: (priceMyr: number | string | undefined | null, priceIdr?: number | string | undefined | null) => string;
  convertPrice: (priceMyr: number, targetCurrency?: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const EXCHANGE_RATE = 4300;

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem("selected_currency");
      return (saved === "IDR" ? "IDR" : "MYR") as Currency;
    } catch {
      return "MYR";
    }
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("selected_currency", c);
    } catch (e) {
      console.warn("localStorage is not available:", e);
    }
  };

  const formatPrice = (priceMyr: number | string | undefined | null, priceIdr?: number | string | undefined | null) => {
    const myrVal = typeof priceMyr === "string" ? parseFloat(priceMyr) : (priceMyr ?? 0);
    const idrVal = typeof priceIdr === "string" ? parseFloat(priceIdr) : (priceIdr ?? 0);

    if (currency === "MYR") {
      if (myrVal > 0) {
        return `RM ${myrVal.toFixed(2)}`;
      }
      return `RM ${(idrVal / EXCHANGE_RATE).toFixed(2)}`;
    } else {
      if (idrVal > 0) {
        return `Rp ${Math.round(idrVal).toLocaleString("id-ID")}`;
      }
      return `Rp ${Math.round(myrVal * EXCHANGE_RATE).toLocaleString("id-ID")}`;
    }
  };

  const convertPrice = (priceMyr: number, targetCurrency?: Currency) => {
    const tc = targetCurrency || currency;
    if (tc === "MYR") {
      return priceMyr;
    }
    return priceMyr * EXCHANGE_RATE;
  };

  const value = useMemo(() => ({
    currency,
    setCurrency,
    exchangeRate: EXCHANGE_RATE,
    formatPrice,
    convertPrice,
  }), [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
