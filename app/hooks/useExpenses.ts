"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../lib/supabaseClient";
import { useAuth } from "../components/AuthProvider";
import { Transaction, TransactionType, Account, Category } from "../types";

export function useExpenses() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [newAmount, setNewAmount] = useState<string>("");
  const [newType, setNewType] = useState<TransactionType>("expense");
  const [newCategory, setNewCategory] = useState<string>("");
  const [newAccount, setNewAccount] = useState<string>("");
  const [newToAccount, setNewToAccount] = useState<string>("");
  const [newNote, setNewNote] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [txRes, accRes, catRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .or(`user_id.is.null,user_id.eq.${user.id}`),
    ]);

    if (txRes.error) console.error("Error fetching transactions:", txRes.error);
    if (accRes.error) console.error("Error fetching accounts:", accRes.error);
    if (catRes.error) console.error("Error fetching categories:", catRes.error);

    setTransactions(txRes.data || []);
    setAccounts(accRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setNewDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!newAmount || !user) return;

    const transactionData: any = {
      user_id: user.id,
      amount: parseFloat(newAmount),
      type: newType,
      account_id: newAccount,
      date: new Date(newDate).toISOString(),
      note: newNote,
    };

    if (newType === "transfer") {
      transactionData.to_account_id = newToAccount;
      transactionData.category_id = null;
    } else {
      transactionData.category_id = newCategory || null;
    }

    if (isEditing && editingId) {
      const { error } = await supabase
        .from("transactions")
        .update(transactionData)
        .eq("id", editingId);

      if (error) {
        console.error("Error updating transaction:", error);
        alert("Failed to update transaction: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("transactions")
        .insert(transactionData);

      if (error) {
        console.error("Error adding transaction:", error);
        alert("Failed to add transaction: " + error.message);
        return;
      }
    }

    await fetchData();
    closeModal();
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction: " + error.message);
      return;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const openAddModal = (type: TransactionType = "expense") => {
    setEditingId(null);
    setNewAmount("");
    setNewType(type);
    setNewCategory(categories.find((c) => c.applies_to !== "income")?.id || "");
    setNewAccount(accounts[0]?.id || "");
    setNewToAccount("");
    setNewNote("");
    setNewDate(new Date().toISOString().split("T")[0]);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setNewAmount(Number(transaction.amount).toString());
    setNewType(transaction.type);
    setNewCategory(transaction.category_id || "");
    setNewAccount(transaction.account_id);
    setNewToAccount(transaction.to_account_id || "");
    setNewNote(transaction.note);
    setNewDate(new Date(transaction.date).toISOString().split("T")[0]);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
  };

  return {
    transactions,
    accounts,
    categories,
    loading,
    isModalOpen,
    setIsModalOpen,
    isEditing,

    // Form Values
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
    refetch: fetchData,
  };
}
