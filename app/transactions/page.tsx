"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  Card,
  Button,
  ExpenseModal,
  TransactionList,
  Header,
} from "../components";
import { useExpenses } from "../hooks/useExpenses";

export default function TransactionsPage() {
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans pb-20">
      <Header
        fileInputRef={fileInputRef}
        onExport={exportToCSV}
        onImportChange={handleImport}
        onAdd={openAddModal}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <h2 className="text-lg font-semibold">All Transactions</h2>
          </div>
          <TransactionList
            expenses={expenses}
            onEdit={openEditModal}
            onDelete={deleteExpense}
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
