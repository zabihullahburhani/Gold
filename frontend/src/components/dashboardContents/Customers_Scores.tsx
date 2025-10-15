"use client";

import React from "react";
import { Card, CardHeader, CardContent } from '../admin/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getFilteredData, TimeRange } from "../../services/utils";

interface Transaction {
  customer_id: number;
  type: "buy" | "sell";
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

export default function CustomersScores({ transactions, customers, selectedRange, customStartDate, customEndDate }: Props) {
  const filteredTransactions = getFilteredData(transactions, "date", selectedRange, customStartDate, customEndDate);

  const customerScores = customers.map((c) => {
    const custTxns = filteredTransactions.filter((t) => t.customer_id === c.customer_id);
    const buyCount = custTxns.filter((t) => t.type === "buy").length;
    const sellCount = custTxns.filter((t) => t.type === "sell").length;
    const totalDollarOut = custTxns.reduce((sum, t) => sum + t.dollar_out, 0);
    const totalDollarIn = custTxns.reduce((sum, t) => sum + t.dollar_in, 0);
    const totalGoldOut = custTxns.reduce((sum, t) => sum + t.gold_out, 0);
    const totalGoldIn = custTxns.reduce((sum, t) => sum + t.gold_in, 0);
    const score = (buyCount + sellCount) * 10 + Math.abs(totalDollarOut - totalDollarIn) / 10000 + Math.abs(totalGoldOut - totalGoldIn) / 10;
    return { name: c.full_name, score };
  });

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="text-xl font-semibold text-yellow-500">🏆 امتیازات مشتریان</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={customerScores}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" label={{ value: "امتیاز", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(2)} امتیاز`}
              contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
            />
            <Bar dataKey="score" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}