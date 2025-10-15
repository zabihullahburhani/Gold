"use client";

import React from "react";
import { Card, CardHeader, CardContent } from '../admin/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import moment from "moment-jalaali";
import { getFilteredData, TimeRange } from "../../services/utils";

interface ShopExpense {
  expense_id: number;
  amount: number;
  expense_date: string;
}

interface Props {
  expenses: ShopExpense[];
  selectedRange: TimeRange;
  customStartDate: string;
  customEndDate: string;
}

export default function DailyExpenses({ expenses, selectedRange, customStartDate, customEndDate }: Props) {
  const filteredExpenses = getFilteredData(expenses, "expense_date", selectedRange, customStartDate, customEndDate);

  const monthlyExpenses = Object.values(
    filteredExpenses.reduce((acc: any, e) => {
      const date = moment(e.expense_date).tz("Asia/Kabul");
      const month = date.isValid() ? date.format("jYYYY/jMM") : "";
      if (!acc[month] && month) {
        acc[month] = { month, amount: 0 };
      }
      if (month) acc[month].amount += e.amount || 0;
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.month.localeCompare(b.month));

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="text-xl font-semibold text-yellow-500">📊 مصارف ماهانه (AFN)</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyExpenses}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" label={{ value: "افغانی", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(2)} افغانی`}
              contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
            />
            <Bar dataKey="amount" fill="#FBBF24" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}