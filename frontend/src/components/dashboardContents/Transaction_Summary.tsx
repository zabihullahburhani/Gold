"use client";

import React from "react";
import { Card, CardHeader, CardContent } from '../admin/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import moment from "moment-jalaali";
import { getFilteredData, TimeRange, TimeGranularity } from "../../services/utils";

interface Transaction {
  txn_id: number;
  type: "buy" | "sell";
  dollar_in: number;
  dollar_out: number;
  gold_in: number;
  gold_out: number;
  date: string;
  gold_rate: number;
}

interface Props {
  transactions: Transaction[];
  chartType: "line" | "bar" | "candlestick";
  timeGranularity: TimeGranularity;
  selectedRange: TimeRange;
  customStartDate: string;
  customEndDate: string;
}

export default function TransactionSummary({ transactions, chartType, timeGranularity, selectedRange, customStartDate, customEndDate }: Props) {
  const filteredTransactions = getFilteredData(transactions, "date", selectedRange, customStartDate, customEndDate);

  const getTransactionData = () => {
    const groupedData = filteredTransactions.reduce((acc: any, t) => {
      const date = moment(t.date).tz("Asia/Kabul");
      if (!date.isValid()) return acc;
      let key: string;
      switch (timeGranularity) {
        case "minute":
          key = date.format("jYYYY/jMM/jDD HH:mm");
          break;
        case "hour":
          key = date.format("jYYYY/jMM/jDD HH:00");
          break;
        case "day":
          key = date.format("jYYYY/jMM/jDD");
          break;
        case "week":
          key = date.startOf("week").format("jYYYY/jMM/jDD");
          break;
        case "month":
          key = date.format("jYYYY/jMM");
          break;
        case "year":
          key = date.format("jYYYY");
          break;
        default:
          key = date.format("jYYYY/jMM/jDD");
      }
      if (!acc[key]) {
        acc[key] = { time: key, dollarVolume: 0, goldVolume: 0, sellTxns: [] };
      }
      acc[key].dollarVolume += Math.abs(t.dollar_in - t.dollar_out);
      acc[key].goldVolume += Math.abs(t.gold_in - t.gold_out);
      if (t.type === "sell") {
        acc[key].sellTxns.push(t);
      }
      return acc;
    }, {});

    return Object.values(groupedData).sort((a: any, b: any) => a.time.localeCompare(b.time));
  };

  const getCandlestickData = () => {
    const groupedData = filteredTransactions.reduce((acc: any, t) => {
      const date = moment(t.date).tz("Asia/Kabul");
      if (!date.isValid()) return acc;
      let key: string;
      switch (timeGranularity) {
        case "minute":
          key = date.format("jYYYY/jMM/jDD HH:mm");
          break;
        case "hour":
          key = date.format("jYYYY/jMM/jDD HH:00");
          break;
        case "day":
          key = date.format("jYYYY/jMM/jDD");
          break;
        case "week":
          key = date.startOf("week").format("jYYYY/jMM/jDD");
          break;
        case "month":
          key = date.format("jYYYY/jMM");
          break;
        case "year":
          key = date.format("jYYYY");
          break;
        default:
          key = date.format("jYYYY/jMM/jDD");
      }
      if (!acc[key]) {
        acc[key] = { time: key, txns: [], buyVolume: 0, sellVolume: 0 };
      }
      acc[key].txns.push(t);
      if (t.type === "buy") {
        acc[key].buyVolume += t.gold_in;
      } else if (t.type === "sell") {
        acc[key].sellVolume += t.gold_out;
      }
      return acc;
    }, {});

    return Object.values(groupedData).map((group: any) => {
      const txns = group.txns.sort((a: Transaction, b: Transaction) => moment(a.date).tz("Asia/Kabul").diff(moment(b.date).tz("Asia/Kabul")));
      const goldRates = txns.map((t: Transaction) => t.gold_rate).filter((rate: number) => rate > 0);
      const averageGoldRate = goldRates.length > 0 ? goldRates.reduce((sum: number, rate: number) => sum + rate, 0) / goldRates.length : 0;
      return {
        time: group.time,
        open: txns.length > 0 ? txns[0].gold_rate : 0,
        close: txns.length > 0 ? txns[txns.length - 1].gold_rate : 0,
        high: goldRates.length > 0 ? Math.max(...goldRates) : 0,
        low: goldRates.length > 0 ? Math.min(...goldRates) : 0,
        average: averageGoldRate,
        buyVolume: group.buyVolume,
        sellVolume: group.sellVolume,
      };
    }).sort((a: any, b: any) => a.time.localeCompare(b.time));
  };

  const transactionData = getTransactionData();
  const candlestickData = getCandlestickData();

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="text-xl font-semibold text-yellow-500">📈 خلاصه معاملات</CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">معاملات دالری</h3>
          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} دالر`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                />
                <Bar dataKey="dollarVolume" fill="#14B8A6" />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartType === "line" && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} دالر`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                />
                <Line type="monotone" dataKey="dollarVolume" stroke="#14B8A6" />
              </LineChart>
            </ResponsiveContainer>
          )}
          {chartType === "candlestick" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={candlestickData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value, name) => `${Number(value).toFixed(2)} ${name === "average" ? "دالر (متوسط)" : name.includes("Volume") ? "گرم" : "دالر"}`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                  content={({ payload, label }) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-700 p-3 rounded-lg shadow text-gray-200">
                          <p>زمان: {label}</p>
                          <p>باز شدن: {data.open.toFixed(2)} دالر</p>
                          <p>بسته شدن: {data.close.toFixed(2)} دالر</p>
                          <p>بالاترین: {data.high.toFixed(2)} دالر</p>
                          <p>پایین‌ترین: {data.low.toFixed(2)} دالر</p>
                          <p>متوسط: {data.average.toFixed(2)} دالر</p>
                          <p>حجم خرید: {data.buyVolume.toFixed(2)} گرم</p>
                          <p>حجم فروش: {data.sellVolume.toFixed(2)} گرم</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="open"
                  fill="#14B8A6"
                  shape={(props: any) => {
                    const { x, y, width, payload } = props;
                    const open = payload.open;
                    const close = payload.close;
                    const high = payload.high;
                    const low = payload.low;
                    const isBullish = close >= open;
                    return (
                      <g>
                        <line
                          x1={x + width / 2}
                          y1={y - (high - open) * (y / open)}
                          x2={x + width / 2}
                          y2={y + (open - low) * (y / open)}
                          stroke="#9CA3AF"
                        />
                        <rect
                          x={x}
                          y={isBullish ? y - (close - open) * (y / open) : y}
                          width={width}
                          height={Math.abs(close - open) * (y / open) || 1}
                          fill={isBullish ? "#14B8A6" : "#EF4444"}
                        />
                      </g>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">معاملات طلایی (گرم)</h3>
          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "گرم", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} گرم`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                />
                <Bar dataKey="goldVolume" fill="#FBBF24" />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartType === "line" && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "گرم", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} گرم`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                />
                <Line type="monotone" dataKey="goldVolume" stroke="#FBBF24" />
              </LineChart>
            </ResponsiveContainer>
          )}
          {chartType === "candlestick" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={candlestickData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: "دالر", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
                <Tooltip
                  formatter={(value, name) => `${Number(value).toFixed(2)} ${name === "average" ? "دالر (متوسط)" : name.includes("Volume") ? "گرم" : "دالر"}`}
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #4B5563", color: "#E5E7EB" }}
                  content={({ payload, label }) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-700 p-3 rounded-lg shadow text-gray-200">
                          <p>زمان: {label}</p>
                          <p>باز شدن: {data.open.toFixed(2)} دالر</p>
                          <p>بسته شدن: {data.close.toFixed(2)} دالر</p>
                          <p>بالاترین: {data.high.toFixed(2)} دالر</p>
                          <p>پایین‌ترین: {data.low.toFixed(2)} دالر</p>
                          <p>متوسط: {data.average.toFixed(2)} دالر</p>
                          <p>حجم خرید: {data.buyVolume.toFixed(2)} گرم</p>
                          <p>حجم فروش: {data.sellVolume.toFixed(2)} گرم</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="open"
                  fill="#FBBF24"
                  shape={(props: any) => {
                    const { x, y, width, payload } = props;
                    const open = payload.open;
                    const close = payload.close;
                    const high = payload.high;
                    const low = payload.low;
                    const isBullish = close >= open;
                    return (
                      <g>
                        <line
                          x1={x + width / 2}
                          y1={y - (high - open) * (y / open)}
                          x2={x + width / 2}
                          y2={y + (open - low) * (y / open)}
                          stroke="#9CA3AF"
                        />
                        <rect
                          x={x}
                          y={isBullish ? y - (close - open) * (y / open) : y}
                          width={width}
                          height={Math.abs(close - open) * (y / open) || 1}
                          fill={isBullish ? "#14B8A6" : "#EF4444"}
                        />
                      </g>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}