"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { useAccounts } from "../hooks/useAccounts";
import { useCategories } from "../hooks/useCategories";
import { Button, Card, Input, IconSelector } from "../components";
import { AccountType, CategoryScope } from "../types";

function getIconComponent(iconName: string): React.ElementType | null {
  const icons = LucideIcons as unknown as Record<string, React.ElementType>;
  return icons[iconName] || null;
}

export default function ManagePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"accounts" | "categories">(
    "accounts",
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans pb-20">
      <header className="bg-white border-b sticky top-0 z-10 w-full">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold">Manage</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          {(["accounts", "categories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "accounts" ? <AccountsTab /> : <CategoriesTab />}
      </main>
    </div>
  );
}

// ===========================
// ACCOUNTS TAB
// ===========================
function AccountsTab() {
  const {
    accounts,
    loading,
    addAccount,
    editAccount,
    deleteAccount,
    forceDeleteAccount,
    getAccountBalance,
    updateSortOrder,
  } = useAccounts();

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<AccountType>("bank");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<AccountType>("bank");
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);

  // Fetch balances for all accounts
  useEffect(() => {
    async function fetchBalances() {
      if (accounts.length === 0) return;
      setLoadingBalances(true);
      const balanceMap: Record<string, number> = {};
      for (const acc of accounts) {
        balanceMap[acc.id] = await getAccountBalance(acc.id);
      }
      setBalances(balanceMap);
      setLoadingBalances(false);
    }
    fetchBalances();
  }, [accounts]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addAccount(newName.trim(), newType);
    setNewName("");
    setNewType("bank");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await editAccount(editingId, { name: editName.trim(), type: editType });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const balance = balances[id] || 0;
    if (balance !== 0) {
      const confirmForce = window.confirm(
        `This account has a balance of ₱${balance.toFixed(2)}.\n\n` +
          `You can only delete an account with a ₱0.00 balance.\n\n` +
          `Would you like to FORCE DELETE this account and ALL its transactions? This cannot be undone.`,
      );
      if (confirmForce) {
        await forceDeleteAccount(id);
      }
    } else {
      if (window.confirm("Delete this account? This cannot be undone.")) {
        await deleteAccount(id);
      }
    }
  };

  const moveAccount = async (index: number, direction: "up" | "down") => {
    const newOrder = [...accounts.map((a) => a.id)];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [
      newOrder[swapIndex],
      newOrder[index],
    ];
    await updateSortOrder(newOrder);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500">
        Loading accounts...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Account */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Add New Account
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Account name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as AccountType)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="wallet">Wallet</option>
          </select>
          <Button onClick={handleAdd}>
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
      </Card>

      {/* Account List */}
      <div className="space-y-2">
        {accounts.map((account, index) => {
          const balance = balances[account.id];
          const isEditing = editingId === account.id;

          return (
            <Card key={account.id} className="p-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as AccountType)}
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="wallet">Wallet</option>
                  </select>
                  <button
                    onClick={handleSaveEdit}
                    className="p-2 text-green-600 hover:text-green-700"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveAccount(index, "up")}
                      disabled={index === 0}
                      className="text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveAccount(index, "down")}
                      disabled={index === accounts.length - 1}
                      className="text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Account info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {account.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                        {account.type}
                      </span>
                      {loadingBalances ? (
                        <span>Loading...</span>
                      ) : balance !== undefined ? (
                        <span
                          className={
                            balance >= 0 ? "text-emerald-600" : "text-red-600"
                          }
                        >
                          Balance: ₱{balance.toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(account.id);
                        setEditName(account.name);
                        setEditType(account.type);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title={
                        balance !== 0
                          ? "Balance must be ₱0.00 to delete (or force delete)"
                          : "Delete account"
                      }
                    >
                      <Trash2 size={16} />
                      {balance !== undefined && balance !== 0 && (
                        <AlertTriangle
                          size={8}
                          className="absolute -mt-3 -mr-1 text-amber-500"
                        />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {accounts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No accounts yet. Create one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================
// CATEGORIES TAB
// ===========================
function CategoriesTab() {
  const { categories, loading, addCategory, editCategory, deleteCategory } =
    useCategories();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#64748b");
  const [newIcon, setNewIcon] = useState("MoreHorizontal");
  const [newAppliesTo, setNewAppliesTo] = useState<CategoryScope>("both");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editAppliesTo, setEditAppliesTo] = useState<CategoryScope>("both");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addCategory({
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
      applies_to: newAppliesTo,
    });
    setNewName("");
    setNewColor("#64748b");
    setNewIcon("MoreHorizontal");
    setNewAppliesTo("both");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await editCategory(editingId, {
      name: editName.trim(),
      color: editColor,
      icon: editIcon,
      applies_to: editAppliesTo,
    });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Delete this category? Transactions using it will lose their category.",
      )
    ) {
      await deleteCategory(id);
    }
  };

  const appliesToBadgeColor = (scope: CategoryScope) => {
    switch (scope) {
      case "expense":
        return "bg-red-100 text-red-700";
      case "income":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Category */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Add New Category
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-10 w-10 rounded-md border border-slate-200 cursor-pointer"
              title="Pick color"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <IconSelector value={newIcon} onChange={setNewIcon} />
            <select
              value={newAppliesTo}
              onChange={(e) => setNewAppliesTo(e.target.value as CategoryScope)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="both">Both</option>
              <option value="expense">Expense only</option>
              <option value="income">Income only</option>
            </select>
            <Button onClick={handleAdd} className="ml-auto">
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const isSystem = cat.user_id === null;
          const isEditing = editingId === cat.id;
          const Icon = getIconComponent(cat.icon);

          return (
            <Card
              key={cat.id}
              className={`p-3 ${isSystem ? "opacity-80" : ""}`}
            >
              {isEditing && !isSystem ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="h-10 w-10 rounded-md border border-slate-200 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <IconSelector value={editIcon} onChange={setEditIcon} />
                    <select
                      value={editAppliesTo}
                      onChange={(e) =>
                        setEditAppliesTo(e.target.value as CategoryScope)
                      }
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="both">Both</option>
                      <option value="expense">Expense only</option>
                      <option value="income">Income only</option>
                    </select>
                    <div className="flex gap-1 ml-auto">
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 text-green-600 hover:text-green-700"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {Icon ? (
                      <Icon size={18} />
                    ) : (
                      <span className="text-xs">?</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {cat.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-1.5 py-0.5 rounded capitalize ${appliesToBadgeColor(
                          cat.applies_to,
                        )}`}
                      >
                        {cat.applies_to === "both"
                          ? "Both"
                          : cat.applies_to === "expense"
                            ? "Expense"
                            : "Income"}
                      </span>
                      {isSystem && (
                        <span className="text-slate-400 italic">System</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isSystem && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                          setEditColor(cat.color);
                          setEditIcon(cat.icon);
                          setEditAppliesTo(cat.applies_to);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {categories.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No categories found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
