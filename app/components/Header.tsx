import React from "react";
import { Plus, Settings, LogOut } from "lucide-react";
import { Button } from "./Button";
import Link from "next/link";
import { TransactionType } from "../types";

interface HeaderProps {
  center?: React.ReactNode;
  onAdd: (type?: TransactionType) => void;
  onSignOut?: () => void;
}

export function Header({ center, onAdd, onSignOut }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10 w-full">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold md:font-bold md:text-xl text-slate-900 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="ExpenseTracker Logo"
                className="h-6 w-6"
              />
            </div>
            <span className="hidden sm:inline">ExpenseTracker</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900 truncate mx-2">
          {center}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/manage">
            <Button variant="outline">
              <Settings size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Manage</span>
            </Button>
          </Link>

          <Button
            onClick={() => onAdd("expense")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">New Entry</span>
          </Button>

          {onSignOut && (
            <Button
              variant="ghost"
              onClick={onSignOut}
              className="text-slate-400 hover:text-slate-900"
              title="Sign Out"
            >
              <LogOut size={16} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
