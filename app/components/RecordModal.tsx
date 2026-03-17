import React from "react";
import { X } from "lucide-react";
import { Card, Button, Input, AccountSelect } from ".";
import { Account, Category, TransactionType } from "../types";

interface ExpenseModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isEditing: boolean;
  submitting?: boolean;
  newAmount: string;
  setNewAmount: (amount: string) => void;
  newType: TransactionType;
  setNewType: (type: TransactionType) => void;
  newCategory: string;
  setNewCategory: (category: string) => void;
  newAccount: string;
  setNewAccount: (account: string) => void;
  newToAccount: string;
  setNewToAccount: (account: string) => void;
  newNote: string;
  setNewNote: (note: string) => void;
  newDate: string;
  setNewDate: (date: string) => void;
  accounts: Account[];
  categories: Category[];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function RecordModal({
  isModalOpen,
  setIsModalOpen,
  isEditing,
  submitting = false,
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
  accounts,
  categories,
  handleSubmit,
}: ExpenseModalProps) {
  if (!isModalOpen) return null;

  // All categories are available for income/expense, none for transfer
  const availableCategories = newType === "transfer" ? [] : categories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-slate-400 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
            {(["expense", "income", "transfer"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setNewType(type);
                  // Reset category when switching types
                  if (type === "transfer") {
                    setNewCategory("");
                  } else {
                    if (
                      categories.length > 0 &&
                      !categories.find((c) => c.id === newCategory)
                    ) {
                      setNewCategory(categories[0].id);
                    }
                  }
                }}
                className={`py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                  newType === type
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Amount (₱)
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-3"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {newType === "transfer" ? "From Account" : "Account"}
            </label>
            <AccountSelect
              accounts={accounts}
              value={newAccount}
              onChange={setNewAccount}
            />
          </div>

          {newType === "transfer" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                To Account
              </label>
              <AccountSelect
                accounts={accounts.filter((a) => a.id !== newAccount)}
                value={newToAccount}
                onChange={setNewToAccount}
                placeholder="Select destination account..."
              />
            </div>
          )}

          {newType !== "transfer" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <Input
              type="text"
              placeholder={
                newType === "transfer" ? "Transfer details" : "e.g. Grocery run"
              }
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Date</label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? "Saving..."
                : `${isEditing ? "Update" : "Add"} Transaction`}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
