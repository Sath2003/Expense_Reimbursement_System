'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/utils/api';

interface Expense {
  id: number;
  category_id: number;
  amount: number | string;
  expense_date: string;
  description: string;
  status: string;
  created_at: string;
}

export default function Reports() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  const categoryMap: Record<number, string> = {
    1: 'Travel',
    2: 'Food',
    3: 'Accommodation',
    4: 'Office Supplies',
    5: 'Communication',
    6: 'Miscellaneous',
    7: 'Equipment',
    8: 'Meals',
    9: 'Other',
    10: 'Fuel',
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchExpenses();
  }, [router]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiCall('/expenses', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      const expenseList = Array.isArray(data) ? data : data.items || [];
      setExpenses(expenseList);

      // Calculate stats
      const approved = expenseList.filter((e: any) => e.status && (e.status.includes('APPROVED') || e.status === 'PAID')).length;
      const pending = expenseList.filter((e: any) => e.status === 'SUBMITTED' || e.status === 'POLICY_EXCEPTION').length;
      const rejected = expenseList.filter((e: any) => e.status && e.status.includes('REJECTED')).length;

      setStats({ total: expenseList.length, approved, pending, rejected });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (expenses.length === 0) {
      alert('No expenses to download');
      return;
    }

    // Prepare CSV data with new format: Expense Name, Amount, Remarks
    const headers = ['Expense Name', 'Amount (₹)', 'Remarks'];
    const rows = expenses.map(expense => {
      // Create expense name from description and category
      const expenseName = expense.description || categoryMap[expense.category_id] || 'Unnamed Expense';
      
      // Remarks shows the status in a readable format
      let remarks = '';
      if (expense.status === 'SUBMITTED' || expense.status === 'POLICY_EXCEPTION') {
        remarks = 'Pending Review';
      } else if (expense.status?.includes('APPROVED') || expense.status === 'PAID') {
        remarks = '✓ Approved';
      } else if (expense.status?.includes('REJECTED')) {
        remarks = '✗ Rejected';
      } else {
        remarks = expense.status || 'Unknown';
      }
      
      return [
        expenseName,
        parseFloat(String(expense.amount)).toFixed(2),
        remarks,
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Calculate totals
    const totalAmount = expenses.reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount)) || 0), 0);
    const approvedCount = expenses.filter(e => e.status && (e.status.includes('APPROVED') || e.status === 'PAID')).length;
    const rejectedCount = expenses.filter(e => e.status && e.status.includes('REJECTED')).length;
    const pendingCount = expenses.filter(e => e.status === 'SUBMITTED' || e.status === 'POLICY_EXCEPTION').length;

    const summary = `\n\nSUMMARY\nTotal Amount,₹${totalAmount.toFixed(2)}\nApproved Count,${approvedCount}\nRejected Count,${rejectedCount}\nPending Count,${pendingCount}\nTotal Expenses,${expenses.length}`;

    // Download
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent + summary)}`);
    element.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8 relative overflow-hidden">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="text-blue-400 hover:text-cyan-300 font-semibold mb-4 inline-block transition">
            ← Back to Dashboard
          </Link>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">My Expenses Report</h1>
          <p className="text-slate-700 text-lg">Download and view all your submitted expenses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-blue-400/30 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-blue-300 text-sm">Total Expenses</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white/5 border border-green-400/30 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-green-300 text-sm">Approved</p>
            <p className="text-4xl font-bold text-green-400">{stats.approved}</p>
          </div>
          <div className="bg-white/5 border border-yellow-400/30 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-yellow-300 text-sm">Pending</p>
            <p className="text-4xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-white/5 border border-red-400/30 rounded-2xl p-6 text-white">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-red-300 text-sm">Rejected</p>
            <p className="text-4xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-2 border-blue-400/30 rounded-2xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary-900 mb-2">📥 Download Your Expenses</h2>
              <p className="text-slate-700">Export all your expenses as CSV file for analysis and record-keeping</p>
            </div>
            <button
              onClick={downloadCSV}
              disabled={expenses.length === 0 || loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold rounded-lg transition"
            >
              📥 Download CSV
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        {loading ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
            <p className="text-slate-700">Loading expenses...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6">
            <p className="text-red-200">{error}</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
            <p className="text-slate-700 text-lg">No expenses submitted yet</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft-md">
            <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-primary-50 to-slate-50">
              <h2 className="text-2xl font-bold text-primary-900">All Submitted Expenses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10 border-b border-white/20">
                  <tr className="text-left">
                    <th className="px-8 py-4 font-semibold text-white">Date</th>
                    <th className="px-8 py-4 font-semibold text-white">Category</th>
                    <th className="px-8 py-4 font-semibold text-white">Description</th>
                    <th className="px-8 py-4 font-semibold text-white">Amount</th>
                    <th className="px-8 py-4 font-semibold text-white">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-white/5 transition">
                      <td className="px-8 py-4 text-blue-100">{expense.expense_date}</td>
                      <td className="px-8 py-4 text-blue-100">{categoryMap[expense.category_id] || 'Unknown'}</td>
                      <td className="px-8 py-4 text-blue-100">{expense.description || 'N/A'}</td>
                      <td className="px-8 py-4 font-semibold text-white">₹{parseFloat(String(expense.amount)).toFixed(2)}</td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          expense.status === 'SUBMITTED' || expense.status === 'POLICY_EXCEPTION'
                            ? 'bg-yellow-100 text-yellow-800'
                            : expense.status?.includes('APPROVED') || expense.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : expense.status?.includes('REJECTED')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {expense.status}
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
