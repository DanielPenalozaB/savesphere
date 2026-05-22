import type { Component } from 'svelte';

export type Transaction = {
  id: number;
  name: string;
  category: string;
  date: string;
  amount: string;
  icon: Component;
  color: string;
  wallet: string;
};

export type Bill = {
  name: string;
  amount: number;
  category: string;
  frequency: string;
  dueDate: string;
  payDate: string;
  paymentMethod: 'Manual' | 'Auto';
};

export type SpendingCategory = {
  name: string;
  percentage: number;
  color: string;
};

export type SpendingSummary = {
  totalSpent: string;
  savingRate: string;
  categories: SpendingCategory[];
};
