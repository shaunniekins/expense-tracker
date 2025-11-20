"use client";

import React from "react";
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

  const back = (
    <Link
      href="/"
      className="flex items-center gap-2 font-bold text-xl text-slate-900 hover:text-slate-700"
    >
      <ArrowLeft size={20} />
      Back to Dashboard
    </Link>
  );

  const logo = (
    <>
      <div className="h-8 w-8 rounded-lg flex items-center justify-center">
        <img src="/logo.svg" alt="ExpenseTracker Logo" className="h-6 w-6" />
      </div>
      ExpenseTracker
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans pb-20">
      <Header
        left={back}
        center={logo}
        fileInputRef={fileInputRef}
        onExport={exportToCSV}
        onImportChange={handleImport}
        onAdd={openAddModal}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Transactions</h2>
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
