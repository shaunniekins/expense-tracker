-- ============================================================
-- Seed: Default System Categories
-- These have user_id = NULL so they are visible to all users.
-- Run this AFTER 001_create_tables.sql
-- ============================================================

INSERT INTO categories (user_id, name, color, icon) VALUES
  (NULL, 'Food & Dining',     '#ef4444', 'Utensils'),
  (NULL, 'Transportation',    '#f97316', 'Car'),
  (NULL, 'Bills & Utilities', '#3b82f6', 'Zap'),
  (NULL, 'Shopping',          '#8b5cf6', 'ShoppingBag'),
  (NULL, 'Entertainment',     '#ec4899', 'Film'),
  (NULL, 'Health & Fitness',  '#10b981', 'Heart'),
  (NULL, 'Salary',            '#059669', 'Briefcase'),
  (NULL, 'Investment',        '#0ea5e9', 'TrendingUp'),
  (NULL, 'Gift',              '#d946ef', 'Gift'),
  (NULL, 'Other',             '#64748b', 'MoreHorizontal');
