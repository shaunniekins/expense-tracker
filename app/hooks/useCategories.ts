"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../lib/supabaseClient";
import { useAuth } from "../components/AuthProvider";
import { Category, CategoryScope, TransactionType } from "../types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch system defaults (user_id IS NULL) and user's custom categories
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (
    category: Pick<Category, "name" | "color" | "icon" | "applies_to">,
  ): Promise<Category | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        ...category,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category: " + error.message);
      return null;
    }

    setCategories((prev) => [...prev, data]);
    return data;
  };

  const editCategory = async (
    id: string,
    updates: Partial<Pick<Category, "name" | "color" | "icon" | "applies_to">>,
  ) => {
    // Only allow editing user-created categories
    const cat = categories.find((c) => c.id === id);
    if (!cat || cat.user_id === null) {
      alert("Cannot edit system default categories.");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category: " + error.message);
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const cat = categories.find((c) => c.id === id);
    if (!cat || cat.user_id === null) {
      alert("Cannot delete system default categories.");
      return false;
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category: " + error.message);
      return false;
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Get categories filtered by transaction type
  const getFilteredCategories = useCallback(
    (type: TransactionType): Category[] => {
      if (type === "transfer") return [];
      return categories.filter(
        (c) => c.applies_to === "both" || c.applies_to === type,
      );
    },
    [categories],
  );

  return {
    categories,
    loading,
    addCategory,
    editCategory,
    deleteCategory,
    getFilteredCategories,
    refetch: fetchCategories,
  };
}
