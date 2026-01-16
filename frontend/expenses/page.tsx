'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Expense {
  id: number;
  user_id: number;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  approval_status: string;
  created_at: string;
  attachments_count: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load expenses');
      }

      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedExpenses = expenses
    .filter((exp) => {
      const matchStatus = filterStatus === 'all' || exp.approval_status === filterStatus;
      const matchCategory = filterCategory === 'all' || exp.category === filterCategory;
      const matchSearch =
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchCategory && matchSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'status':
          return a.approval_status.localeCompare(b.approval_status);
        default:
          return 0;
      }
    });

  const categories = Array.from(new Set(expenses.map((e) => e.category)));
  const statuses = Array.from(new Set(expenses.map((e) => e.approval_status)));

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '✓';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '✕';
      default:
        return '•';
    }
  };

  const getTotalAmount = () => {
    return filteredAndSortedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-primary-900 mb-2">📋 My Expenses</h1>
              <p className="text-slate-600">View and manage all your submitted expenses</p>
            </div>
            <Link href="/home" className="text-primary-600 hover:text-primary-800 font-semibold">
              ← Back to Home
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading expenses...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">TOTAL EXPENSES</p>
                <p className="text-3xl font-bold text-gray-800">{expenses.length}</p>
                <p className="text-gray-500 text-xs mt-2">submissions</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">TOTAL AMOUNT</p>
                <p className="text-3xl font-bold text-gray-800">${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</p>
                <p className="text-gray-500 text-xs mt-2">all time</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">APPROVED</p>
                <p className="text-3xl font-bold text-gray-800">
                  {expenses.filter((e) => e.approval_status === 'approved').length}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  $
                  {expenses
                    .filter((e) => e.approval_status === 'approved')
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">PENDING</p>
                <p className="text-3xl font-bold text-gray-800">
                  {expenses.filter((e) => e.approval_status === 'pending').length}
                </p>
                <p className="text-gray-500 text-xs mt-2">awaiting approval</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🔍 Filters & Search</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Sort by Date (Newest)</option>
                  <option value="amount">Sort by Amount (Highest)</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-lg shadow-soft-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">📊 Expense List</h3>
                  <span className="px-3 py-1 bg-primary-500 text-white rounded-full text-sm font-semibold">
                    {filteredAndSortedExpenses.length} expenses
                  </span>
                </div>
              </div>

              {filteredAndSortedExpenses.length === 0 ? (
                <div className="p-8 text-center text-slate-600">
                  <p className="text-lg mb-2">No expenses found</p>
                  <p className="text-sm">Try adjusting your filters or add new expenses</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="px-6 py-4 text-left text-primary-700 font-semibold">Date</th>
                        <th className="px-6 py-4 text-left text-primary-700 font-semibold">Description</th>
                        <th className="px-6 py-4 text-left text-primary-700 font-semibold">Category</th>
                        <th className="px-6 py-4 text-right text-primary-700 font-semibold">Amount</th>
                        <th className="px-6 py-4 text-center text-primary-700 font-semibold">Status</th>
                        <th className="px-6 py-4 text-center text-primary-700 font-semibold">Files</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedExpenses.map((expense) => (
                        <tr key={expense.id} className="border-b hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-primary-900">
                            <span className="font-semibold">
                              {new Date(expense.expense_date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-primary-900">
                            <p className="font-medium">{expense.description.substring(0, 50)}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Submitted: {new Date(expense.created_at).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-bold text-lg text-primary-900">${expense.amount.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(expense.approval_status)}`}>
                              {getStatusIcon(expense.approval_status)} {expense.approval_status.charAt(0).toUpperCase() + expense.approval_status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {expense.attachments_count > 0 ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold">
                                📎 {expense.attachments_count}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary Row */}
                  <div className="bg-slate-50 border-t px-6 py-4 flex justify-end gap-4">
                    <div className="text-right">
                      <p className="text-slate-600 text-sm">Total for filtered results:</p>
                      <p className="text-2xl font-bold text-primary-600">${getTotalAmount().toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Section */}
            <div className="mt-8 flex gap-4">
              <Link href="/submit-expense">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
                  ➕ Add New Expense
                </button>
              </Link>
              <button className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition">
                📥 Export as CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
