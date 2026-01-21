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
  validation_score?: number;  // AI genuineness percentage (0-100)
  bill_image_url?: string;    // URL to bill/receipt image
  bill_filename?: string;     // Original bill filename
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

export default function FinanceDashboard() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup blob URL when component unmounts
      if (receiptBlobUrl) {
        URL.revokeObjectURL(receiptBlobUrl);
      }
    };
  }, [receiptBlobUrl]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [llmAnalysis, setLlmAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [approveRejectComment, setApproveRejectComment] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

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
      
      // Only show to Finance/HR (role_id 3)
      if (user.role_id === 3) {
        setIsAuthorized(true);
        fetchPendingExpenses();
      } else {
        setError('You are not authorized to access the Finance dashboard.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error parsing user:', err);
      router.push('/login');
    }
  }, [router]);

  const fetchPendingExpenses = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiCall('/approvals/finance/pending', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = async (expenseId: number, attachmentId: number) => {
    try {
      const response = await apiCall(`/expenses/receipts/${attachmentId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch receipt' }));
        throw new Error(errorData.detail || `Failed to fetch receipt: ${response.status}`);
      }
      
      const receipt = await response.json();
      console.log('Receipt data:', receipt);
      
      // The backend returns file_path as "/api/expenses/file/{path}"
      // But apiCall already prepends /api, so we need to remove the leading /api
      const filePath = receipt.file_path.startsWith('/api/') 
        ? receipt.file_path.substring(4)  // Remove "/api" prefix
        : receipt.file_path;
      
      const fileResponse = await apiCall(filePath, {
        method: 'GET',
      });
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file: ${fileResponse.status}`);
      }
      
      // Convert response to blob
      const blob = await fileResponse.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      setSelectedExpenseId(expenseId);
      setSelectedReceipt({ ...receipt, file_path: blobUrl });
      setReceiptBlobUrl(blobUrl);
      setShowReceiptViewer(true);
    } catch (err) {
      console.error('Error fetching receipt:', err);
      alert(`Failed to load receipt: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!selectedExpenseId) return;
    
    const expense = expenses.find(e => e.id === selectedExpenseId);
    if (!expense) return;

    setAnalyzing(true);
    try {
      // Call the backend AI analysis endpoint
      const response = await apiCall(`/approvals/finance/${selectedExpenseId}/analyze-with-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to analyze bill with AI');
      }

      const result = await response.json();
      const analysis = result.analysis;

      // Format the analysis report
      let reportText = `📋 AI BILL GENUINENESS ANALYSIS REPORT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANALYSIS STATUS
${analysis.analysis_available ? '✅ AI Analysis Performed' : '⚠️ AI Analysis Unavailable'}
Model: ${analysis.model_used || 'Llama'}
Genuineness Score: ${analysis.genuineness_score ? analysis.genuineness_score.toFixed(1) + '%' : 'N/A'}

RISK ASSESSMENT
🎯 Risk Level: ${analysis.risk_level ? analysis.risk_level.toUpperCase() : 'UNKNOWN'}
Suspicious Indicators: ${analysis.is_suspicious ? 'YES - Manual Review Recommended' : 'NO - Appears Genuine'}

FLAWS DETECTED (${analysis.flaws_detected?.length || 0})
${analysis.flaws_detected && analysis.flaws_detected.length > 0 
  ? analysis.flaws_detected.map((flaw: string, idx: number) => `${idx + 1}. ${flaw}`).join('\n')
  : '✅ No flaws detected'}

REJECTION REASONS (${analysis.rejection_reasons?.length || 0})
${analysis.rejection_reasons && analysis.rejection_reasons.length > 0 
  ? analysis.rejection_reasons.map((reason: string, idx: number) => `⚠️ ${idx + 1}. ${reason}`).join('\n')
  : '✅ No rejection reasons found'}

EXPENSE DETAILS
💰 Amount: ₹${expense.amount}
📝 Description: ${expense.description}
📅 Date: ${new Date(expense.expense_date).toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMMENDATION
${!analysis.analysis_available ? '⏳ AI ANALYSIS NOT AVAILABLE - MANUAL REVIEW REQUIRED' :
  analysis.genuineness_score && analysis.genuineness_score >= 80 ? '✅ SAFE TO APPROVE' : 
  analysis.genuineness_score && analysis.genuineness_score >= 50 ? '⚠️ NEEDS REVIEW' : 
  '❌ RECOMMEND REJECTION'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `;

      setLlmAnalysis(reportText);
      setShowAnalysisModal(true);
      setActionType(null);
    } catch (err) {
      console.error('Error analyzing receipt:', err);
      alert('Failed to analyze bill with AI. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedExpenseId) return;
    
    setActionInProgress(true);
    try {
      const response = await apiCall(`/approvals/finance/${selectedExpenseId}/verify-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: approveRejectComment || llmAnalysis
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve expense');
      }

      alert('✅ Expense approved successfully! Employee has been notified.');
      setShowAnalysisModal(false);
      setShowReceiptViewer(false);
      setApproveRejectComment('');
      setLlmAnalysis('');
      setActionType(null);
      fetchPendingExpenses();
    } catch (err) {
      console.error('Error approving expense:', err);
      alert(err instanceof Error ? err.message : 'Failed to approve expense');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    if (!selectedExpenseId || !approveRejectComment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setActionInProgress(true);
    try {
      const response = await apiCall(`/approvals/finance/${selectedExpenseId}/verify-reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: approveRejectComment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject expense');
      }

      alert('❌ Expense rejected. Employee has been notified with detailed reason.');
      setShowAnalysisModal(false);
      setShowReceiptViewer(false);
      setApproveRejectComment('');
      setLlmAnalysis('');
      setActionType(null);
      fetchPendingExpenses();
    } catch (err) {
      console.error('Error rejecting expense:', err);
      alert(err instanceof Error ? err.message : 'Failed to reject expense');
    } finally {
      setActionInProgress(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-2">
                Finance Dashboard
              </h1>
              <p className="text-lg text-slate-600">
                Review and validate approved expenses with AI-powered verification
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/analytics"
                className="px-6 py-2.5 bg-white hover:bg-slate-50 text-primary-900 font-semibold rounded-lg transition shadow-soft text-sm border border-slate-300"
              >
                Analytics
              </Link>
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/90 border border-slate-300 rounded-2xl p-6 shadow-xl ring-1 ring-black/5 hover:shadow-2xl transition">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-slate-600 text-sm font-semibold">Pending Verification</p>
            <p className="text-4xl font-bold text-primary-900 mt-1">{expenses.length}</p>
          </div>
          <div className="bg-white/90 border border-slate-300 rounded-2xl p-6 shadow-xl ring-1 ring-black/5 hover:shadow-2xl transition">
            <div className="text-3xl mb-3">💰</div>
            <p className="text-slate-600 text-sm font-semibold">Total Amount</p>
            <p className="text-4xl font-bold text-accent-600 mt-1">₹{expenses.reduce((sum, e) => sum + parseFloat(String(e.amount || 0)), 0).toFixed(0)}</p>
          </div>
          <div className="bg-white/90 border border-slate-300 rounded-2xl p-6 shadow-xl ring-1 ring-black/5 hover:shadow-2xl transition">
            <div className="text-3xl mb-3">🤖</div>
            <p className="text-slate-600 text-sm font-semibold">AI Ready</p>
            <p className="text-4xl font-bold text-secondary-600 mt-1">{expenses.length}</p>
          </div>
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
        ) : expenses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-soft-md">
            <p className="text-slate-600 text-lg">✅ No pending expenses. All verified!</p>
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
                    <th className="px-6 py-4 font-semibold text-primary-900 text-sm">Genuineness</th>
                    <th className="px-6 py-4 font-semibold text-primary-900 text-sm">Date</th>
                    <th className="px-6 py-4 font-semibold text-primary-900 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expenses.map((expense) => {
                    const genuinessScore = expense.validation_score || 0;
                    const genuinessColor = 
                      genuinessScore >= 80 ? 'bg-secondary-100 text-secondary-700' :
                      genuinessScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700';
                    
                    return (
                      <tr key={expense.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-slate-900">
                          <div className="font-semibold text-sm">{expense.first_name} {expense.last_name}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-sm">{expense.description?.substring(0, 30)}...</td>
                        <td className="px-6 py-4 text-slate-900 font-semibold text-sm">₹{parseFloat(String(expense.amount)).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${genuinessColor}`}>
                            {genuinessScore.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{new Date(expense.expense_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              if (expense.attachments && expense.attachments.length > 0) {
                                handleViewReceipt(expense.id, expense.attachments[0].id);
                              } else {
                                alert('No receipts available for this expense');
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Viewer Modal */}
      {showReceiptViewer && selectedReceipt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 via-blue-800 to-slate-800 rounded-2xl max-w-4xl w-full max-h-screen overflow-auto border border-blue-400/50">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-blue-400/30 bg-slate-900/90 backdrop-blur">
              <div>
                <h2 className="text-2xl font-bold text-white">Receipt Review</h2>
                <p className="text-blue-300 text-sm mt-1">{selectedReceipt.filename}</p>
              </div>
              <button
                onClick={() => setShowReceiptViewer(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-white/5 border border-white/20 rounded-lg p-4">
                <p className="text-blue-300 text-sm">Uploaded on: {new Date(selectedReceipt.uploaded_at).toLocaleString()}</p>
              </div>

              <div className="bg-black rounded-lg overflow-hidden mb-6">
                {selectedReceipt.file_path ? (
                  selectedReceipt.filename.toLowerCase().endsWith('.pdf') ? (
                    <div className="w-full bg-gray-900 p-4">
                      <iframe
                        key={selectedReceipt.file_path}
                        src={selectedReceipt.file_path}
                        className="w-full border-none bg-white"
                        style={{ height: '500px' }}
                        title={selectedReceipt.filename}
                        onError={(e) => {
                          console.error('Failed to load PDF:', selectedReceipt.file_path);
                          const iframe = e.target as HTMLIFrameElement;
                          iframe.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;">Failed to load PDF. <a href="${selectedReceipt.file_path}" target="_blank">Click here to download</a></div>`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center bg-gray-900 p-4">
                      <img
                        key={selectedReceipt.file_path}
                        src={selectedReceipt.file_path}
                        alt={selectedReceipt.filename}
                        className="max-w-full max-h-96 object-contain"
                        onError={(e) => {
                          console.error('Failed to load image:', selectedReceipt.file_path);
                          (e.target as HTMLImageElement).style.display = 'none';
                          const container = (e.target as HTMLImageElement).parentElement;
                          if (container) {
                            container.innerHTML = `<div style="color: #999; text-align: center;"><p>Failed to load image</p><p style="font-size: 12px;">Path: ${selectedReceipt.file_path}</p><a href="${selectedReceipt.file_path}" target="_blank" style="color: #0066cc;">Click to download</a></div>`;
                          }
                        }}
                      />
                    </div>
                  )
                ) : (
                  <div className="w-full h-96 flex items-center justify-center flex-col gap-2">
                    <p className="text-gray-400">No receipt image available</p>
                    <p className="text-gray-600 text-sm">File path: {JSON.stringify(selectedReceipt)}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleAnalyzeWithAI}
                disabled={analyzing}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition mb-4 flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    🤖 Analyze Receipt with AI
                  </>
                )}
              </button>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setActionType('approve');
                    setShowAnalysisModal(true);
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => {
                    setActionType('reject');
                    setShowAnalysisModal(true);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis & Decision Modal */}
      {showAnalysisModal && selectedExpenseId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 via-blue-800 to-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto border border-blue-400/50">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-blue-400/30 bg-slate-900/90 backdrop-blur">
              <h2 className="text-2xl font-bold text-white">
                {llmAnalysis && !actionType ? '🤖 AI Receipt Analysis Report' : (actionType === 'approve' ? '✅ Approve Expense' : '❌ Reject Expense')}
              </h2>
              <button
                onClick={() => {
                  setShowAnalysisModal(false);
                  setApproveRejectComment('');
                  setLlmAnalysis('');
                  setActionType(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              {llmAnalysis && !actionType && (
                <>
                  <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-400/50 rounded-lg p-5">
                    <pre className="text-white text-sm whitespace-pre-wrap font-mono bg-black/30 p-4 rounded border border-white/10 max-h-96 overflow-y-auto">
                      {llmAnalysis}
                    </pre>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActionType('approve')}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      ✅ Approve Based on Analysis
                    </button>
                    <button
                      onClick={() => setActionType('reject')}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      ❌ Reject with Reason
                    </button>
                  </div>
                </>
              )}

              {actionType && (
                <>
                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-2">
                      {actionType === 'reject' ? 'Rejection Reason (Required)' : 'Additional Comments (Optional)'}
                    </label>
                    <textarea
                      value={approveRejectComment}
                      onChange={(e) => setApproveRejectComment(e.target.value)}
                      placeholder={actionType === 'reject' ? 'Explain why this expense is being rejected...' : 'Add any comments...'}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:border-blue-500 focus:outline-none min-h-24"
                    />
                  </div>

                  <div className="flex gap-4">
                    {actionType === 'approve' ? (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={actionInProgress}
                          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition"
                        >
                          {actionInProgress ? 'Processing...' : '✅ Confirm Approval'}
                        </button>
                        <button
                          onClick={() => {
                            setActionType(null);
                            setApproveRejectComment('');
                          }}
                          className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
                        >
                          Back to Report
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleReject}
                          disabled={actionInProgress || !approveRejectComment.trim()}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition"
                        >
                          {actionInProgress ? 'Processing...' : '❌ Confirm Rejection'}
                        </button>
                        <button
                          onClick={() => {
                            setActionType(null);
                            setApproveRejectComment('');
                          }}
                          className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
                        >
                          Back to Report
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
