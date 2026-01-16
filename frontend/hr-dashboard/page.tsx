'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SpendingData {
  employee_id: number;
  employee_name: string;
  total_spent: number;
  expense_count: number;
  department: string;
  average_expense: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export default function HRDashboard() {
  const [topSpenders, setTopSpenders] = useState<SpendingData[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategorySpending[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [averageExpense, setAverageExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:8000/api/analytics/spending?period=${selectedPeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTopSpenders(data.top_spenders || []);
        setCategoryBreakdown(data.category_breakdown || []);
        setTotalExpenses(data.total_expenses || 0);
        setAverageExpense(data.average_expense || 0);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      setError('Error loading analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">HR Dashboard</h1>
          <p className="text-slate-600">Track employee spending and expense analytics</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-4">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                selectedPeriod === period
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-soft-md p-6">
            <p className="text-slate-600 text-sm mb-2">Total Expenses</p>
            <p className="text-3xl font-bold text-primary-600">${totalExpenses.toFixed(2)}</p>
            <p className="text-slate-500 text-xs mt-2">All departments</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Average Expense</p>
            <p className="text-3xl font-bold text-green-600">${averageExpense.toFixed(2)}</p>
            <p className="text-gray-500 text-xs mt-2">Per expense</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Submissions</p>
            <p className="text-3xl font-bold text-purple-600">
              {topSpenders.reduce((sum, emp) => sum + emp.expense_count, 0)}
            </p>
            <p className="text-gray-500 text-xs mt-2">Across employees</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Active Employees</p>
            <p className="text-3xl font-bold text-orange-600">{topSpenders.length}</p>
            <p className="text-gray-500 text-xs mt-2">With expenses</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-slate-600 mt-4">Loading analytics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Spenders */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-soft-md p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-6">Top Spenders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-primary-700">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-primary-700">Employee</th>
                      <th className="text-left py-3 px-4 font-semibold text-primary-700">Department</th>
                      <th className="text-right py-3 px-4 font-semibold text-primary-700">Total Spent</th>
                      <th className="text-right py-3 px-4 font-semibold text-primary-700">Count</th>
                      <th className="text-right py-3 px-4 font-semibold text-primary-700">Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSpenders.length > 0 ? (
                      topSpenders.map((spender, index) => (
                        <tr
                          key={spender.employee_id}
                          className={`border-b ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                          } hover:bg-primary-50 transition`}
                        >
                          <td className="py-4 px-4">
                            <span className="inline-block w-8 h-8 bg-primary-600 text-white rounded-full text-center font-bold">
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-gray-800">{spender.employee_name}</p>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{spender.department}</td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-bold text-green-600">
                              ${spender.total_spent.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-gray-600">
                            {spender.expense_count}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-600">
                            ${spender.average_expense.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No expense data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow-soft-md p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-6">Spending by Category</h2>
              <div className="space-y-4">
                {categoryBreakdown.length > 0 ? (
                  categoryBreakdown.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <p className="font-medium text-primary-700">{category.category}</p>
                        <p className="font-semibold text-primary-900">${category.amount.toFixed(2)}</p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{category.percentage}% of total</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Links */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/analytics/detailed-report"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            View Detailed Report
          </Link>
          <Link
            href="/analytics/employee-tracking"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
          >
            Track Individual Employees
          </Link>
        </div>
      </div>
    </div>
  );
}
