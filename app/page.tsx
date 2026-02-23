"use client";

import React, { useState, useMemo } from "react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChartDataPoint, Transaction } from "./types";
import { formatCurrency } from "./utils";
import { Card, Button, TransactionList, Header } from "./components";
import { useAuth } from "./components/AuthProvider";
import { useExpenses } from "./hooks/useExpenses";
import { RecordModal } from "./components/RecordModal";

export default function App() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"week" | "month" | "year">("week");

  const {
    transactions,
    accounts,
    categories,
    loading,
    isModalOpen,
    setIsModalOpen,
    isEditing,
    newAmount,
    setNewAmount,
    newType,
    setNewType,
    newCategory,
    setNewCategory,
    newAccount,
    setNewAccount,
    newToAccount,
    setNewToAccount,
    newNote,
    setNewNote,
    newDate,
    setNewDate,
    handleSubmit,
    deleteTransaction,
    openAddModal,
    openEditModal,
  } = useExpenses();

  // Redirect to login if not authenticated
  if (!user) {
    router.push("/login");
    return null;
  }

  const chartData: ChartDataPoint[] = (() => {
    const now = new Date();
    let data: ChartDataPoint[] = [];

    const startOfDay = (d: Date): Date =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const getTotals = (filteredTransactions: Transaction[]) => {
      const income = filteredTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { income, expense };
    };

    if (viewMode === "week") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });

        const daysTransactions = transactions.filter(
          (e) =>
            startOfDay(new Date(e.date)).getTime() === startOfDay(d).getTime(),
        );
        const { income, expense } = getTotals(daysTransactions);

        data.push({ name: dayStr, income, expense, fullDate: d });
      }
    } else if (viewMode === "month") {
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        const monthStr = d.toLocaleDateString("en-US", { month: "short" });

        const monthsTransactions = transactions.filter((e) => {
          const eDate = new Date(e.date);
          return (
            eDate.getMonth() === i && eDate.getFullYear() === now.getFullYear()
          );
        });
        const { income, expense } = getTotals(monthsTransactions);

        data.push({ name: monthStr, income, expense });
      }
    } else if (viewMode === "year") {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const yearsTransactions = transactions.filter(
          (e) => new Date(e.date).getFullYear() === year,
        );
        const { income, expense } = getTotals(yearsTransactions);

        data.push({ name: year.toString(), income, expense });
      }
    }

    return data;
  })();

  const totalBalance = transactions.reduce((acc, curr) => {
    if (curr.type === "income") return acc + Number(curr.amount);
    if (curr.type === "expense") return acc - Number(curr.amount);
    return acc;
  }, 0);

  const currentMonthTransactions = transactions.filter(
    (e) =>
      new Date(e.date).getMonth() === new Date().getMonth() &&
      new Date(e.date).getFullYear() === new Date().getFullYear(),
  );

  const currentMonthExpense = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans pb-20">
      <Header onAdd={openAddModal} onSignOut={signOut} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Balance
                </p>
                <h3
                  className={`text-2xl font-bold ${
                    totalBalance >= 0 ? "text-slate-900" : "text-red-600"
                  }`}
                >
                  {formatCurrency(totalBalance)}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Month Expenses
                </p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {formatCurrency(currentMonthExpense)}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Month Income
                </p>
                <h3 className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(currentMonthIncome)}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link
              href="/transactions"
              className="text-gray-500 text-sm hover:underline"
            >
              View All
            </Link>
          </div>
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            onEdit={openEditModal}
            onDelete={deleteTransaction}
            limit={5}
          />
        </div>
      </main>

      <RecordModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isEditing={isEditing}
        newAmount={newAmount}
        setNewAmount={setNewAmount}
        newType={newType}
        setNewType={setNewType}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newAccount={newAccount}
        setNewAccount={setNewAccount}
        newToAccount={newToAccount}
        setNewToAccount={setNewToAccount}
        newNote={newNote}
        setNewNote={setNewNote}
        newDate={newDate}
        setNewDate={setNewDate}
        accounts={accounts}
        categories={categories}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
