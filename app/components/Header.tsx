import React from "react";
import { Plus } from "lucide-react";
import { Button } from "./Button";

interface HeaderProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onExport: () => void;
  onImportChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
}

export function Header({
  left,
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
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">{left}</div>
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            {center}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onExport}>
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleImportClick}>
              Import CSV
            </Button>
            <Button onClick={onAdd}>
              <Plus size={16} className="mr-2" /> Add Expense
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
