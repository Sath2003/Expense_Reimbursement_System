'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  top_spenders: Array<{
    employee_id: number;
    employee_name: string;
    department: string;
    total_spent: number;
    expense_count: number;
    average_expense: number;
  }>;
  category_breakdown: Array<{
    category_name: string;
    total_amount: number;
    count: number;
    percentage: number;
  }>;
  total_expenses: number;
  total_amount: number;
  average_expense: number;
  active_employees: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    setUserRole(role || '');
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:8000/api/analytics/spending?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setError('Failed to load analytics data');
        return;
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!userRole || (userRole !== 'HR' && userRole !== 'Manager')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-soft-md p-8 text-center">
            <h1 className="text-3xl font-bold text-primary-900 mb-4">Access Denied</h1>
            <p className="text-slate-600 mb-6">
              Analytics dashboard is only available for HR and Manager roles.
            </p>
            <Link href="/home" className="text-primary-600 hover:text-primary-800 font-semibold">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-primary-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Track spending and monitor expense trends</p>
            </div>
            <Link href="/home" className="text-blue-600 hover:underline font-semibold">
              ← Back to Home
            </Link>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 flex-wrap">
            {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
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
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">TOTAL EXPENSES</p>
                <p className="text-3xl font-bold text-gray-800">
                  ${analytics.total_amount.toFixed(2)}
                </p>
                <p className="text-gray-500 text-xs mt-2">{analytics.total_expenses} submissions</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">AVERAGE EXPENSE</p>
                <p className="text-3xl font-bold text-gray-800">
                  ${analytics.average_expense.toFixed(2)}
                </p>
                <p className="text-gray-500 text-xs mt-2">per submission</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">ACTIVE EMPLOYEES</p>
                <p className="text-3xl font-bold text-gray-800">
                  {analytics.active_employees}
                </p>
                <p className="text-gray-500 text-xs mt-2">with expenses</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">TOTAL SUBMISSIONS</p>
                <p className="text-3xl font-bold text-gray-800">
                  {analytics.total_expenses}
                </p>
                <p className="text-gray-500 text-xs mt-2">in this period</p>
              </div>
            </div>

            {/* Top Spenders Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">👥 Top Spenders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Rank</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Employee</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Department</th>
                      <th className="px-6 py-4 text-right text-gray-700 font-semibold">Total Spent</th>
                      <th className="px-6 py-4 text-right text-gray-700 font-semibold">Submissions</th>
                      <th className="px-6 py-4 text-right text-gray-700 font-semibold">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.top_spenders.map((spender, index) => (
                      <tr key={spender.employee_id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-semibold">{spender.employee_name}</td>
                        <td className="px-6 py-4 text-gray-600">{spender.department}</td>
                        <td className="px-6 py-4 text-right text-gray-800 font-bold text-lg">
                          ${spender.total_spent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                            {spender.expense_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          ${spender.average_expense.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Top Spenders */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Top 5 Spenders Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.top_spenders.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="employee_name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_spent" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Category Breakdown */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.category_breakdown}
                      dataKey="total_amount"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label
                    >
                      {analytics.category_breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">📊 Category Breakdown</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {analytics.category_breakdown.map((category, index) => (
                    <div key={category.category_name} className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-800">{category.category_name}</span>
                          <span className="text-gray-600">
                            ${category.total_amount.toFixed(2)} ({category.count} items)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{category.percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
