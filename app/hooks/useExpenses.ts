import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Papa from "papaparse";
import { Expense } from "../types";
import { DEFAULT_CATEGORIES } from "../constants";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("expenses");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          console.log("Initializing expenses from localStorage:", parsed);
          return parsed as Expense[];
        }
      }
    } catch (error) {
      console.error(
        "Error reading expenses from localStorage during init:",
        error
      );
      try {
        localStorage.removeItem("expenses");
      } catch {}
    }
    return [];
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [newAmount, setNewAmount] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("food");
  const [newNote, setNewNote] = useState<string>("");
  const [newDate, setNewDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      console.log("Saving expenses to localStorage:", expenses);
      localStorage.setItem("expenses", JSON.stringify(expenses));
    } catch (error) {
      console.error("Error saving expenses to localStorage:", error);
    }
  }, [expenses]);

  const exportToCSV = () => {
    const csv = Papa.unparse(
      expenses.map((e) => ({
        amount: e.amount,
        category: e.category,
        note: e.note,
        date: e.date,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "expenses.csv";
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const newExpenses: Expense[] = (results.data as any[])
            .map((row) => ({
              id: Date.now() + Math.random(),
              amount: parseFloat(row.amount),
              category: row.category,
              note: row.note,
              date: row.date,
            }))
            .filter(
              (e) =>
                !isNaN(e.amount) &&
                e.category &&
                e.note &&
                e.date &&
                DEFAULT_CATEGORIES.some((c) => c.id === e.category)
            );
          // Check for duplicates based on amount, category, note, date
          const existingSet = new Set(
            expenses.map((e) => `${e.amount}-${e.category}-${e.note}-${e.date}`)
          );
          const uniqueNew = newExpenses.filter(
            (ne) =>
              !existingSet.has(
                `${ne.amount}-${ne.category}-${ne.note}-${ne.date}`
              )
          );
          setExpenses((prev) => [...uniqueNew, ...prev]);
          // Reset the file input to allow re-uploading the same file
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!newAmount) return;

    if (isEditing && editingExpense) {
      setExpenses(
        expenses.map((exp) =>
          exp.id === editingExpense.id
            ? {
                ...exp,
                amount: parseFloat(newAmount),
                category: newCategory,
                note: newNote || "Expense",
                date: new Date(newDate).toISOString(),
              }
            : exp
        )
      );
    } else {
      const expense: Expense = {
        id: Date.now(),
        amount: parseFloat(newAmount),
        category: newCategory,
        note: newNote || "Expense",
        date: new Date(newDate).toISOString(),
      };
      setExpenses([expense, ...expenses]);
    }

    setNewAmount("");
    setNewNote("");
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingExpense(null);
  };

  const deleteExpense = (id: number): void => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setNewAmount("");
    setNewCategory("food");
    setNewNote("");
    setNewDate(new Date().toISOString().split("T")[0]);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setNewAmount(expense.amount.toString());
    setNewCategory(expense.category);
    setNewNote(expense.note);
    setNewDate(new Date(expense.date).toISOString().split("T")[0]);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return {
    expenses,
    isModalOpen,
    setIsModalOpen,
    isEditing,
    editingExpense,
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
  };
}
