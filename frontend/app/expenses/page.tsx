'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/utils/api';

export default function MyExpenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ approved: 0, pending: 0, rejected: 0 });
  const [showRetry, setShowRetry] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Load current user info
    if (user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    
    fetchExpenses();

    // Auto-refresh expenses every 5 seconds to show real-time updates from manager approvals
    const interval = setInterval(fetchExpenses, 5000);
    
    return () => clearInterval(interval);
  }, [router]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      setShowRetry(false);

      console.log('Fetching expenses from API...');
      const response = await apiCall('/expenses', {
        method: 'GET',
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch expenses`);
      }

      const data = await response.json();
      console.log('Fetched expenses:', data);
      
      // Log first expense details for debugging
      if (Array.isArray(data) && data.length > 0) {
        console.log('First expense details:', {
          category_id: data[0].category_id,
          amount: data[0].amount,
          expense_date: data[0].expense_date,
          description: data[0].description,
          status: data[0].status,
        });
      }

      // Handle both array and object with items property
      const expenseList = Array.isArray(data) ? data : data.items || [];
      setExpenses(expenseList);

      console.log('Expenses loaded:', expenseList);
      console.log('Amount check:', expenseList.map((e: any) => ({ id: e.id, amount: e.amount, type: typeof e.amount })));

      // Calculate stats based on actual status values
      const approved = expenseList
        .filter((e: any) => e.status && (e.status.includes('APPROVED') || e.status === 'PAID'))
        .reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);
      const pending = expenseList
        .filter((e: any) => e.status === 'SUBMITTED' || e.status === 'POLICY_EXCEPTION')
        .reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);
      const rejected = expenseList
        .filter((e: any) => e.status && e.status.includes('REJECTED'))
        .reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);

      setStats({ approved, pending, rejected });
    } catch (err) {
      console.error('Error fetching expenses:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unable to load expenses. Please try again later.';
      
      if (errorMsg.includes('No authentication token')) {
        setError('Session expired. Please login again.');
        setTimeout(() => router.push('/login'), 2000);
      } else if (errorMsg.includes('Unable to connect') || errorMsg.includes('Failed to fetch') || errorMsg.includes('CORS')) {
        setError('⚠️ Backend server is not running. Please start the backend server at http://localhost:8000. (Check browser console for details)');
        setShowRetry(true);
      } else {
        setError(errorMsg);
        setShowRetry(true);
      }
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    if (normalizedStatus === 'SUBMITTED') return 'bg-blue-100 text-blue-800';
    if (normalizedStatus === 'MANAGER_APPROVED' || normalizedStatus === 'FINANCE_APPROVED' || normalizedStatus === 'APPROVED') return 'bg-green-100 text-green-800';
    if (normalizedStatus === 'MANAGER_REJECTED' || normalizedStatus === 'FINANCE_REJECTED' || normalizedStatus === 'REJECTED') return 'bg-red-100 text-red-800';
    if (normalizedStatus === 'POLICY_EXCEPTION') return 'bg-yellow-100 text-yellow-800';
    if (normalizedStatus === 'PAID') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleUpdateAmount = async (expenseId: number, newAmount: string) => {
    if (!newAmount || parseFloat(newAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const response = await apiCall(`/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(newAmount) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update amount');
      }

      // Refresh expenses
      fetchExpenses();
      setEditingExpenseId(null);
      setEditingAmount('');
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to update amount'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-50 p-8 relative overflow-hidden">
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

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header with User Info */}
        <div className="flex justify-between items-start mb-8 animate-fade-in gap-8">
          <div className="flex-1">
            <Link href="/" className="text-blue-400 hover:text-cyan-300 font-semibold mb-4 inline-block transition">
              ← Back to Dashboard
            </Link>
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">My Expenses</h1>
            <p className="text-slate-700 text-lg">Track and manage your submitted expenses</p>
          </div>
          
          {/* Current User Display */}
          {currentUser && (
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-soft-md flex-1 max-w-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Logged In As</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {currentUser.first_name && currentUser.last_name 
                      ? `${currentUser.first_name} ${currentUser.last_name}` 
                      : currentUser.email}
                  </p>
                </div>
                <div className="border-l border-blue-300 pl-6">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">👔 Role</p>
                  <p className="text-2xl font-bold text-blue-900 capitalize">{currentUser.designation || 'Employee'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex justify-between items-start gap-4">
              <p className="text-red-800 font-semibold flex-1">{error}</p>
              {showRetry && (
                <button
                  onClick={fetchExpenses}
                  className="ml-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded whitespace-nowrap transition"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-green-400/30 rounded-2xl p-6">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-green-300 text-base font-semibold mb-2">Approved</p>
            <p className="text-5xl font-bold text-green-400">₹{stats.approved.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/5 border border-yellow-400/30 rounded-2xl p-6">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-yellow-300 text-base font-semibold mb-2">Pending</p>
            <p className="text-5xl font-bold text-yellow-400">₹{stats.pending.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/5 border border-red-400/30 rounded-2xl p-6">
            <div className="text-5xl mb-4">❌</div>
            <p className="text-red-300 text-base font-semibold mb-2">Rejected</p>
            <p className="text-5xl font-bold text-red-400">₹{stats.rejected.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-700">
              <div className="flex justify-center mb-4">
                <div className="animate-spin text-4xl">⏳</div>
              </div>
              Loading your expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-700 text-lg mb-4">📭 No expenses submitted yet</p>
              <Link
                href="/submit-expense"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Submit Your First Expense
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {expenses.map((expense, idx) => {
                  // Map category_id to category name (must match backend category_map in expense.py)
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
                  
                  const categoryName = categoryMap[expense.category_id] || 'Unknown';
                  // Check if amount is zero (handle both number and string types)
                  const parsedAmount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : Number(expense.amount || 0);
                  const hasZeroAmount = parsedAmount === 0;
                  
                  console.log(`Expense ${expense.id}: amount=${expense.amount}, parsedAmount=${parsedAmount}, hasZeroAmount=${hasZeroAmount}`);
                  
                  return (
                    <tr key={expense.id || idx} className={`hover:bg-white/5 transition ${hasZeroAmount ? 'bg-yellow-500/20' : ''}`}>
                      <td className="px-6 py-4 text-sm text-slate-700">{expense.expense_date || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{categoryName}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {expense.description || 'N/A'}
                        {hasZeroAmount && <span className="block text-xs text-orange-400 font-semibold mt-1">⚠️ Amount pending</span>}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {editingExpenseId === expense.id ? (
                          <div className="flex gap-2 items-center">
                            <span className="text-blue-300">₹</span>
                            <input
                              type="number"
                              value={editingAmount}
                              onChange={(e) => setEditingAmount(e.target.value)}
                              placeholder="0"
                              min="0"
                              step="1"
                              autoFocus
                              className="w-24 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white"
                            />
                            <button
                              onClick={() => handleUpdateAmount(expense.id, editingAmount)}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingExpenseId(null);
                                setEditingAmount('');
                              }}
                              className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : hasZeroAmount ? (
                          <div className="flex items-center gap-2">
                            <span className="text-orange-600 font-bold">⚠️ ₹0</span>
                            <button
                              onClick={() => {
                                setEditingExpenseId(expense.id);
                                setEditingAmount('');
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold"
                            >
                              Update
                            </button>
                          </div>
                        ) : (
                          <span>₹{typeof expense.amount === 'string' ? parseFloat(expense.amount).toLocaleString('en-IN') : (expense.amount || 0).toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(expense.status || 'SUBMITTED')}`}>
                          {expense.status ? expense.status.charAt(0) + expense.status.slice(1).toLowerCase() : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
