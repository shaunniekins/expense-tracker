"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../lib/supabaseClient";
import { useAuth } from "../components/AuthProvider";
import { Account, AccountType } from "../types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching accounts:", error);
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = async (
    name: string,
    type: AccountType = "bank",
  ): Promise<Account | null> => {
    if (!user) return null;
    const maxOrder =
      accounts.length > 0 ? Math.max(...accounts.map((a) => a.sort_order)) : -1;

    const { data, error } = await supabase
      .from("accounts")
      .insert({
        user_id: user.id,
        name,
        type,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding account:", error);
      alert("Failed to add account: " + error.message);
      return null;
    }

    setAccounts((prev) => [...prev, data]);
    return data;
  };

  const editAccount = async (
    id: string,
    updates: Partial<Pick<Account, "name" | "type">>,
  ) => {
    const { error } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating account:", error);
      alert("Failed to update account: " + error.message);
      return;
    }

    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  };

  const getAccountBalance = async (id: string): Promise<number> => {
    if (!user) return 0;

    // Income to this account
    const { data: incomeData } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("account_id", id)
      .eq("type", "income");

    const income = (incomeData || []).reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    // Expenses from this account
    const { data: expenseData } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("account_id", id)
      .eq("type", "expense");

    const expense = (expenseData || []).reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    // Transfers out (from this account)
    const { data: transferOutData } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("account_id", id)
      .eq("type", "transfer");

    const transferOut = (transferOutData || []).reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    // Transfers in (to this account)
    const { data: transferInData } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("to_account_id", id)
      .eq("type", "transfer");

    const transferIn = (transferInData || []).reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    return income - expense - transferOut + transferIn;
  };

  const deleteAccount = async (id: string): Promise<boolean> => {
    const balance = await getAccountBalance(id);
    if (balance !== 0) {
      alert(
        `Cannot delete this account. Balance is ₱${balance.toFixed(2)}. Balance must be exactly ₱0.00 to delete.`,
      );
      return false;
    }

    if (accounts.length <= 1) {
      alert("You need at least one account.");
      return false;
    }

    const { error } = await supabase.from("accounts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account: " + error.message);
      return false;
    }

    setAccounts((prev) => prev.filter((a) => a.id !== id));
    return true;
  };

  const forceDeleteAccount = async (id: string): Promise<boolean> => {
    if (accounts.length <= 1) {
      alert("You need at least one account.");
      return false;
    }

    // Delete all transactions associated with this account first
    const { error: txError } = await supabase
      .from("transactions")
      .delete()
      .or(`account_id.eq.${id},to_account_id.eq.${id}`);

    if (txError) {
      console.error("Error deleting related transactions:", txError);
      alert("Failed to delete related transactions: " + txError.message);
      return false;
    }

    const { error } = await supabase.from("accounts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account: " + error.message);
      return false;
    }

    setAccounts((prev) => prev.filter((a) => a.id !== id));
    return true;
  };

  const updateSortOrder = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) => ({
      id,
      sort_order: index,
      user_id: user!.id,
    }));

    const { error } = await supabase.from("accounts").upsert(updates);

    if (error) {
      console.error("Error updating sort order:", error);
      return;
    }

    setAccounts((prev) => {
      const sorted = [...prev].sort(
        (a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id),
      );
      return sorted.map((a, i) => ({ ...a, sort_order: i }));
    });
  };

  return {
    accounts,
    loading,
    addAccount,
    editAccount,
    deleteAccount,
    forceDeleteAccount,
    getAccountBalance,
    updateSortOrder,
    refetch: fetchAccounts,
  };
}
