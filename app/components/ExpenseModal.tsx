import React from "react";
import { X } from "lucide-react";
import { Card, Button, Input, Select } from "../components";
import { DEFAULT_CATEGORIES } from "../constants";

interface ExpenseModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isEditing: boolean;
  newAmount: string;
  setNewAmount: (amount: string) => void;
  newCategory: string;
  setNewCategory: (category: string) => void;
  newNote: string;
  setNewNote: (note: string) => void;
  newDate: string;
  setNewDate: (date: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ExpenseModal({
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
  handleSubmit,
}: ExpenseModalProps) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-slate-400 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Amount (₱)
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Category
            </label>
            <Select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              options={DEFAULT_CATEGORIES.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <Input
              type="text"
              placeholder="e.g. Grocery run"
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
            <Button type="submit" className="w-full">
              {isEditing ? "Update Expense" : "Add Expense"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
