"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: string;
  category: string;
  description: string | null;
  date: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
  "#8DD1E1",
  "#D084D0",
  "#FFB347",
];

export default function Charts() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"all" | "month" | "year">("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsByTimeRange = (transactions: Transaction[]) => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      if (timeRange === "month") return transactionDate >= oneMonthAgo;
      if (timeRange === "year") return transactionDate >= oneYearAgo;
      return true;
    });
  };

  const filteredTransactions = filterTransactionsByTimeRange(transactions);

  // Expense by category (for pie chart)
  const expenseByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const category = t.category;
      const amount = parseFloat(t.amount);
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  // Income by category (for pie chart)
  const incomeByCategory = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => {
      const category = t.category;
      const amount = parseFloat(t.amount);
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  // Monthly income/expense (for bar chart)
  const monthlyData = filteredTransactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }
    if (t.type === "income") {
      acc[monthKey].income += parseFloat(t.amount);
    } else {
      acc[monthKey].expense += parseFloat(t.amount);
    }
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  const barChartData = Object.values(monthlyData)
    .map((item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      income: parseFloat(item.income.toFixed(2)),
      expense: parseFloat(item.expense.toFixed(2)),
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💰 Finance Tracker
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Dashboard
            </Link>
            <Link
              href="/budgets"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Budgets
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Time Range Filter */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setTimeRange("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === "all"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === "year"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Last Year
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === "month"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Last Month
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Expense Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Expenses by Category
            </h2>
            {expensePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      if (!entry || !entry.name) return '';
                      const total = expensePieData.reduce((sum, item) => sum + item.value, 0);
                      const percent = total > 0 ? (entry.value / total) * 100 : 0;
                      return `${entry.name} ${percent.toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No expense data available
              </div>
            )}
          </div>

          {/* Income Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Income by Category
            </h2>
            {incomePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      if (!entry || !entry.name) return '';
                      const total = incomePieData.reduce((sum, item) => sum + item.value, 0);
                      const percent = total > 0 ? (entry.value / total) * 100 : 0;
                      return `${entry.name} ${percent.toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No income data available
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Income vs Expenses
          </h2>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" fill="#00C49F" name="Income" />
                <Bar dataKey="expense" fill="#FF8042" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available for the selected time range
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

