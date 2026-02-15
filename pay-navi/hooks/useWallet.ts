"use client";

import { useState, useEffect, useCallback } from "react";
import paymentMethodsData from "@/data/payment-methods.json";

const STORAGE_KEY = "payNavi_wallet";

export function useWallet() {
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(
    new Set(Object.keys(paymentMethodsData))
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedPayments(new Set(JSON.parse(saved)));
      }
    } catch {
      // ignore
    }
  }, []);

  const togglePayment = useCallback((key: string) => {
    setSelectedPayments((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { selectedPayments, togglePayment };
}
