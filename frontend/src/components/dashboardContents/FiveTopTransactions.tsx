"use client";

import React from "react";
import { Card, CardHeader, CardContent } from '../admin/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getFilteredData, TimeRange } from "../../services/utils";

interface Transaction {
  txn_id: number;
  customer_id: number;
  dollar_in: number;
  dollar_out: number;
  gold_in: number;
  gold_out: number;
}

interface Customer {
  customer_id: number;
  full_name: string;
}

interface Props {
  transactions: Transaction[];
  customers: Customer[];
  selectedRange: TimeRange;
  customStartDate: string;
  customEndDate: string;
}

export default function FiveTopTransactions({ transactions, customers, selectedRange, customStartDate, customEndDate }: Props) {
  const filteredTransactions = getFilteredData(transactions, "date", selectedRange, customStartDate, customEndDate);

  const topDollarTransactions = [...filteredTransactions]
    .sort((a, b) => Math.abs(b.dollar_in - b.dollar_out) - Math.abs(a.dollar_in - a.dollar_out))
    .slice(0, 5);

  const topGoldTransactions = [...filteredTransactions]
    .sort((a, b) => Math.abs(b.gold_in - b.gold_out) - Math.abs(a.gold_in - a.gold_out))
    .slice(0, 5);

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="text-xl font-semibold text-yellow-500">🔝 پنج تاپ‌ترین معاملات</CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">معاملات دالری</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topDollarTransactions.map((t) => ({
                name: customers.find((c) => c.customer_id === t.customer_id)?.full_name || "نامشخص",
                value: Math.abs(t.dollar_in - t.dollar_out),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(2)} دالر`}
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
              />
              <Bar dataKey="value" fill="#14B8A6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">معاملات طلایی (گرم)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topGoldTransactions.map((t) => ({
                name: customers.find((c) => c.customer_id === t.customer_id)?.full_name || "نامشخص",
                value: Math.abs(t.gold_in - t.gold_out),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" label={{ value: "گرم", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(2)} گرم`}
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
              />
              <Bar dataKey="value" fill="#FBBF24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}