"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { X, Search } from "lucide-react";

// Curated list of icons useful for expense tracking
const AVAILABLE_ICONS = [
  "Utensils",
  "Coffee",
  "Wine",
  "Beer",
  "Pizza",
  "Apple",
  "Sandwich",
  "IceCreamCone",
  "Car",
  "Bus",
  "Train",
  "Plane",
  "Fuel",
  "Bike",
  "Zap",
  "Wifi",
  "Phone",
  "Tv",
  "Monitor",
  "Smartphone",
  "ShoppingBag",
  "ShoppingCart",
  "Store",
  "Tag",
  "Percent",
  "Film",
  "Music",
  "Gamepad2",
  "Ticket",
  "Popcorn",
  "Camera",
  "Heart",
  "Dumbbell",
  "Pill",
  "Stethoscope",
  "Activity",
  "Briefcase",
  "Building2",
  "Landmark",
  "Wallet",
  "Banknote",
  "Coins",
  "CreditCard",
  "PiggyBank",
  "TrendingUp",
  "TrendingDown",
  "BarChart3",
  "LineChart",
  "Home",
  "Key",
  "Wrench",
  "Hammer",
  "PaintBucket",
  "GraduationCap",
  "BookOpen",
  "Pencil",
  "School",
  "Baby",
  "Dog",
  "Cat",
  "Flower2",
  "Trees",
  "Gift",
  "PartyPopper",
  "Sparkles",
  "Star",
  "Globe",
  "MapPin",
  "Compass",
  "Mountain",
  "Umbrella",
  "Shirt",
  "Scissors",
  "Gem",
  "Watch",
  "Glasses",
  "MoreHorizontal",
  "CircleDot",
  "Square",
  "Triangle",
  "Hexagon",
  "Receipt",
  "FileText",
  "ClipboardList",
  "Calculator",
  "HandCoins",
  "BadgeDollarSign",
  "CircleDollarSign",
  "Droplets",
  "Flame",
  "Snowflake",
  "Sun",
  "Moon",
];

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
}

function getIconComponent(iconName: string): React.ElementType | null {
  const icons = LucideIcons as unknown as Record<string, React.ElementType>;
  return icons[iconName] || null;
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const filteredIcons = useMemo(
    () =>
      AVAILABLE_ICONS.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const SelectedIcon = getIconComponent(value);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
      >
        {SelectedIcon ? (
          <SelectedIcon size={18} className="text-slate-700" />
        ) : (
          <LucideIcons.CircleDot size={18} className="text-slate-400" />
        )}
        <span className="text-slate-600 text-xs">{value || "Pick icon"}</span>
        <LucideIcons.ChevronDown size={14} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-80 max-h-80 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-slate-50">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-slate-400" />
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="p-2 overflow-y-auto max-h-60 grid grid-cols-8 gap-1">
            {filteredIcons.map((iconName) => {
              const Icon = getIconComponent(iconName);
              if (!Icon) return null;
              const isSelected = value === iconName;

              return (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={18} />
                </button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div className="col-span-8 py-4 text-center text-sm text-slate-400">
                No icons found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
