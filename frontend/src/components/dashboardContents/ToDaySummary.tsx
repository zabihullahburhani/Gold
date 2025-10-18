"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "../admin/ui/card";
import { getFilteredData, TimeRange } from "../../services/utils";

interface Transaction {
  txn_id: number;
  type: "buy" | "sell";
  dollar_in: number;
  dollar_out: number;
  date: string;
}

interface ShopExpense {
  expense_id: number;
  amount: number;
  expense_date: string;
}

interface Capital {
  id: number;
  usd_capital: number;
  gold_capital: number;
  date: string;
}

interface GoldLedger {
  gold_ledger_id: number;
  customer_id: number;
  transaction_date: string;
  received: number;
  paid: number;
}

interface MoneyLedger {
  money_ledger_id: number;
  customer_id: number;
  transaction_date: string;
  received: number;
  paid: number;
}

interface Props {
  transactions: Transaction[];
  expenses: ShopExpense[];
  capitals: Capital[];
  goldLedgers: GoldLedger[];
  moneyLedgers: MoneyLedger[];
  selectedRange: TimeRange;
  customStartDate: string;
  customEndDate: string;
}

// Local getRangeDates from Transactions.tsx
const getRangeDates = (range: TimeRange, customStart?: string | null, customEnd?: string | null) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); 
  let startDate: Date | null = null;
  let endDate: Date = new Date(); 
  
  endDate.setHours(23, 59, 59, 999);

  switch (range) {
      case 'today':
          startDate = new Date(now);
          break;
      case 'yesterday':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 1);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
      case 'current_week':
          const firstDayOfWeek = now.getDate() - now.getDay();
          startDate = new Date(now);
          startDate.setDate(firstDayOfWeek);
          break;
      case 'current_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      case 'custom':
          if (customStart) {
              startDate = new Date(customStart);
              startDate.setHours(0, 0, 0, 0);
          }
          if (customEnd) {
              endDate = new Date(customEnd);
              endDate.setHours(23, 59, 59, 999);
          }
          break;
      case 'all':
      default:
          return { startDate: null, endDate: null };
  }
  
  if (startDate && range !== "custom") startDate.setHours(0, 0, 0, 0);
  
  return { startDate, endDate };
};

export default function ToDaySummary({ transactions, expenses, capitals, goldLedgers, moneyLedgers, selectedRange, customStartDate, customEndDate }: Props) {
  const filteredTransactions = getFilteredData(transactions, "date", selectedRange, customStartDate, customEndDate);
  const filteredExpenses = getFilteredData(expenses, "expense_date", selectedRange, customStartDate, customEndDate);

  const totals = filteredTransactions.reduce(
    (acc, txn) => {
      if (txn.type === "buy") {
        acc.totalBuyGold += txn.gold_out || 0;
        acc.totalBuyPrice += txn.dollar_out || 0;
      } else if (txn.type === "sell") {
        acc.totalSellGold += txn.gold_in || 0;
        acc.totalSellPrice += txn.dollar_in || 0;
      }
      return acc;
    },
    { totalBuyGold: 0, totalSellGold: 0, totalBuyPrice: 0, totalSellPrice: 0 }
  );

  const netProfitLoss = totals.totalSellPrice - totals.totalBuyPrice;
  const profitLossLabel = netProfitLoss >= 0 ? "مفاد" : "ضرر";
  const profitLossValue = Math.abs(netProfitLoss);

  const rangeProfit = filteredTransactions
    .filter((t) => t.type === "sell")
    .reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);

  const rangeLoss = filteredTransactions
    .filter((t) => t.type === "buy")
    .reduce((sum, t) => sum + (t.dollar_out - t.dollar_in), 0);

  const rangeExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // For balances: cumulative up to the end of the range
  const { endDate } = getRangeDates(selectedRange, customStartDate, customEndDate);

  const upToEndCapitals = getFilteredData(capitals, "date", "custom", "", endDate ? endDate.toISOString().slice(0, 10) : "");
  const totalUsdCapital = upToEndCapitals.reduce((sum, c) => sum + (c.usd_capital || 0), 0);
  const totalGoldCapital = upToEndCapitals.reduce((sum, c) => sum + (c.gold_capital || 0), 0);

  const upToEndGoldLedgers = getFilteredData(goldLedgers, "transaction_date", "custom", "", endDate ? endDate.toISOString().slice(0, 10) : "");
  const upToEndMoneyLedgers = getFilteredData(moneyLedgers, "transaction_date", "custom", "", endDate ? endDate.toISOString().slice(0, 10) : "");

  // Cumulative gold balance from last record
  let cumulativeGoldBalance = totalGoldCapital;
  const sortedGoldLedgers = upToEndGoldLedgers.sort((a: GoldLedger, b: GoldLedger) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());
  sortedGoldLedgers.forEach((ledger: GoldLedger) => {
    cumulativeGoldBalance += (ledger.received || 0) - (ledger.paid || 0);
  });
  const latestGoldBalance = cumulativeGoldBalance;

  // Cumulative money balance from last record
  let cumulativeMoneyBalance = totalUsdCapital;
  const sortedMoneyLedgers = upToEndMoneyLedgers.sort((a: MoneyLedger, b: MoneyLedger) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());
  sortedMoneyLedgers.forEach((ledger: MoneyLedger) => {
    cumulativeMoneyBalance += (ledger.received || 0) - (ledger.paid || 0);
  });
  const latestMoneyBalance = cumulativeMoneyBalance;

  const rangeDollarRevenue = latestMoneyBalance;
  const rangeGoldRevenue = latestGoldBalance;

  const getRangeLabel = (): string => {
    switch (selectedRange) {
      case "today": return "امروز";
      case "yesterday": return "دیروز";
      case "current_week": return "هفته جاری";
      case "current_month": return "ماه جاری";
      case "custom": return "انتخابی";
      case "all": return "کل";
      default: return "امروز";
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="text-xl font-semibold text-yellow-500">💰 خلاصه {getRangeLabel()}</CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">پول فروش {getRangeLabel()}</p>
          <p className="text-lg font-bold text-green-400">{rangeProfit.toFixed(2)} دالر</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">پول خرید {getRangeLabel()}</p>
          <p className="text-lg font-bold text-red-400">{rangeLoss.toFixed(2)} دالر</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">مصارف {getRangeLabel()} (AFN)</p>
          <p className="text-lg font-bold text-yellow-400">{rangeExpenses.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">جمع دخل دالری {getRangeLabel()}</p>
          <p className="text-lg font-bold text-blue-400">{rangeDollarRevenue.toFixed(2)} دالر</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">جمع دخل طلای {getRangeLabel()}</p>
          <p className="text-lg font-bold text-yellow-400">{rangeGoldRevenue.toFixed(2)} گرم</p>
        </div>
        {/* نمایش مجموع‌های محاسبه شده */}
        <div className="text-right text-sm grid grid-cols-2 md:grid-cols-5 gap-x-2 gap-y-1 lg:flex lg:space-x-3 lg:space-x-reverse">
           
          <p className={`font-bold text-lg ${netProfitLoss >= 0 ? 'text-teal-400' : 'text-red-500'}`}>
            {netProfitLoss >= 0 ? '✅ مفاد: ' : '❌ ضرر: '}
            $ {profitLossValue.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}