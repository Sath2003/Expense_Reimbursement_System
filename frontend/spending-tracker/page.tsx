'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface EmployeeSpending {
  employee_id: number;
  employee_name: string;
  department: string;
  total_spent: number;
  expense_count: number;
  average_expense: number;
  last_expense_date: string;
  trend: Array<{
    date: string;
    amount: number;
    cumulative: number;
  }>;
  category_distribution: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export default function SpendingTrackerPage() {
  const [employees, setEmployees] = useState<EmployeeSpending[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSpending | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'total' | 'count' | 'average' | 'recent'>('total');

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (!role || (role !== 'HR' && role !== 'Manager' && role !== 'Finance')) {
      setError('You do not have access to spending tracker');
      setLoading(false);
      return;
    }

    fetchSpendingData();
  }, []);

  const fetchSpendingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/api/analytics/spending?period=year', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load spending data');
      }

      const data = await response.json();
      setEmployees(data.top_spenders || []);
      if (data.top_spenders && data.top_spenders.length > 0) {
        setSelectedEmployee(data.top_spenders[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees
    .filter((emp) =>
      emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'total':
          return b.total_spent - a.total_spent;
        case 'count':
          return b.expense_count - a.expense_count;
        case 'average':
          return b.average_expense - a.average_expense;
        case 'recent':
          return new Date(b.last_expense_date).getTime() - new Date(a.last_expense_date).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-primary-900 mb-2">💰 Spending Tracker</h1>
              <p className="text-slate-600">Monitor employee spending patterns and trends</p>
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-slate-600">Loading spending data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Employee List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-soft-md p-6">
                <h2 className="text-xl font-bold text-primary-900 mb-4">👥 Employees</h2>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="total">Total Spent (High to Low)</option>
                  <option value="count">Expense Count</option>
                  <option value="average">Average Expense</option>
                  <option value="recent">Recent Activity</option>
                </select>

                {/* Employee List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.employee_id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`w-full p-3 rounded-lg text-left transition ${
                        selectedEmployee?.employee_id === emp.employee_id
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 text-primary-900'
                      }`}
                    >
                      <div className="font-semibold text-sm">{emp.employee_name}</div>
                      <div className={`text-xs ${selectedEmployee?.employee_id === emp.employee_id ? 'text-primary-900' : 'text-slate-600'}`}>
                        {emp.department}
                      </div>
                      <div className={`text-xs font-bold mt-1 ${selectedEmployee?.employee_id === emp.employee_id ? 'text-primary-900' : 'text-secondary-600'}`}>
                        ${emp.total_spent.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Detailed View */}
            <div className="lg:col-span-2">
              {selectedEmployee ? (
                <div className="space-y-6">
                  {/* Employee Overview Card */}
                  <div className="bg-white rounded-lg shadow-soft-md p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-3xl font-bold text-primary-900">{selectedEmployee.employee_name}</h3>
                        <p className="text-slate-600 mt-1">{selectedEmployee.department}</p>
                      </div>
                      <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold text-lg">
                        #{filteredEmployees.findIndex((e) => e.employee_id === selectedEmployee.employee_id) + 1}
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
                        <p className="text-slate-600 text-xs font-semibold mb-1">TOTAL SPENT</p>
                        <p className="text-2xl font-bold text-primary-600">${selectedEmployee.total_spent.toFixed(2)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-4">
                        <p className="text-slate-600 text-xs font-semibold mb-1">SUBMISSIONS</p>
                        <p className="text-2xl font-bold text-secondary-600">{selectedEmployee.expense_count}</p>
                      </div>
                      <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-4">
                        <p className="text-slate-600 text-xs font-semibold mb-1">AVERAGE</p>
                        <p className="text-2xl font-bold text-accent-600">${selectedEmployee.average_expense.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        Last expense: <span className="font-semibold text-primary-900">{selectedEmployee.last_expense_date}</span>
                      </p>
                    </div>
                  </div>

                  {/* Spending Trend Chart */}
                  <div className="bg-white rounded-lg shadow-soft-md p-6">
                    <h4 className="text-lg font-bold text-primary-900 mb-4">📈 Spending Trend</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={selectedEmployee.trend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#6b7c9e" name="Monthly Spend" />
                        <Line type="monotone" dataKey="cumulative" stroke="#4a9070" name="Cumulative" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Distribution */}
                  <div className="bg-white rounded-lg shadow-soft-md p-6">
                    <h4 className="text-lg font-bold text-primary-900 mb-4">📊 Spending by Category</h4>
                    <div className="space-y-3">
                      {selectedEmployee.category_distribution && selectedEmployee.category_distribution.length > 0 ? (
                        selectedEmployee.category_distribution.map((cat, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-primary-900">{cat.category}</span>
                                <span className="text-sm text-slate-600">
                                  ${cat.amount.toFixed(2)} ({cat.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${cat.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-600 text-sm">No category data available</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-soft-md p-8 text-center">
                  <p className="text-slate-600">Select an employee to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
