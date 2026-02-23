"use client";

import React, { useState, useMemo } from "react";
import { TrendingDown, TrendingUp, Wallet, CalendarDays } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Transaction } from "./types";
import { formatCurrency } from "./utils";
import { Card, TransactionList, Header } from "./components";
import { useAuth } from "./components/AuthProvider";
import { useExpenses } from "./hooks/useExpenses";
import { RecordModal } from "./components/RecordModal";

// Get current month/year in Asia/Manila timezone
function getPHTNow() {
  const now = new Date();
  const pht = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Manila" }),
  );
  return { month: pht.getMonth(), year: pht.getFullYear() };
}

export default function App() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const phtNow = getPHTNow();
  const [selectedMonth, setSelectedMonth] = useState(phtNow.month);
  const [selectedYear, setSelectedYear] = useState(phtNow.year);

  const {
    transactions,
    accounts,
    categories,
    loading,
    submitting,
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

  // Generate month-year options from transaction dates + current month
  const monthYearOptions = useMemo(() => {
    const optionSet = new Set<string>();
    // Always include current PHT month
    optionSet.add(`${phtNow.year}-${phtNow.month}`);
    // Include selected month
    optionSet.add(`${selectedYear}-${selectedMonth}`);

    transactions.forEach((t) => {
      const d = new Date(t.date);
      optionSet.add(`${d.getFullYear()}-${d.getMonth()}`);
    });

    return Array.from(optionSet)
      .map((key) => {
        const [y, m] = key.split("-").map(Number);
        const d = new Date(y, m, 1);
        return {
          value: key,
          label: d.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          year: y,
          month: m,
        };
      })
      .sort((a, b) => b.year - a.year || b.month - a.month);
  }, [transactions, phtNow.year, phtNow.month, selectedYear, selectedMonth]);

  // Filtered transactions for the selected month
  const selectedMonthTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
        );
      }),
    [transactions, selectedMonth, selectedYear],
  );

  const totalBalance = transactions.reduce((acc, curr) => {
    if (curr.type === "income") return acc + Number(curr.amount);
    if (curr.type === "expense") return acc - Number(curr.amount);
    return acc;
  }, 0);

  const selectedMonthExpense = selectedMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const selectedMonthIncome = selectedMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Selected month name for labels
  const selectedMonthName = new Date(
    selectedYear,
    selectedMonth,
    1,
  ).toLocaleDateString("en-US", { month: "short" });

  // --- Area chart data: expenses by category, grouped by day ---
  const { areaChartData, expenseCategories } = useMemo(() => {
    const monthExpenses = selectedMonthTransactions.filter(
      (t) => t.type === "expense",
    );

    if (monthExpenses.length === 0) {
      return { areaChartData: [], expenseCategories: [] };
    }

    // Collect unique category IDs used in expenses this month
    const catIds = Array.from(
      new Set(monthExpenses.map((t) => t.category_id).filter(Boolean)),
    ) as string[];

    const expenseCats = catIds
      .map((id) => categories.find((c) => c.id === id))
      .filter(Boolean) as typeof categories;

    // Days in the selected month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const data: Record<string, any>[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const entry: Record<string, any> = {
        name: day.toString(),
      };

      expenseCats.forEach((cat) => {
        const dayTotal = monthExpenses
          .filter((t) => {
            const d = new Date(t.date);
            return d.getDate() === day && t.category_id === cat.id;
          })
          .reduce((sum, t) => sum + Number(t.amount), 0);
        entry[cat.name] = dayTotal;
      });

      data.push(entry);
    }

    return { areaChartData: data, expenseCategories: expenseCats };
  }, [selectedMonthTransactions, categories, selectedYear, selectedMonth]);

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

  const handleMonthYearChange = (value: string) => {
    const [y, m] = value.split("-").map(Number);
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans pb-20">
      <Header onAdd={openAddModal} onSignOut={signOut} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Month-Year Selector */}
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-slate-400" />
          <select
            value={`${selectedYear}-${selectedMonth}`}
            onChange={(e) => handleMonthYearChange(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent cursor-pointer"
          >
            {monthYearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

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
                  {selectedMonthName} Expenses
                </p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {formatCurrency(selectedMonthExpense)}
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
                  {selectedMonthName} Income
                </p>
                <h3 className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(selectedMonthIncome)}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Expenses by Category Area Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
          {areaChartData.length > 0 && expenseCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={areaChartData}>
                <defs>
                  {expenseCategories.map((cat) => (
                    <linearGradient
                      key={cat.id}
                      id={`gradient-${cat.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={cat.color}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={cat.color}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickFormatter={(v) => `₱${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name,
                  ]}
                  labelFormatter={(label) =>
                    `${selectedMonthName} ${label}, ${selectedYear}`
                  }
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "0.75rem", paddingTop: "8px" }}
                />
                {expenseCategories.map((cat) => (
                  <Area
                    key={cat.id}
                    type="monotone"
                    dataKey={cat.name}
                    stroke={cat.color}
                    fill={`url(#gradient-${cat.id})`}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <TrendingDown size={40} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">
                No expense data for {selectedMonthName} {selectedYear}
              </p>
              <p className="text-xs mt-1">
                Add expenses to see category breakdown
              </p>
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            {transactions.length > 0 && (
              <Link
                href="/transactions"
                className="text-gray-500 text-sm hover:underline"
              >
                View All
              </Link>
            )}
          </div>
          <TransactionList
            transactions={selectedMonthTransactions}
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
        submitting={submitting}
      />
    </div>
  );
}
