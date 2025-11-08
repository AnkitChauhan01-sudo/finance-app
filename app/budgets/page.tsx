"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface Budget {
  id: string;
  category: string;
  amount: string;
  period: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: string;
  category: string;
  date: string;
}

const categories = [
  "Food",
  "Transportation",
  "Shopping",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Other",
];

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period: "monthly",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [budgetsRes, transactionsRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/transactions"),
      ]);

      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json();
        setBudgets(budgetsData);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchData();
        setFormData({
          category: "",
          amount: "",
          period: "monthly",
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating budget:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const getSpentAmount = (category: string, period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === "monthly") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (period === "weekly") {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      // yearly
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === category &&
          new Date(t.date) >= startDate &&
          new Date(t.date) <= endDate
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const getBudgetStatus = (budget: Budget) => {
    const spent = getSpentAmount(budget.category, budget.period);
    const budgetAmount = parseFloat(budget.amount);
    const percentage = (spent / budgetAmount) * 100;
    const remaining = budgetAmount - spent;

    return {
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      isOverBudget: spent > budgetAmount,
    };
  };

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
              href="/charts"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Charts
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Budget"}
          </button>
        </div>

        {/* Add Budget Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Budget
              </button>
            </form>
          </div>
        )}

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No budgets set yet. Create your first budget above!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const status = getBudgetStatus(budget);
              return (
                <div
                  key={budget.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {budget.category}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {budget.period} Budget
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Budget</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${parseFloat(budget.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Spent</span>
                      <span
                        className={`font-semibold ${
                          status.isOverBudget ? "text-red-600" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        ${status.spent.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                      <span
                        className={`font-semibold ${
                          status.remaining >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ${Math.abs(status.remaining).toFixed(2)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          status.isOverBudget
                            ? "bg-red-600"
                            : status.percentage > 80
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(status.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                      {status.percentage.toFixed(1)}% used
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

