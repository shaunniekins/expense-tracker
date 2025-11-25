import React from "react";
import { Plus, Download, Upload } from "lucide-react";
import { Button } from "./Button";
import Link from "next/link";

interface HeaderProps {
  center?: React.ReactNode;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onExport: () => void;
  onImportChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
}

export function Header({
  center,
  fileInputRef,
  onExport,
  onImportChange,
  onAdd,
}: HeaderProps) {
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
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
              ExpenseTracker
            </Link>
          </div>
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900 truncate mx-2">
            {center}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex gap-2">
              <Button variant="outline" onClick={onExport}>
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handleImportClick}>
                <Upload size={16} className="mr-2" />
                Import CSV
              </Button>
            </div>
            <div className="flex md:hidden gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onExport}
                title="Export CSV"
              >
                <Download size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleImportClick}
                title="Import CSV"
              >
                <Upload size={18} />
              </Button>
            </div>
            <Button onClick={onAdd}>
              <Plus size={16} className="mr-2" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="inline sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onImportChange}
        accept=".csv"
        style={{ display: "none" }}
      />
    </>
  );
}
