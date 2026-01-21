'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiCall } from '@/utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState('month');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      window.location.href = '/login';
      return;
    }

    const parsedUser = JSON.parse(user);
    setUserData(parsedUser);

    // Check if user has access to analytics
    const role = (parsedUser.role || '').toLowerCase();
    if (role !== 'finance' && role !== 'manager' && role !== 'hr') {
      return;
    }

    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await apiCall(`/analytics/spending?period=${period}`, { method: 'GET' });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.detail || 'Failed to fetch analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Log more details for debugging
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        period: period,
        userRole: userData?.role
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Failed to load analytics data</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const categoryData = {
    labels: analytics.category_breakdown?.map((c: any) => c.category) || [],
    datasets: [
      {
        label: 'Amount (₹)',
        data: analytics.category_breakdown?.map((c: any) => c.total_amount) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(147, 51, 234, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(244, 63, 94, 1)',
          'rgba(147, 51, 234, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          analytics.status_distribution?.approved || 0,
          analytics.status_distribution?.pending || 0,
          analytics.status_distribution?.rejected || 0,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(244, 63, 94, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(244, 63, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyData = {
    labels: analytics.monthly_trend?.map((m: any) => m.month) || [],
    datasets: [
      {
        label: 'Monthly Spending (₹)',
        data: analytics.monthly_trend?.map((m: any) => m.total_amount) || [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const topSpendersData = {
    labels: analytics.top_spenders?.slice(0, 5).map((s: any) => s.employee_name) || [],
    datasets: [
      {
        label: 'Total Spent (₹)',
        data: analytics.top_spenders?.slice(0, 5).map((s: any) => s.total_amount) || [],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            {(userData?.role || '').toLowerCase() === 'finance' 
              ? 'View all employee expenses and organization-wide analytics' 
              : (userData?.role || '').toLowerCase() === 'hr'
              ? 'View organization-wide analytics and reports'
              : 'View team expenses and analytics'}
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-300 p-6 ring-1 ring-black/5 hover:shadow-2xl transition">
            <div className="text-4xl mb-3">💰</div>
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              ₹{(analytics.total_amount || 0).toLocaleString()}
            </p>
            <p className="text-green-600 text-sm font-semibold">
              {analytics.expense_count || 0} expenses
            </p>
          </div>
          
          <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-300 p-6 ring-1 ring-black/5 hover:shadow-2xl transition">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-600 text-sm font-semibold mb-1">Average Expense</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              ₹{analytics.average_amount ? Math.round(analytics.average_amount).toLocaleString() : '0'}
            </p>
            <p className="text-blue-600 text-sm font-semibold">Per expense</p>
          </div>
          
          <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-300 p-6 ring-1 ring-black/5 hover:shadow-2xl transition">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-600 text-sm font-semibold mb-1">Approval Rate</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.approval_rate ? Math.round(analytics.approval_rate) : '0'}%
            </p>
            <p className="text-green-600 text-sm font-semibold">Approved expenses</p>
          </div>
          
          <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-300 p-6 ring-1 ring-black/5 hover:shadow-2xl transition">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-600 text-sm font-semibold mb-1">Active Employees</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.unique_employees || 0}
            </p>
            <p className="text-purple-600 text-sm font-semibold">Submitted expenses</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Breakdown */}
          <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-300 p-6 ring-1 ring-black/5 hover:shadow-2xl transition">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Expenses by Category</h2>
            <div className="h-64">
              <Bar data={categoryData} options={chartOptions} />
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-300 p-6 ring-1 ring-black/5 hover:shadow-2xl transition">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status Distribution</h2>
            <div className="h-64">
              <Pie data={statusData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-300 p-6 ring-1 ring-black/5 hover:shadow-2xl transition mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Spending Trend</h2>
          <div className="h-64">
            <Line data={monthlyData} options={chartOptions} />
          </div>
        </div>

        {/* Top Spenders */}
        <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-300 p-6 ring-1 ring-black/5 hover:shadow-2xl transition">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Spenders</h2>
          <div className="h-64">
            <Bar data={topSpendersData} options={chartOptions} />
          </div>
        </div>

        {/* Employee Details Table (Finance and HR Only) */}
        {((userData?.role || '').toLowerCase() === 'finance' || (userData?.role || '').toLowerCase() === 'hr') && analytics.employee_spending && (
          <div className="bg-white/90 rounded-2xl shadow-xl border border-slate-300 p-6 ring-1 ring-black/5 hover:shadow-2xl transition mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Employee Spending</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Employee</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Total Spent</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Expenses</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Average</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Approval Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.employee_spending.map((emp: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{emp.employee_name}</p>
                          <p className="text-gray-500 text-xs">{emp.employee_id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ₹{emp.total_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">{emp.expense_count}</td>
                      <td className="px-4 py-3 text-right">
                        ₹{Math.round(emp.total_amount / emp.expense_count).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          emp.approval_rate >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : emp.approval_rate >= 60 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(emp.approval_rate)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
