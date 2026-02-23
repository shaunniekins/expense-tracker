// Updated types to match Supabase schema

export type CategoryScope = "both" | "expense" | "income";
export type TransactionType = "expense" | "income" | "transfer";
export type AccountType = "cash" | "bank" | "wallet";

export interface Category {
  id: string;
  user_id: string | null; // null = system default
  name: string;
  color: string;
  icon: string; // Lucide icon name
  applies_to: CategoryScope;
  created_at?: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  sort_order: number;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  account_id: string;
  to_account_id: string | null;
  note: string;
  date: string;
  created_at?: string;
  // Joined fields (populated via query)
  category?: Category;
  account?: Account;
  to_account?: Account;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface ChartDataPoint {
  name: string;
  income: number;
  expense: number;
  fullDate?: Date;
}
