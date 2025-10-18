"use client";

import React from "react";
import { Card, CardHeader, CardContent } from '../admin/ui/card';
import { getFilteredData, TimeRange } from "../../services/utils";

interface Transaction {
  dollar_in: number;
  dollar_out: number;
  gold_in: number;
  gold_out: number;
  date: string;
}

interface Capital {
  id: number;
  usd_capital: number;
  gold_capital: number;
}

interface Props {
  transactions: Transaction[];
  capitals: Capital[];
  selectedRange: TimeRange;
  customStartDate: string;
  customEndDate: string;
}

export default function KahataBalance({ transactions, capitals, selectedRange, customStartDate, customEndDate }: Props) {
  const filteredTransactions = getFilteredData(transactions, "date", selectedRange, customStartDate, customEndDate);

  const totalDollar = filteredTransactions.reduce((sum, t) => sum + (t.dollar_in - t.dollar_out), 0);
  const totalGold = filteredTransactions.reduce((sum, t) => sum + (t.gold_in - t.gold_out), 0);

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="text-xl font-semibold text-red-500">🏦  خلاصه </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">کل دالر</p>
          <p className="text-lg font-bold text-blue-400">{totalDollar.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">کل طلا (گرم)</p>
          <p className="text-lg font-bold text-yellow-400">{totalGold.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}