"use client";

import React from "react";
import { Card, CardHeader, CardContent } from '../admin/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getFilteredData, TimeRange, toJalaliDate } from "../../services/utils";

interface Transaction {
  txn_id: number;
  type: "buy" | "sell";
  dollar_in: number;
  dollar_out: number;
  date: string;
}

interface Props {
  transactions: Transaction[];
  selectedRange: TimeRange;
  customStartDate: string;
  customEndDate: string;
}

export default function FiveTopProfits({ transactions, selectedRange, customStartDate, customEndDate }: Props) {
  const filteredTransactions = getFilteredData(transactions, "date", selectedRange, customStartDate, customEndDate);

  const dailySummary = Object.values(
    filteredTransactions.reduce((acc: any, t) => {
      const date = toJalaliDate(t.date, "day");
      if (!date) return acc;
      if (!acc[date]) {
        acc[date] = { date, profit: 0, loss: 0 };
      }
      if (t.type === "sell") {
        acc[date].profit += t.dollar_in - t.dollar_out;
      } else {
        acc[date].loss += t.dollar_out - t.dollar_in;
      }
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.date.localeCompare(b.date));

  const topProfits = [...dailySummary]
    .sort((a: any, b: any) => b.profit - a.profit)
    .slice(0, 5);

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="text-xl font-semibold text-yellow-500">🔝 پنج بیشترین مفاد</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProfits}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(2)} دالر`}
              contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
            />
            <Bar dataKey="profit" fill="#14B8A6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}