import React from "react";
import { Trash2, Edit } from "lucide-react";
import { Card } from "./Card";
import { Expense } from "../types";
import { DEFAULT_CATEGORIES } from "../constants";
import { formatCurrency } from "../utils";

interface TransactionListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  limit?: number;
}

export function TransactionList({
  expenses,
  onEdit,
  onDelete,
  limit,
}: TransactionListProps) {
  const sorted = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const displayedExpenses = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div className="space-y-2">
      {displayedExpenses.map((expense) => {
        const category =
          DEFAULT_CATEGORIES.find((c) => c.id === expense.category) ||
          DEFAULT_CATEGORIES[6];
        return (
          <Card
            key={expense.id}
            className="p-4 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: category.color }}
              >
                {category.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-900">{expense.note}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="capitalize text-slate-600 font-medium">
                    {category.name}
                  </span>
                  <span>•</span>
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900">
                -{formatCurrency(expense.amount)}
              </span>
              <button
                onClick={() => onEdit(expense)}
                className="text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(expense.id)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        );
      })}
      {expenses.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>No expenses yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
}
