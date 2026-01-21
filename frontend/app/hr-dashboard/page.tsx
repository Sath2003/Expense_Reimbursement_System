'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/utils/api';

interface Expense {
  id: number;
  user_id: number;
  first_name?: string;
  last_name?: string;
  category_id: number;
  amount: number | string;
  expense_date: string;
  description: string;
  status: string;
  created_at?: string;
}

export default function HRDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      if (!user || !user.role_id) {
        router.push('/login');
        return;
      }
      
      setUserData(user);
      
      // Only HR/Finance (role_id 3) can access HR dashboard
      if (user.role_id === 3) {
        setIsAuthorized(true);
        fetchExpenses();
      } else {
        // Redirect non-HR users
        if (user.role_id === 2) {
          // Managers go to manager dashboard
          router.push('/manager-dashboard');
        } else {
          // Employees go to home
          router.push('/');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      router.push('/login');
    }
  }, [router]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/expenses', { method: 'GET' });
      
      if (!response.ok) throw new Error('Failed to fetch expenses');
      
      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusGroup = (status: string) => {
    const s = (status || '').toUpperCase();

    const pending = [
      'SUBMITTED',
      'POLICY_EXCEPTION',
      'PENDING_MANAGER_REVIEW',
      'PENDING_FINANCE_REVIEW',
      'MANAGER_APPROVED_FOR_VERIFICATION'
    ];
    const approved = ['FINANCE_APPROVED', 'PAID', 'HR_APPROVED', 'MANAGER_APPROVED'];
    const rejected = ['MANAGER_REJECTED', 'FINANCE_REJECTED', 'HR_REJECTED'];

    if (pending.some(v => s.includes(v))) return 'pending';
    if (approved.some(v => s.includes(v))) return 'approved';
    if (rejected.some(v => s.includes(v))) return 'rejected';
    return 'other';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      other: 'bg-blue-100 text-blue-800'
    };

    const group = getStatusGroup(status);
    return colors[group] || 'bg-gray-100 text-gray-800';
  };

  const parseAmount = (value: unknown) => {
    const n = typeof value === 'number' ? value : parseFloat(String(value ?? 0));
    return Number.isFinite(n) ? n : 0;
  };

  const formatInr = (value: number) => {
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isCompanySpent = (status: string) => {
    const s = (status || '').toUpperCase();
    return s.includes('FINANCE_APPROVED') || s.includes('PAID');
  };

  const filteredExpenses = filterStatus === 'all'
    ? expenses
    : expenses.filter(e => getStatusGroup(e.status) === filterStatus.toLowerCase());

  const stats = {
    total: expenses.length,
    pending: expenses.filter(e => getStatusGroup(e.status) === 'pending').length,
    approved: expenses.filter(e => getStatusGroup(e.status) === 'approved').length,
    rejected: expenses.filter(e => getStatusGroup(e.status) === 'rejected').length,
    totalAmount: expenses.reduce((sum, e) => sum + parseAmount(e.amount), 0),
    companySpentAmount: expenses
      .filter(e => isCompanySpent(e.status))
      .reduce((sum, e) => sum + parseAmount(e.amount), 0)
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-slate-600 mb-6">Only HR/Finance users can access this dashboard</p>
          <Link href="/login" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
                HR Dashboard
              </h1>
              <p className="text-lg md:text-xl text-slate-700">
                Welcome, {userData?.first_name}! Complete HR & Finance Control Center
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition duration-300 shadow-lg hover:shadow-2xl"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          <div className="bg-white border border-blue-200 rounded-xl p-6">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-slate-600 text-sm mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-yellow-200 rounded-xl p-6">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-slate-600 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
          </div>
          <div className="bg-white border border-green-200 rounded-xl p-6">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-slate-600 text-sm mb-1">Approved</p>
            <p className="text-3xl font-bold text-slate-900">{stats.approved}</p>
          </div>
          <div className="bg-white border border-red-200 rounded-xl p-6">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-slate-600 text-sm mb-1">Rejected</p>
            <p className="text-3xl font-bold text-slate-900">{stats.rejected}</p>
          </div>
          <div className="bg-white border border-purple-200 rounded-xl p-6">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-slate-600 text-sm mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-slate-900">₹{formatInr(stats.companySpentAmount)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filterStatus === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Expenses
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filterStatus === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filterStatus === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Expenses Table */}
        {loading ? (
          <div className="text-center text-slate-700 py-12">
            <p className="text-xl">Loading expenses...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-700">
            <p className="text-xl">No expenses found</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-slate-700">
                    <th className="px-6 py-4 font-semibold">Employee</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-slate-900">
                        <div className="font-semibold">{expense.first_name} {expense.last_name}</div>
                        <div className="text-sm text-slate-500">ID: {expense.user_id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-sm">{expense.description}</td>
                      <td className="px-6 py-4 text-slate-900 font-bold">₹{parseFloat(String(expense.amount)).toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{new Date(expense.expense_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/approvals-manager?expenseId=${expense.id}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                        >
                          Review
                        </Link>
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
