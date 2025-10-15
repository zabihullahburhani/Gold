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

interface Props {
  transactions: Transaction[];
  expenses: ShopExpense[];
  capitals: Capital[];
  selectedRange: TimeRange;
  customStartDate: string;
  customEndDate: string;
}

export default function ToDaySummary({ transactions, expenses, capitals, selectedRange, customStartDate, customEndDate }: Props) {
  const filteredTransactions = getFilteredData(transactions, "date", selectedRange, customStartDate, customEndDate);
  const filteredExpenses = getFilteredData(expenses, "expense_date", selectedRange, customStartDate, customEndDate);

  const rangeProfit = filteredTransactions
    .filter((t) => t.type === "sell")
    .reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);

  const rangeLoss = filteredTransactions
    .filter((t) => t.type === "buy")
    .reduce((sum, t) => sum + (t.dollar_out - t.dollar_in), 0);

  const rangeExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const latestDollarBalance = filteredTransactions.length > 0
    ? filteredTransactions[filteredTransactions.length - 1]?.dollar_balance || 0
    : 0;
  const totalUsdCapital = capitals.reduce((sum, c) => sum + (c.usd_capital || 0), 0);
  const rangeDollarRevenue = latestDollarBalance + totalUsdCapital;

  const latestGoldBalance = filteredTransactions.length > 0
    ? filteredTransactions[filteredTransactions.length - 1]?.gold_balance || 0
    : 0;
  const totalGoldCapital = capitals.reduce((sum, c) => sum + (c.gold_capital || 0), 0);
  const rangeGoldRevenue = latestGoldBalance + totalGoldCapital;

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
          <p className="text-sm text-gray-300">مفاد {getRangeLabel()}</p>
          <p className="text-lg font-bold text-green-400">{rangeProfit.toFixed(2)} دالر</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">ضرر {getRangeLabel()}</p>
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
      </CardContent>
    </Card>
  );
}