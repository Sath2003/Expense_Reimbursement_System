'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Report {
  title: string;
  metric: string;
  value: number | string;
  unit: string;
  trend: string;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4'];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'breakdown' | 'details'>('overview');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (!role || (role !== 'HR' && role !== 'Manager' && role !== 'Finance')) {
      setError('You do not have access to reports');
      setLoading(false);
      return;
    }

    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:8000/api/analytics/spending?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load report data');
      }

      const data = await response.json();
      setAnalyticsData(data);

      // Generate reports
      const generatedReports: Report[] = [
        {
          title: 'Total Expenses',
          metric: 'Amount',
          value: `$${data.total_amount.toFixed(2)}`,
          unit: `${data.total_expenses} submissions`,
          trend: `+${Math.floor(data.total_amount / 100)}% vs last period`,
          color: 'from-primary-500 to-primary-600',
        },
        {
          title: 'Average Expense',
          metric: 'Per Submission',
          value: `$${data.average_expense.toFixed(2)}`,
          unit: `across ${data.total_expenses} expenses`,
          trend: data.average_expense > 200 ? '⚠️ Above Target' : '✓ On Target',
          color: 'from-green-500 to-green-600',
        },
        {
          title: 'Active Employees',
          metric: 'Spending',
          value: data.active_employees,
          unit: `employees with expenses`,
          trend: `${Math.round((data.active_employees / 100) * 100)}% engagement`,
          color: 'from-purple-500 to-purple-600',
        },
        {
          title: 'Most Used Category',
          metric: 'Dominant',
          value: data.category_breakdown?.[0]?.category_name || 'N/A',
          unit: `${data.category_breakdown?.[0]?.percentage.toFixed(1)}% of total`,
          trend: `${data.category_breakdown?.[0]?.count} submissions`,
          color: 'from-orange-500 to-orange-600',
        },
      ];

      setReports(generatedReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = () => {
    // Mock trend data - in production, this would come from backend
    return [
      { month: 'Jan', total: 4500, avg: 180 },
      { month: 'Feb', total: 5200, avg: 210 },
      { month: 'Mar', total: 4800, avg: 195 },
      { month: 'Apr', total: 6100, avg: 220 },
      { month: 'May', total: 5800, avg: 215 },
      { month: 'Jun', total: 7200, avg: 240 },
    ];
  };

  const generateComparisonData = () => {
    return analyticsData?.top_spenders?.slice(0, 5).map((emp: any) => ({
      name: emp.employee_name.split(' ')[0],
      total: emp.total_spent,
      average: emp.average_expense,
      count: emp.expense_count,
    })) || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-primary-900 mb-2">📊 Reports & Analytics</h1>
              <p className="text-slate-600">Comprehensive expense analysis and insights</p>
            </div>
            <Link href="/home" className="text-primary-600 hover:text-primary-800 font-semibold">
              ← Back to Home
            </Link>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Period Selector */}
            <div className="flex gap-2">
              {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    period === p
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-primary-700 hover:bg-slate-50 border border-slate-300'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* View Selector */}
            <div className="flex gap-2">
              {(['overview', 'trends', 'breakdown', 'details'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedView(v)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedView === v
                      ? 'bg-secondary-600 text-white'
                      : 'bg-white text-primary-700 hover:bg-slate-50 border border-slate-300'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
              📥 Export CSV
            </button>
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
            <p className="mt-4 text-slate-600">Generating reports...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {reports.map((report, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-soft-md p-6 border-l-4 border-primary-600">
                  <p className="text-slate-600 text-sm font-semibold mb-2">{report.title.toUpperCase()}</p>
                  <p className="text-3xl font-bold text-primary-900">{report.value}</p>
                  <p className="text-slate-500 text-xs mt-2">{report.unit}</p>
                  <p className="text-primary-600 text-xs font-semibold mt-2">{report.trend}</p>
                </div>
              ))}
            </div>

            {/* Content Based on View */}
            {selectedView === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Spenders */}
                <div className="bg-white rounded-lg shadow-soft-md p-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">👥 Top 5 Spenders</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={generateComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#6b7c9e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-lg shadow-soft-md p-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">📊 Spending by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.category_breakdown || []}
                        dataKey="total_amount"
                        nameKey="category_name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                      >
                        {(analyticsData?.category_breakdown || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {selectedView === 'trends' && (
              <div className="bg-white rounded-lg shadow-soft-md p-6 mb-8">
                <h3 className="text-xl font-bold text-primary-900 mb-4">📈 Spending Trends Over Time</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={generateTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="total" fill="#6b7c9e" stroke="#6b7c9e" name="Total Spent" />
                    <Area type="monotone" dataKey="avg" fill="#4a9070" stroke="#4a9070" name="Average" opacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {selectedView === 'breakdown' && (
              <div className="bg-white rounded-lg shadow-soft-md overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">📋 Detailed Category Breakdown</h3>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="px-6 py-3 text-left text-primary-700 font-semibold">Category</th>
                          <th className="px-6 py-3 text-right text-primary-700 font-semibold">Amount</th>
                          <th className="px-6 py-3 text-right text-primary-700 font-semibold">Count</th>
                          <th className="px-6 py-3 text-right text-primary-700 font-semibold">Average</th>
                          <th className="px-6 py-3 text-right text-primary-700 font-semibold">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData?.category_breakdown?.map((cat: any) => (
                          <tr key={cat.category_name} className="border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-semibold text-primary-900">{cat.category_name}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-bold">${cat.total_amount.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right text-gray-600">{cat.count}</td>
                            <td className="px-6 py-4 text-right text-gray-600">
                              ${(cat.total_amount / cat.count).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600">{cat.percentage.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Department Summary */}
                <div className="bg-white rounded-lg shadow-soft-md p-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">🏢 Department Summary</h3>
                  <div className="space-y-3">
                    {analyticsData?.top_spenders?.slice(0, 5).map((emp: any) => (
                      <div key={emp.employee_id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-primary-900">{emp.employee_name}</p>
                          <p className="text-sm text-slate-600">{emp.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600">${emp.total_spent.toFixed(2)}</p>
                          <p className="text-xs text-slate-600">{emp.expense_count} expenses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-lg shadow-soft-md p-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">📊 Key Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                      <span className="text-primary-700">Total Amount</span>
                      <span className="font-bold text-primary-600">${analyticsData?.total_amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                      <span className="text-gray-700">Average Expense</span>
                      <span className="font-bold text-green-600">${analyticsData?.average_expense?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-gray-700">Total Submissions</span>
                      <span className="font-bold text-purple-600">{analyticsData?.total_expenses}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-gray-700">Active Employees</span>
                      <span className="font-bold text-orange-600">{analyticsData?.active_employees}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                      <span className="text-gray-700">Period</span>
                      <span className="font-bold text-pink-600">{period.charAt(0).toUpperCase() + period.slice(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg shadow-soft-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">📌 Summary & Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-primary-900 text-sm mb-1">HIGHEST SPENDER</p>
                  <p className="text-xl font-bold">{analyticsData?.top_spenders?.[0]?.employee_name}</p>
                  <p className="text-primary-900 text-sm mt-1">${analyticsData?.top_spenders?.[0]?.total_spent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">LARGEST CATEGORY</p>
                  <p className="text-xl font-bold">{analyticsData?.category_breakdown?.[0]?.category_name}</p>
                  <p className="text-blue-100 text-sm mt-1">{analyticsData?.category_breakdown?.[0]?.percentage.toFixed(1)}% of total</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">SPENDING HEALTH</p>
                  <p className="text-xl font-bold">
                    {analyticsData?.average_expense > 250 ? '⚠️ High' : '✓ Normal'}
                  </p>
                  <p className="text-blue-100 text-sm mt-1">
                    {analyticsData?.total_expenses} total submissions
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
