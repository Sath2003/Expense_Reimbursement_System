'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  user_name: string;
  role: string;
  employee_id?: string;
  email?: string;
  pending_approvals?: number;
  submitted_expenses?: number;
  total_spent?: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user_name = localStorage.getItem('user_name');
    const user_role = localStorage.getItem('user_role');
    const employee_id = localStorage.getItem('employee_id');
    const email = localStorage.getItem('email');
    const user = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    // Try to get employee_id and email from the user object if not in localStorage
    let empId = employee_id;
    let userEmail = email;
    
    if (user && (!empId || !userEmail)) {
      try {
        const userData = JSON.parse(user);
        empId = empId || userData.employee_id || userData.id || '';
        userEmail = userEmail || userData.email || '';
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    setStats({
      user_name: user_name || 'User',
      role: user_role || 'Employee',
      employee_id: empId || 'N/A',
      email: userEmail || 'N/A',
      pending_approvals: 0,
      submitted_expenses: 0,
      total_spent: 0,
    });

    fetchDashboardStats();
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const user_role = localStorage.getItem('user_role')?.toLowerCase();

      // Fetch user's expenses
      const expenseResponse = await fetch('http://localhost:8000/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      let submitted_expenses = 0;
      let total_spent = 0;

      if (expenseResponse.ok) {
        const expenses = await expenseResponse.json();
        submitted_expenses = expenses.length;
        total_spent = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      }

      // Fetch pending approvals if manager
      let pending_approvals = 0;
      if (user_role === 'manager') {
        try {
          const approvalsResponse = await fetch(
            'http://localhost:8000/api/approvals/pending-manager',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (approvalsResponse.ok) {
            const approvals = await approvalsResponse.json();
            pending_approvals = approvals.length || 0;
          }
        } catch (err) {
          // Silent fail for approvals fetch
        }
      }

      setStats((prev) =>
        prev
          ? {
              ...prev,
              submitted_expenses,
              total_spent,
              pending_approvals,
            }
          : null
      );
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const role = stats?.role.toLowerCase();
  const isManager = role === 'manager';
  const isHR = role === 'hr';
  const isFinance = role === 'finance';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-soft-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Top Section: Title and Actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary-900 mb-2">Dashboard</h1>
              <p className="text-slate-600 text-lg">Welcome back, {stats?.user_name || 'User'}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <span className="px-6 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-lg font-semibold border border-primary-200">
                {stats?.role ? stats.role.charAt(0).toUpperCase() + stats.role.slice(1) : 'Loading...'}
              </span>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition duration-300 shadow-soft-md"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Employee Info Card */}
          <div className="bg-gradient-to-r from-primary-50 via-secondary-50 to-primary-50 border-2 border-primary-200 rounded-xl p-8 shadow-soft-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Employee Name */}
              <div className="border-r border-primary-200 last:border-r-0">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">👤 Full Name</p>
                <p className="text-xl font-bold text-primary-900 mt-3">{stats?.user_name || 'Not Available'}</p>
              </div>

              {/* Employee ID */}
              <div className="border-r border-primary-200 last:border-r-0">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">🔑 Employee ID</p>
                <p className="text-xl font-bold text-primary-900 mt-3">{stats?.employee_id || 'Not Available'}</p>
              </div>

              {/* Email */}
              <div className="border-r border-primary-200 last:border-r-0">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">✉️ Email</p>
                <p className="text-lg font-bold text-primary-900 mt-3 break-all">{stats?.email || 'Not Available'}</p>
              </div>

              {/* Role */}
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">👔 Role</p>
                <p className="text-xl font-bold text-primary-900 mt-3 capitalize">{stats?.role || 'Not Available'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Stats */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg transition p-8 border-l-4 border-primary-600">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-slate-600 text-sm font-bold mb-3 uppercase tracking-wide">📋 Expenses Submitted</p>
                  <p className="text-5xl font-bold text-primary-900">{stats.submitted_expenses}</p>
                  <p className="text-slate-500 text-sm mt-3">Total: ${stats.total_spent?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {isManager && (
              <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg transition p-8 border-l-4 border-secondary-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-600 text-sm font-bold mb-3 uppercase tracking-wide">⏳ Pending Approvals</p>
                    <p className="text-5xl font-bold text-secondary-900">{stats.pending_approvals}</p>
                    <p className="text-slate-500 text-sm mt-3">Waiting for your review</p>
                  </div>
                </div>
              </div>
            )}

            {(isManager || isHR || isFinance) && (
              <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg transition p-8 border-l-4 border-accent-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-600 text-sm font-bold mb-3 uppercase tracking-wide">💼 Team Analytics</p>
                    <p className="text-5xl font-bold text-accent-900">📊</p>
                    <p className="text-slate-500 text-sm mt-3">View insights & trends</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Cards */}
        <h2 className="text-2xl font-bold text-primary-900 mb-8">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Submit Expense Card */}
          <Link href="/submit-expense">
            <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition duration-300 p-8 h-full border-t-4 border-primary-600">
              <div className="text-5xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-primary-900 mb-3">Submit Expense</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Create a new expense report with photos, documents, and detailed information
              </p>
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold hover:shadow-soft-md transition duration-300">
                Start Now →
              </span>
            </div>
          </Link>

          {/* View Expenses Card */}
          <Link href="/expenses">
            <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition duration-300 p-8 h-full border-t-4 border-secondary-600">
              <div className="text-5xl mb-6">💰</div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-3">My Expenses</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                View all your submitted expenses, their status, and approval details
              </p>
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-lg font-bold hover:shadow-soft-md transition duration-300">
                View All →
              </span>
            </div>
          </Link>

          {/* Spending Tracker Card */}
          {(isManager || isHR || isFinance) && (
            <Link href="/spending-tracker">
              <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition duration-300 p-8 h-full border-t-4 border-accent-600">
                <div className="text-5xl mb-6">💳</div>
                <h3 className="text-2xl font-bold text-accent-900 mb-3">Spending Tracker</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Track individual employee spending patterns and trends in detail
                </p>
                <span className="inline-block px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-lg font-bold hover:shadow-soft-md transition duration-300">
                  Track →
                </span>
              </div>
            </Link>
          )}

          {/* Reports Card */}
          {(isManager || isHR || isFinance) && (
            <Link href="/reports">
              <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition duration-300 p-8 h-full border-t-4 border-purple-600">
                <div className="text-5xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-purple-900 mb-3">Reports</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Generate detailed reports with trends, breakdowns, and insights
                </p>
                <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold hover:shadow-soft-md transition duration-300">
                  View →
                </span>
              </div>
            </Link>
          )}

          {/* Analytics Card */}
          {(isManager || isHR || isFinance) && (
            <Link href="/analytics">
              <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition duration-300 p-8 h-full border-t-4 border-indigo-600">
                <div className="text-5xl mb-6">📈</div>
                <h3 className="text-2xl font-bold text-indigo-900 mb-3">Analytics</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Analyze spending patterns, top expenses, and employee insights
                </p>
                <span className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-bold hover:shadow-soft-md transition duration-300">
                  Explore →
                </span>
              </div>
            </Link>
          )}

          {/* Manager Approvals Card */}
          {isManager && (
            <Link href="/approvals-manager">
              <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition duration-300 p-8 h-full border-t-4 border-green-600">
                <div className="text-5xl mb-6">✅</div>
                <h3 className="text-2xl font-bold text-green-900 mb-3">Manager Approvals</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Review and approve expenses submitted by your team members
                </p>
                <span className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:shadow-soft-md transition duration-300">
                  Review {stats?.pending_approvals ? `(${stats.pending_approvals})` : ''} →
                </span>
              </div>
            </Link>
          )}

          {/* Finance Approvals Card */}
          {isFinance && (
            <Link href="/approvals-finance">
              <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition duration-300 p-8 h-full border-t-4 border-orange-600">
                <div className="text-5xl mb-6">💵</div>
                <h3 className="text-2xl font-bold text-orange-900 mb-3">Finance Approvals</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Process final approvals for reimbursement payments
                </p>
                <span className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-bold hover:shadow-soft-md transition duration-300">
                  Review →
                </span>
              </div>
            </Link>
          )}

          {/* Settings Card */}
          <Link href="/settings">
            <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition duration-300 p-8 h-full border-t-4 border-slate-400">
              <div className="text-5xl mb-6">⚙️</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Settings</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Manage your profile, preferences, and account settings
              </p>
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-bold hover:shadow-soft-md transition duration-300">
                Configure →
              </span>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-soft-md p-10 mb-12 border-t-4 border-primary-600">
          <h2 className="text-3xl font-bold text-primary-900 mb-10 flex items-center gap-3">
            <span>✨</span> Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex gap-4 p-6 bg-gradient-to-br from-blue-50 to-transparent rounded-lg hover:shadow-soft-md transition">
              <span className="text-4xl flex-shrink-0">📸</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Camera Upload</h3>
                <p className="text-slate-600 text-sm">
                  Capture receipt photos directly with your device camera
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-br from-purple-50 to-transparent rounded-lg hover:shadow-soft-md transition">
              <span className="text-4xl flex-shrink-0">📄</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Multiple Formats</h3>
                <p className="text-slate-600 text-sm">
                  Support for PDF, Word, Excel, Images and more
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-br from-green-50 to-transparent rounded-lg hover:shadow-soft-md transition">
              <span className="text-4xl flex-shrink-0">👥</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Team Analytics</h3>
                <p className="text-slate-600 text-sm">
                  View team spending patterns and top expenses
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-br from-red-50 to-transparent rounded-lg hover:shadow-soft-md transition">
              <span className="text-4xl flex-shrink-0">🔐</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Secure & Verified</h3>
                <p className="text-slate-600 text-sm">
                  Files are verified with SHA-256 integrity checks
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-br from-yellow-50 to-transparent rounded-lg hover:shadow-soft-md transition">
              <span className="text-4xl flex-shrink-0">⚡</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Fast Processing</h3>
                <p className="text-slate-600 text-sm">
                  Automatic workflow and quick approval process
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-br from-indigo-50 to-transparent rounded-lg hover:shadow-soft-md transition">
              <span className="text-4xl flex-shrink-0">📊</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Detailed Reports</h3>
                <p className="text-slate-600 text-sm">
                  Export and analyze spending data by category and period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-primary-50 via-secondary-50 to-primary-50 border-l-4 border-primary-600 rounded-xl p-8 shadow-soft-md">
          <h3 className="text-2xl font-bold text-primary-900 mb-3 flex items-center gap-2">
            <span>💡</span> Need Help?
          </h3>
          <p className="text-primary-800 mb-6 text-lg">
            Check out our comprehensive documentation or contact your administrator for support.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold transition shadow-soft-md hover:shadow-soft-lg">
              📖 View Docs
            </button>
            <button className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 font-bold transition">
              💬 Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
