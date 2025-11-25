"use client";

import React, { useState, useMemo } from "react";
import { TrendingDown, Calendar, Coins } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

import { ChartDataPoint } from "./types";
import { formatCurrency } from "./utils";
import {
  Card,
  Button,
  ExpenseModal,
  TransactionList,
  Header,
} from "./components";
import { useExpenses } from "./hooks/useExpenses";

export default function App() {
  const [viewMode, setViewMode] = useState<"week" | "month" | "year">("week");

  const {
    expenses,
    isModalOpen,
    setIsModalOpen,
    isEditing,
    newAmount,
    setNewAmount,
    newCategory,
    setNewCategory,
    newNote,
    setNewNote,
    newDate,
    setNewDate,
    fileInputRef,
    exportToCSV,
    handleImport,
    handleSubmit,
    deleteExpense,
    openAddModal,
    openEditModal,
  } = useExpenses();

  const chartData: ChartDataPoint[] = useMemo(() => {
    const now = new Date();
    let data: ChartDataPoint[] = [];

    const startOfDay = (d: Date): Date =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (viewMode === "week") {
      // Show last 7 days (formerly "day" view)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });

        const total = expenses
          .filter(
            (e) =>
              startOfDay(new Date(e.date)).getTime() === startOfDay(d).getTime()
          )
          .reduce((sum, e) => sum + e.amount, 0);

        data.push({ name: dayStr, amount: total, fullDate: d });
      }
    } else if (viewMode === "month") {
      // Show all months of current year
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        const monthStr = d.toLocaleDateString("en-US", { month: "short" });

        const total = expenses
          .filter((e) => {
            const eDate = new Date(e.date);
            return (
              eDate.getMonth() === i &&
              eDate.getFullYear() === now.getFullYear()
            );
          })
          .reduce((sum, e) => sum + e.amount, 0);

        data.push({ name: monthStr, amount: total });
      }
    } else if (viewMode === "year") {
      // Show last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const total = expenses
          .filter((e) => new Date(e.date).getFullYear() === year)
          .reduce((sum, e) => sum + e.amount, 0);
        data.push({ name: year.toString(), amount: total });
      }
    }

    return data;
  }, [expenses, viewMode]);

  const totalSpent = expenses.reduce(
    (acc: number, curr) => acc + curr.amount,
    0
  );
  const currentMonthTotal = expenses
    .filter(
      (e) =>
        new Date(e.date).getMonth() === new Date().getMonth() &&
        new Date(e.date).getFullYear() === new Date().getFullYear()
    )
    .reduce((acc: number, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans pb-20">
      <Header
        fileInputRef={fileInputRef}
        onExport={exportToCSV}
        onImportChange={handleImport}
        onAdd={openAddModal}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
                <Coins size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Spent (All Time)
                </p>
                <h3 className="text-2xl font-bold">
                  {formatCurrency(totalSpent)}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">This Month</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {formatCurrency(currentMonthTotal)}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Transaction Count
                </p>
                <h3 className="text-2xl font-bold text-emerald-600">
                  {expenses.length}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold">Spending Overview</h2>
              <p className="text-sm text-slate-500">
                Visualize your expenses over time
              </p>
            </div>
            <div className="flex rounded-lg bg-slate-100 p-1">
              {(["week", "month", "year"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                    viewMode === mode
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(val) => `₱${val}`}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="#0f172a"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

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
            expenses={expenses}
            onEdit={openEditModal}
            onDelete={deleteExpense}
            limit={5}
          />
        </div>
      </main>

      <ExpenseModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isEditing={isEditing}
        newAmount={newAmount}
        setNewAmount={setNewAmount}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newNote={newNote}
        setNewNote={setNewNote}
        newDate={newDate}
        setNewDate={setNewDate}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
