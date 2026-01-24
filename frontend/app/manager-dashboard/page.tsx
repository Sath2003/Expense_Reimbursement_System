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
  attachments?: Array<{
    id: number;
    filename: string;
    file_path: string;
    uploaded_at: string;
  }>;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  role_id?: number;
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [userData, setUserData] = useState<User | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionExpense, setDecisionExpense] = useState<Expense | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [teamBudget] = useState(50000);
  const [policyViolations, setPolicyViolations] = useState<Record<number, any[]>>({});

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
        console.error('User data is invalid:', user);
        router.push('/login');
        return;
      }
      
      setUserData(user);
      setUserRole(user.role_id);
      
      // Only show to Managers (role_id 2) and HR/Finance (role_id 3)
      if (user.role_id === 2 || user.role_id === 3) {
        setIsAuthorized(true);
        fetchExpenses();
        fetchAnalytics();
      } else {
        setError('You are not authorized to access the manager dashboard.');
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

      console.log('Fetching all expenses for approval...');
      
      const response = await apiCall('/expenses', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      console.log('Fetched expenses:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setExpenses(data);
      } else if (data && Array.isArray(data.data)) {
        setExpenses(data.data);
      } else {
        console.error('Unexpected response format:', data);
        setExpenses([]);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
      setExpenses([]);
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
        return;
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const getRoleLabel = (roleId: number) => {
    const roles: { [key: number]: string } = {
      1: 'Employee',
      2: 'Manager',
      3: 'HR/Finance'
    };
    return roles[roleId] || 'Unknown';
  };

  const handleApprove = async (expenseId: number) => {
    try {
      setApprovingId(expenseId);
      const response = await apiCall(`/approvals/manager/${expenseId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'APPROVED',
          comments: 'Approved by Manager'
        })
      });
      
      if (response.ok) {
        alert('Expense approved and sent for finance verification!');
        fetchExpenses();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to approve'}`);
      }
    } catch (err) {
      alert(`Failed to approve: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (expenseId: number, reason: string) => {
    if (!reason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    
    try {
      setRejectingId(expenseId);
      const response = await apiCall(`/approvals/manager/${expenseId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'REJECTED', comments: reason })
      });
      
      if (response.ok) {
        alert('Expense rejected!');
        setShowRejectionModal(false);
        setRejectionReason('');
        fetchExpenses();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to reject'}`);
      }
    } catch (err) {
      alert(`Failed to reject: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRejectingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      submitted: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-yellow-100 text-yellow-800',
      manager_approved_for_verification: 'bg-blue-100 text-blue-800',
      manager_approved: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      manager_rejected: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
      finance_approved: 'bg-green-100 text-green-800',
      finance_rejected: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
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

  const policyLimits = {
    categoryRules: {
      1: { requiresJustification: 5000, maxSingle: 10000 },
      2: { requiresJustification: 1000, maxSingle: 3000 },
      3: { requiresJustification: 3000, maxSingle: 8000 },
      4: { requiresJustification: 2000, maxSingle: 5000 },
      5: { requiresJustification: 1500, maxSingle: 4000 },
      6: { requiresJustification: 1000, maxSingle: 2500 },
      7: { requiresJustification: 5000, maxSingle: 15000 },
      8: { requiresJustification: 800, maxSingle: 2000 },
      9: { requiresJustification: 500, maxSingle: 1500 },
      10: { requiresJustification: 2000, maxSingle: 5000 },
    }
  };

  type DecisionRecommendation = {
    label: 'APPROVE' | 'NEEDS_REVIEW' | 'RECOMMEND_REJECT';
    severity: 'low' | 'medium' | 'high';
    message: string;
  };

  const getDecisionRecommendation = (expense: Expense): DecisionRecommendation => {
    const expenseDate = new Date(expense.expense_date);
    const now = new Date();
    const ageDays = Number.isFinite(expenseDate.getTime())
      ? Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (ageDays !== null && ageDays > 31) {
      return {
        label: 'RECOMMEND_REJECT',
        severity: 'high',
        message: `Expense date is older than 1 month (${ageDays} days). Policy requires submission within 31 days of the bill date.`
      };
    }

    const rawAmount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
    const amount = Number.isFinite(rawAmount) ? rawAmount : 0;
    const categoryName = categoryMap[expense.category_id] || 'this category';
    const rules = policyLimits.categoryRules[expense.category_id];

    if (!amount || amount <= 0) {
      return {
        label: 'NEEDS_REVIEW',
        severity: 'medium',
        message: `Amount is ₹0 or missing for ${categoryName}. Recommend reviewing the receipt/details before approving.`
      };
    }

    if (!rules) {
      return {
        label: 'NEEDS_REVIEW',
        severity: 'medium',
        message: `No policy rules found for ${categoryName}. Recommend reviewing details before approving.`
      };
    }

    if (amount > rules.maxSingle) {
      return {
        label: 'RECOMMEND_REJECT',
        severity: 'high',
        message: `₹${amount.toLocaleString('en-IN')} exceeds the maximum single-claim limit of ₹${rules.maxSingle.toLocaleString('en-IN')} for ${categoryName}. Recommend rejecting or requesting resubmission with proper justification.`
      };
    }

    if (amount > rules.requiresJustification) {
      return {
        label: 'NEEDS_REVIEW',
        severity: 'medium',
        message: `₹${amount.toLocaleString('en-IN')} is above the justification threshold (₹${rules.requiresJustification.toLocaleString('en-IN')}) for ${categoryName}. Recommend requesting justification before approving.`
      };
    }

    return {
      label: 'APPROVE',
      severity: 'low',
      message: `Within standard limits for ${categoryName}. Approval is recommended if the description/receipt looks valid.`
    };
  };

  const openDecisionModal = (expense: Expense, type: 'approve' | 'reject') => {
    if (type === 'approve') {
      setDecisionExpense(expense);
      setShowDecisionModal(true);
      return;
    }
    setDecisionExpense(null);
    setShowDecisionModal(false);
    setSelectedExpenseId(expense.id);
    setShowRejectionModal(true);
  };

  const professionalMessages = {
    amountExceeds: (amount: number, limit: number, category: string) =>
      `The amount of ₹${amount.toLocaleString('en-IN')} for ${category} exceeds the standard limit of ₹${limit.toLocaleString('en-IN')}. Please provide justification for this expense.`,
    unusualAmount: (amount: number, average: number, category: string) =>
      `The amount of ₹${amount.toLocaleString('en-IN')} for ${category} is significantly higher than the average of ₹${average.toLocaleString('en-IN')}. Kindly provide detailed justification.`,
    requiresJustification: (threshold: number, category: string) =>
      `For ${category} expenses exceeding ₹${threshold.toLocaleString('en-IN')}, please provide detailed business justification and supporting documentation.`,
  };

  const checkPolicyViolations = (expense: Expense) => {
    try {
      if (!expense || !expense.category_id) return [];
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount || 0;
      if (Number.isNaN(amount) || amount <= 0) return [];

      const violations: any[] = [];
      const categoryName = categoryMap[expense.category_id] || 'Unknown';
      const rules = policyLimits.categoryRules[expense.category_id];

      if (rules) {
        if (amount > rules.maxSingle) {
          violations.push({
            type: 'amountExceeds',
            severity: 'high',
            message: professionalMessages.amountExceeds(amount, rules.maxSingle, categoryName),
          });
        } else if (amount > rules.requiresJustification) {
          violations.push({
            type: 'requiresJustification',
            severity: 'medium',
            message: professionalMessages.requiresJustification(rules.requiresJustification, categoryName),
          });
        }
      }

      if (analyticsData && Array.isArray(analyticsData.category_breakdown)) {
        const avg = analyticsData.category_breakdown.find((c: any) => c.category === categoryName);
        if (avg && typeof avg.average_amount === 'number' && amount > avg.average_amount * 2) {
          violations.push({
            type: 'unusualAmount',
            severity: 'medium',
            message: professionalMessages.unusualAmount(amount, avg.average_amount, categoryName),
          });
        }
      }

      return violations;
    } catch (e) {
      console.error('Policy check failed:', e);
      return [];
    }
  };

  useEffect(() => {
    try {
      const v: Record<number, any[]> = {};
      for (const exp of expenses) {
        const violations = checkPolicyViolations(exp);
        if (violations.length) {
          v[exp.id] = violations;
        }
      }
      setPolicyViolations(v);
    } catch (e) {
      console.error('Violation aggregation failed:', e);
      setPolicyViolations({});
    }
  }, [expenses, analyticsData]);

  // Map filter status to actual enum values
  const getFilteredExpenses = () => {
    if (filterStatus === 'all') {
      return expenses;
    }
    
    // Map user-friendly filter to actual status values
    const statusMap: { [key: string]: string[] } = {
      pending: ['SUBMITTED', 'PENDING_MANAGER_REVIEW'],
      approved: ['MANAGER_APPROVED', 'MANAGER_APPROVED_FOR_VERIFICATION', 'FINANCE_APPROVED', 'PAID'],
      rejected: ['MANAGER_REJECTED', 'FINANCE_REJECTED']
    };
    
    const targetStatuses = statusMap[filterStatus.toLowerCase()] || [];
    return expenses.filter(e => 
      targetStatuses.some(status => e.status?.toUpperCase().includes(status))
    );
  };

  const filteredExpenses = getFilteredExpenses();

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link href="/login" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-soft">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-2">
                Manager Dashboard
              </h1>
              <p className="text-lg text-slate-600">
                Welcome back, {userData?.first_name}! Review all employee expenses
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition shadow-soft text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-soft-md">
            <div className="text-3xl mb-3">📊</div>
            <p className="text-slate-600 text-sm font-semibold">Total Expenses</p>
            <p className="text-4xl font-bold text-primary-900 mt-1">{expenses.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-soft-md">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-slate-600 text-sm font-semibold">Pending Review</p>
            <p className="text-4xl font-bold text-yellow-600 mt-1">{expenses.filter(e => e.status?.toUpperCase() === 'SUBMITTED').length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-soft-md">
            <div className="text-3xl mb-3">✅</div>
            <p className="text-slate-600 text-sm font-semibold">Approved</p>
            <p className="text-4xl font-bold text-secondary-600 mt-1">{expenses.filter(e => {
              const status = e.status?.toUpperCase();
              return status?.includes('APPROVED') || status?.includes('PAID');
            }).length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-soft-md">
            <div className="text-3xl mb-3">❌</div>
            <p className="text-slate-600 text-sm font-semibold">Rejected</p>
            <p className="text-4xl font-bold text-red-600 mt-1">{expenses.filter(e => e.status?.toUpperCase()?.includes('REJECTED')).length}</p>
          </div>
        </div>

        {userRole === 2 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">Team Pulse Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-soft-md">
                <div className="text-3xl mb-2">💼</div>
                <p className="text-blue-700 text-sm font-semibold">Team Budget Used</p>
                <p className="text-2xl font-bold text-blue-900 mb-2">
                  {Math.round((((analyticsData?.total_amount || 0) as number) / teamBudget) * 100)}%
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((((analyticsData?.total_amount || 0) as number) / teamBudget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ₹{(((analyticsData?.total_amount || 0) as number)).toLocaleString('en-IN')} / ₹{teamBudget.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-soft-md">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-purple-700 text-sm font-semibold">Approval Rate</p>
                <p className="text-3xl font-bold text-purple-900">{analyticsData?.approval_rate || 0}%</p>
                <p className="text-xs text-purple-600 mt-2">This month</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2 rounded-lg font-semibold transition text-sm ${
                filterStatus === status
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-primary-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Expenses Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">Loading expenses...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6 text-sm">
            {error}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-soft-md">
            <p className="text-slate-600 text-lg">No expenses found</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-soft-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="px-6 py-4 font-semibold text-primary-900 text-sm">Employee</th>
                    <th className="px-6 py-4 font-semibold text-primary-900 text-sm">Description</th>
                    <th className="px-6 py-4 font-semibold text-primary-900 text-sm">Amount</th>
                    <th className="px-6 py-4 font-semibold text-primary-900 text-sm">Date</th>
                    <th className="px-6 py-4 font-semibold text-primary-900 text-sm">Status</th>
                    <th className="px-6 py-4 font-semibold text-primary-900 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-slate-900">
                        <div className="font-semibold text-sm">{expense.first_name} {expense.last_name}</div>
                        <div className="text-xs text-slate-500">ID: {expense.user_id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-sm">
                        <div>{expense.description}</div>
                        {policyViolations[expense.id] && (
                          <div className="mt-1 text-xs font-semibold text-amber-700">
                            Policy review required
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-semibold text-sm">₹{parseFloat(String(expense.amount)).toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{new Date(expense.expense_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          expense.status?.toUpperCase().includes('REJECTED') ? 'bg-red-100 text-red-700' :
                          expense.status?.toUpperCase().includes('APPROVED') ? 'bg-secondary-100 text-secondary-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {expense.status}
                        </span>
                        {expense.status?.toUpperCase() === 'SUBMITTED' && (
                          (() => {
                            const rec = getDecisionRecommendation(expense);
                            const badgeColor = rec.severity === 'high'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : rec.severity === 'medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-green-50 text-green-700 border-green-200';
                            const badgeText = rec.label === 'APPROVE'
                              ? 'AI: Approve'
                              : rec.label === 'RECOMMEND_REJECT'
                                ? 'AI: Recommend Reject'
                                : 'AI: Needs Review';
                            return (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {(() => {
                                  const d = new Date(expense.expense_date);
                                  const t = new Date();
                                  const days = Number.isFinite(d.getTime())
                                    ? Math.floor((t.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
                                    : null;
                                  if (days !== null && days > 31) {
                                    return (
                                      <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border bg-red-50 text-red-700 border-red-200" title="Expense date older than 31 days">
                                        Date: Over 1 month
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                                <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${badgeColor}`} title={rec.message}>
                                  {badgeText}
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {expense.status?.toUpperCase() === 'SUBMITTED' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDecisionModal(expense, 'approve')}
                              disabled={approvingId === expense.id || rejectingId === expense.id}
                              className="px-3 py-1.5 bg-secondary-600 hover:bg-secondary-700 disabled:bg-secondary-400 text-white rounded-lg text-xs font-semibold transition"
                            >
                              {approvingId === expense.id ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => {
                                openDecisionModal(expense, 'reject');
                              }}
                              disabled={approvingId === expense.id || rejectingId === expense.id}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-xs font-semibold transition"
                            >
                              {rejectingId === expense.id ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Decision Recommendation Modal (Approve) */}
      {showDecisionModal && decisionExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-soft-lg">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-primary-900">Recommendation</h3>
              <p className="text-slate-600 text-sm mt-1">Review the suggestion before approving</p>
            </div>

            <div className="p-6">
              {(() => {
                const rec = getDecisionRecommendation(decisionExpense);
                const panelColor = rec.severity === 'high'
                  ? 'bg-red-50 border-red-200'
                  : rec.severity === 'medium'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-green-50 border-green-200';
                const title = rec.label === 'APPROVE'
                  ? '✅ Approve Recommended'
                  : rec.label === 'RECOMMEND_REJECT'
                    ? '❌ Recommend Reject'
                    : '⚠️ Needs Review';
                return (
                  <div className={`p-4 border rounded-lg ${panelColor}`}>
                    <p className="font-bold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-700 mt-2">{rec.message}</p>
                  </div>
                );
              })()}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowDecisionModal(false);
                  setDecisionExpense(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = decisionExpense.id;
                  setShowDecisionModal(false);
                  setDecisionExpense(null);
                  await handleApprove(id);
                }}
                className="flex-1 px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-semibold transition text-sm"
              >
                Proceed to Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-soft-lg">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-primary-900">Rejection Reason</h3>
              <p className="text-slate-600 text-sm mt-1">Please provide a reason for rejection</p>
            </div>

            <div className="p-6">
              {(() => {
                const exp = expenses.find(e => e.id === selectedExpenseId);
                if (!exp) return null;
                const rec = getDecisionRecommendation(exp);
                const panelColor = rec.severity === 'high'
                  ? 'bg-red-50 border-red-200'
                  : rec.severity === 'medium'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-green-50 border-green-200';
                return (
                  <div className={`mb-4 p-4 border rounded-lg ${panelColor}`}>
                    <p className="font-bold text-slate-900">Recommendation</p>
                    <p className="text-sm text-slate-700 mt-2">{rec.message}</p>
                  </div>
                );
              })()}
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-3 border border-slate-200 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                rows={4}
              />
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                  setSelectedExpenseId(null);
                  setShowDecisionModal(false);
                  setDecisionExpense(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedExpenseId) {
                    handleReject(selectedExpenseId, rejectionReason);
                  }
                }}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-semibold transition text-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
