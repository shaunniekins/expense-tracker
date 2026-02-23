import React from "react";
import {
  Trash2,
  Edit,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Card } from "./Card";
import { Transaction, Account, Category } from "../types";
import { formatCurrency } from "../utils";

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  limit?: number;
}

// Helper to get a Lucide icon component by name
function getIconComponent(iconName: string): React.ElementType | null {
  const icons = LucideIcons as unknown as Record<string, React.ElementType>;
  return icons[iconName] || null;
}

export function TransactionList({
  transactions,
  accounts,
  categories,
  onEdit,
  onDelete,
  limit,
}: TransactionListProps) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const displayed = limit ? sorted.slice(0, limit) : sorted;

  const getAccountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name || "Unknown";

  const getCategoryById = (id: string | null): Category | null => {
    if (!id) return null;
    return categories.find((c) => c.id === id) || null;
  };

  return (
    <div className="space-y-2">
      {displayed.map((transaction) => {
        const isTransfer = transaction.type === "transfer";
        const isIncome = transaction.type === "income";

        const category = getCategoryById(transaction.category_id);

        let iconElement: React.ReactNode = <TrendingDown size={20} />;
        let color = category?.color || "#64748b";

        if (isIncome) {
          color = "#10b981";
          if (category?.icon) {
            const IconComp = getIconComponent(category.icon);
            iconElement = IconComp ? (
              <IconComp size={20} />
            ) : (
              <TrendingUp size={20} />
            );
          } else {
            iconElement = <TrendingUp size={20} />;
          }
        } else if (isTransfer) {
          iconElement = <ArrowRightLeft size={20} />;
          color = "#3b82f6";
        } else if (category?.icon) {
          const IconComp = getIconComponent(category.icon);
          iconElement = IconComp ? (
            <IconComp size={20} />
          ) : (
            <TrendingDown size={20} />
          );
        }

        return (
          <Card
            key={transaction.id}
            className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
              <div
                className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: color }}
              >
                {iconElement}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {transaction.note ||
                    (isTransfer ? "Transfer" : "Transaction")}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span className="capitalize text-slate-600 font-medium truncate">
                    {category
                      ? category.name
                      : isTransfer
                        ? "Transfer"
                        : transaction.type}
                  </span>
                  <span>•</span>
                  <span className="whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString("en-US")}
                  </span>
                  <span>•</span>
                  <span className="whitespace-nowrap font-medium text-slate-400">
                    {isTransfer
                      ? `${getAccountName(
                          transaction.account_id,
                        )} → ${getAccountName(transaction.to_account_id || "")}`
                      : getAccountName(transaction.account_id)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 pl-13 sm:pl-0">
              <span
                className={`font-bold ${
                  isIncome
                    ? "text-emerald-600"
                    : isTransfer
                      ? "text-slate-900"
                      : "text-slate-900"
                }`}
              >
                {isIncome ? "+" : isTransfer ? "" : "-"}
                {formatCurrency(Number(transaction.amount))}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(transaction)}
                  className="text-slate-400 hover:text-blue-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="text-slate-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        );
      })}
      {displayed.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>No transactions yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
}
