'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
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

function ApprovalsManagerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState<number | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [teamBudget, setTeamBudget] = useState(50000); // Monthly team budget in INR
  const [policyViolations, setPolicyViolations] = useState<Record<number, any>>({});

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
        fetchAnalytics(); // Fetch analytics for Team Pulse
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

  const fetchAnalytics = async () => {
    try {
      const response = await apiCall('/analytics/spending?period=month', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
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

  // Policy limits by grade and category (INR)
  const policyLimits = {
    // Grade-based daily limits
    gradeLimits: {
      1: { daily: 10000, food: 2000, travel: 5000 }, // Grade A
      2: { daily: 7500, food: 1500, travel: 4000 },  // Grade B
      3: { daily: 5000, food: 1000, travel: 3000 },  // Grade C
      4: { daily: 2500, food: 500, travel: 1500 },   // Grade D
    },
    // Category-specific rules
    categoryRules: {
      1: { requiresJustification: 5000, maxSingle: 10000 }, // Travel
      2: { requiresJustification: 1000, maxSingle: 3000 },  // Food
      3: { requiresJustification: 3000, maxSingle: 8000 },  // Accommodation
      4: { requiresJustification: 2000, maxSingle: 5000 },  // Office Supplies
      5: { requiresJustification: 1500, maxSingle: 4000 },  // Communication
      6: { requiresJustification: 1000, maxSingle: 2500 },  // Miscellaneous
      7: { requiresJustification: 5000, maxSingle: 15000 }, // Equipment
      8: { requiresJustification: 800, maxSingle: 2000 },   // Meals
      9: { requiresJustification: 500, maxSingle: 1500 },   // Other
      10: { requiresJustification: 2000, maxSingle: 5000 }, // Fuel
    }
  };

  // Professional message templates
  const professionalMessages = {
    amountExceeds: (amount: number, limit: number, category: string) => 
      `The amount of ₹${amount.toLocaleString('en-IN')} for ${category} exceeds the standard limit of ₹${limit.toLocaleString('en-IN')}. Please provide justification for this expense.`,
    unusualAmount: (amount: number, average: number, category: string) =>
      `The amount of ₹${amount.toLocaleString('en-IN')} for ${category} is significantly higher than the average of ₹${average.toLocaleString('en-IN')}. Kindly provide detailed justification.`,
    requiresJustification: (amount: number, category: string) =>
      `For ${category} expenses exceeding ₹${amount.toLocaleString('en-IN')}, please provide detailed business justification and supporting documentation.`,
    missingDetails: (category: string) =>
      `Please provide additional details for this ${category} expense, including business purpose and vendor information.`,
  };

  // Check policy violations for an expense
  const checkPolicyViolations = (expense: Expense) => {
    try {
      if (!expense || !expense.category_id) {
        return [];
      }

      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount || 0;
      
      if (isNaN(amount) || amount <= 0) {
        return [];
      }

      const violations = [];
      const categoryRules = policyLimits.categoryRules[expense.category_id];

      // Check category-specific limits
      if (categoryRules) {
        if (amount > categoryRules.maxSingle) {
          violations.push({
            type: 'amountExceeds',
            severity: 'high',
            message: professionalMessages.amountExceeds(amount, categoryRules.maxSingle, categoryMap[expense.category_id] || 'Unknown'),
            limit: categoryRules.maxSingle,
            actual: amount
          });
        }

        if (amount > categoryRules.requiresJustification) {
          violations.push({
            type: 'requiresJustification',
            severity: 'medium',
            message: professionalMessages.requiresJustification(categoryRules.requiresJustification, categoryMap[expense.category_id] || 'Unknown'),
            threshold: categoryRules.requiresJustification,
            actual: amount
          });
        }
      }

      // Check for unusual patterns (using analytics data if available)
      if (analyticsData && analyticsData.category_breakdown && Array.isArray(analyticsData.category_breakdown)) {
        const categoryAvg = analyticsData.category_breakdown.find((c: any) => c.category === categoryMap[expense.category_id]);
        if (categoryAvg && categoryAvg.average_amount && amount > categoryAvg.average_amount * 2) {
          violations.push({
            type: 'unusualAmount',
            severity: 'medium',
            message: professionalMessages.unusualAmount(amount, categoryAvg.average_amount, categoryMap[expense.category_id] || 'Unknown'),
            average: categoryAvg.average_amount,
            actual: amount
          });
        }
      }

      return violations;
    } catch (error) {
      console.error('Error checking policy violations for expense:', expense, error);
      return [];
    }
  };

  // Check violations for all expenses when data loads
  useEffect(() => {
    if (expenses.length > 0) {
      try {
        const violations: Record<number, any> = {};
        expenses.forEach(expense => {
          if (expense && expense.id) {
            const expenseViolations = checkPolicyViolations(expense);
            if (expenseViolations && expenseViolations.length > 0) {
              violations[expense.id] = expenseViolations;
            }
          }
        });
        setPolicyViolations(violations);
      } catch (error) {
        console.error('Error checking policy violations:', error);
        setPolicyViolations({});
      }
    }
  }, [expenses, analyticsData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8 relative overflow-hidden">
      {/* BIG RED BANNER TO VERIFY NEW CODE IS LOADING */}
      <div className="bg-red-600 text-white p-4 text-center text-2xl font-bold mb-4">
        🔴 NEW CODE LOADED - If you see this, the features are working! 🔴
      </div>
      
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

            {/* DEBUG INFO - REMOVE LATER */}
            <div className="mb-4 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
              <h3 className="font-bold text-yellow-900">🐛 DEBUG INFO:</h3>
              <p>User Role: {userRole} (2=Manager, 3=Finance)</p>
              <p>Analytics Data: {analyticsData ? '✅ Loaded' : '❌ Not Loaded'}</p>
              <p>Is Authorized: {isAuthorized ? '✅ Yes' : '❌ No'}</p>
              <p>Dashboard Should Show: {userRole === 2 ? '✅ Yes' : '❌ No (Not Manager)'}</p>
            </div>

            {/* Team Pulse Dashboard - TEMPORARILY FOR ALL USERS */}
            {isAuthorized && (
              <div className="mb-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">🚀 Team Pulse Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Budget Utilization */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-soft-md">
                    <div className="text-3xl mb-2">💼</div>
                    <p className="text-blue-700 text-sm font-semibold">Team Budget Used</p>
                    <p className="text-2xl font-bold text-blue-900 mb-2">
                      {Math.round(((analyticsData?.total_amount || 0) / teamBudget) * 100)}%
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((analyticsData?.total_amount || 0) / teamBudget) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      ₹{(analyticsData?.total_amount || 0).toLocaleString('en-IN')} / ₹{teamBudget.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Active Members */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-soft-md">
                    <div className="text-3xl mb-2">👥</div>
                    <p className="text-green-700 text-sm font-semibold">Active Members</p>
                    <p className="text-3xl font-bold text-green-900">{analyticsData?.unique_employees || 0}</p>
                    <p className="text-xs text-green-600 mt-2">This month</p>
                  </div>

                  {/* Pending Items */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-soft-md">
                    <div className="text-3xl mb-2">⏰</div>
                    <p className="text-amber-700 text-sm font-semibold">Pending Items</p>
                    <p className="text-3xl font-bold text-amber-900">{expenses.length}</p>
                    <p className="text-xs text-amber-600 mt-2">Need your action</p>
                  </div>

                  {/* Approval Rate */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-soft-md">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-purple-700 text-sm font-semibold">Approval Rate</p>
                    <p className="text-3xl font-bold text-purple-900">{analyticsData?.approval_rate || 0}%</p>
                    <p className="text-xs text-purple-600 mt-2">This month</p>
                  </div>
                </div>

                {/* Compliance Leaderboard */}
                {analyticsData?.employee_spending && Object.keys(analyticsData.employee_spending).length > 0 && (
                  <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-soft-md">
                    <h3 className="text-lg font-bold text-primary-900 mb-4">🏆 Team Compliance Leaders</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(analyticsData.employee_spending)
                        .sort(([,a]: any, [,b]: any) => (b.approval_rate || 0) - (a.approval_rate || 0))
                        .slice(0, 3)
                        .map(([name, data]: any, index) => (
                          <div key={name} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                            <div className="text-2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-primary-900">{name}</p>
                              <p className="text-sm text-slate-600">
                                {data.approval_rate || 0}% approval rate • {data.total_expenses || 0} expenses
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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

                      {/* Policy Violations - Shown when present */}
                      {policyViolations[expense.id] && (
                        <div className="mb-6 p-4 border-2 rounded-lg">
                          <h4 className="font-bold mb-3 flex items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            <span className="text-amber-900">Policy Review Required</span>
                          </h4>
                          <div className="space-y-2">
                            {policyViolations[expense.id].map((violation: any, index: number) => (
                              <div key={index} className={`p-3 rounded-lg ${
                                violation.severity === 'high' 
                                  ? 'bg-red-50 border border-red-200' 
                                  : 'bg-amber-50 border border-amber-200'
                              }`}>
                                <p className={`text-sm ${
                                  violation.severity === 'high' ? 'text-red-800' : 'text-amber-800'
                                }`}>
                                  {violation.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
                        {policyViolations[expense.id] && (
                          <button
                            onClick={() => {
                              const violation = policyViolations[expense.id][0];
                              const message = violation.message;
                              navigator.clipboard.writeText(message);
                              alert('Professional message copied to clipboard. You can paste this in your email to the employee.');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
                            title="Copy professional message for employee"
                          >
                            📋 Copy Message
                          </button>
                        )}
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

export default function ApprovalsManager() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8 flex items-center justify-center">
        <div className="text-4xl">⏳ Loading...</div>
      </div>
    }>
      <ApprovalsManagerContent />
    </Suspense>
  );
}
