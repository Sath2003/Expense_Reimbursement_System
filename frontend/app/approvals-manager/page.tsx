'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiCall } from '@/utils/api';

interface Expense {
  id: number;
  user_id?: number;
  category_id: number;
  amount: number | string;
  expense_date: string;
  description: string;
  status: string;
  created_at?: string;
  rejection_remarks?: string;  // AI analysis and rejection remarks
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  role_id?: number;
}

export default function ApprovalsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // Check if user exists and has role_id
      if (!user || !user.role_id) {
        console.error('User data is invalid:', user);
        router.push('/login');
        return;
      }
      
      setUserRole(user.role_id);

      const expenseIdParam = searchParams.get('expenseId');
      if (expenseIdParam) {
        const parsed = Number(expenseIdParam);
        if (!Number.isNaN(parsed)) {
          setExpandedExpenseId(parsed);
        }
      }
      
      // Only show to Managers (role_id 2) and Finance (role_id 3)
      if (user.role_id === 2 || user.role_id === 3) {
        setIsAuthorized(true);
        fetchExpenses();
      } else {
        setError('You are not authorized to view expense approvals. Only Managers and Finance can access this.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error parsing user:', err);
      router.push('/login');
    }
  }, [router]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching expenses for approval...');
      
      // Fetch pending Manager approvals
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user data found');
        return;
      }
      
      const user = JSON.parse(userStr);
      if (!user || !user.role_id) {
        console.error('Invalid user data:', user);
        return;
      }

      const endpoint = user.role_id === 3 ? '/approvals/finance/pending' : '/approvals/pending-manager';
      
      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      console.log('Fetched expenses:', data);

      const expenseList = Array.isArray(data) ? data : data.items || data.data || [];
      setExpenses(expenseList);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses for approval');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expenseId: number) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user data found for approval');
        return;
      }
      
      const user = JSON.parse(userStr);
      if (!user || !user.role_id) {
        console.error('Invalid user data for approval:', user);
        return;
      }

      const endpoint = user.role_id === 3
        ? `/approvals/finance/${expenseId}/approve`
        : `/approvals/manager/${expenseId}/approve`;
      
      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          decision: 'APPROVED',
          comments: user.role_id === 3 ? 'Approved by finance' : 'Approved by manager'
        })
      });
      
      if (response.ok) {
        alert(user.role_id === 3
          ? '✅ Expense approved successfully!'
          : '✅ Expense approved for verification! Sent to Finance department.'
        );
        await fetchExpenses();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' 
          ? error.detail 
          : error.message || 'Unknown error';
        alert(`Failed to approve: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error approving expense:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to approve expense: ${errorMsg}`);
    }
  };

  const handleReject = async (expenseId: number) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user data found for rejection');
        return;
      }
      
      const user = JSON.parse(userStr);
      if (!user || !user.role_id) {
        console.error('Invalid user data for rejection:', user);
        return;
      }

      const endpoint = user.role_id === 3
        ? `/approvals/finance/${expenseId}/reject`
        : `/approvals/manager/${expenseId}/reject`;
      
      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          decision: 'REJECTED',
          comments: user.role_id === 3 ? 'Rejected by finance' : 'Rejected by manager'
        })
      });
      
      if (response.ok) {
        alert('Expense rejected successfully!');
        await fetchExpenses();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' 
          ? error.detail 
          : error.message || 'Unknown error';
        alert(`Failed to reject: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error rejecting expense:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to reject expense: ${errorMsg}`);
    }
  };

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

  // Sort categories alphabetically for display
  const sortedCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => a.localeCompare(b))
    .reduce((acc, [id, name]) => ({ ...acc, [parseInt(id)]: name }), {} as Record<number, string>);

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
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="text-primary-600 hover:text-primary-800 font-semibold mb-4 inline-block transition">
            ← Back to Dashboard
          </Link>
          <h1 className="text-5xl font-black text-primary-900 mb-2">Approvals Manager</h1>
          <p className="text-slate-600 text-lg">Review and approve expense requests with AI analysis</p>
        </div>

        {/* Authorization Check */}
        {!isAuthorized && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-900 font-semibold text-lg mb-2">⚠️ Access Denied</p>
            <p className="text-red-700">{error}</p>
            <Link href="/" className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition">
              Back to Dashboard
            </Link>
          </div>
        )}

        {isAuthorized && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-soft-md">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-secondary-700 text-sm">Pending Review</p>
                <p className="text-4xl font-bold text-secondary-600">{expenses.length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft-md">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-slate-600 text-sm">Total Pending Amount</p>
                <p className="text-3xl font-bold text-primary-700">
                  ₹{expenses
                    .reduce((sum, e) => sum + (typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount || 0), 0)
                    .toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft-md">
                <div className="text-3xl mb-2">👤</div>
                <p className="text-slate-600 text-sm">Your Role</p>
                <p className="text-3xl font-bold text-primary-600">
                  {userRole === 2 ? 'Manager' : 'Finance'}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Loading expenses...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                <p className="text-red-900 font-semibold">{error}</p>
              </div>
            )}

            {/* Approval Cards */}
            {!loading && expenses.length === 0 && (
              <div className="bg-green-500/20 border-2 border-green-400/30 rounded-2xl p-8 text-center">
                <p className="text-green-300 font-semibold text-lg">✓ All expenses have been reviewed!</p>
              </div>
            )}

            {!loading && expenses.length > 0 && (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft-md">
                    {/* Card Header */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-primary-900">Expense #{expense.id}</h3>
                        <p className="text-sm text-slate-500">{expense.expense_date}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 py-4 border-y border-slate-200">
                        <div>
                          <p className="text-slate-600 text-sm">Category</p>
                          <p className="font-semibold text-primary-900">{sortedCategories[expense.category_id] || categoryMap[expense.category_id] || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 text-sm">Amount</p>
                          <p className="font-bold text-2xl text-secondary-600">
                            ₹{typeof expense.amount === 'string' ? parseFloat(expense.amount).toLocaleString('en-IN') : (expense.amount || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 text-sm">Description</p>
                          <p className="font-semibold text-primary-900">{expense.description}</p>
                        </div>
                      </div>

                      {/* Rejection Remarks - Shown when expanded */}
                      {expandedExpenseId === expense.id && expense.rejection_remarks && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="text-red-900 font-bold mb-2">🔍 AI Analysis & Rejection Reasons:</h4>
                          <p className="text-red-700 text-sm whitespace-pre-wrap">{expense.rejection_remarks}</p>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button
                          onClick={() => handleApprove(expense.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                          ✓ Approve for Verification
                        </button>
                        <button
                          onClick={() => handleReject(expense.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
