export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  note: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface ChartDataPoint {
  name: string;
  amount: number;
  fullDate?: Date;
}
