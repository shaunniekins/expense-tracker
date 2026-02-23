"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Account } from "../types";

interface AccountSelectProps {
  accounts: Account[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AccountSelect({
  accounts,
  value,
  onChange,
  placeholder = "Select account...",
}: AccountSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedAccount = accounts.find((a) => a.id === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <span className={selectedAccount ? "text-slate-900" : "text-slate-500"}>
          {selectedAccount ? selectedAccount.name : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <div className="px-2 py-1 sticky top-0 bg-white border-b">
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {filteredAccounts.length === 0 && (
            <div className="relative cursor-default select-none py-2 px-4 text-slate-700">
              No accounts found.
            </div>
          )}

          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-slate-100 flex items-center justify-between ${
                value === account.id ? "bg-slate-50 font-medium" : ""
              }`}
              onClick={() => {
                onChange(account.id);
                setOpen(false);
                setSearchTerm("");
              }}
            >
              <span className="block truncate">{account.name}</span>
              {value === account.id && (
                <span className="absolute inset-y-0 right-2 flex items-center text-slate-600">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
