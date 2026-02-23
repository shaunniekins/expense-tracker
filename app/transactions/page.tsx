"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TransactionList, Header } from "../components";
import { useAuth } from "../components/AuthProvider";
import { useExpenses } from "../hooks/useExpenses";
import { RecordModal } from "../components/RecordModal";

export default function TransactionsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

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

  if (!user) {
    router.push("/login");
    return null;
  }

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
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            onEdit={openEditModal}
            onDelete={deleteTransaction}
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
