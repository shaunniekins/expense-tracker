-- ============================================================
-- Seed: Default System Categories
-- These have user_id = NULL so they are visible to all users.
-- Run this AFTER 001_create_tables.sql
-- ============================================================

INSERT INTO categories (user_id, name, color, icon, applies_to) VALUES
  (NULL, 'Food & Dining',     '#ef4444', 'Utensils',        'both'),
  (NULL, 'Transportation',    '#f97316', 'Car',             'expense'),
  (NULL, 'Bills & Utilities', '#3b82f6', 'Zap',            'expense'),
  (NULL, 'Shopping',          '#8b5cf6', 'ShoppingBag',     'both'),
  (NULL, 'Entertainment',     '#ec4899', 'Film',            'expense'),
  (NULL, 'Health & Fitness',  '#10b981', 'Heart',           'both'),
  (NULL, 'Salary',            '#059669', 'Briefcase',       'income'),
  (NULL, 'Investment',        '#0ea5e9', 'TrendingUp',      'income'),
  (NULL, 'Gift',              '#d946ef', 'Gift',            'both'),
  (NULL, 'Other',             '#64748b', 'MoreHorizontal',  'both');
