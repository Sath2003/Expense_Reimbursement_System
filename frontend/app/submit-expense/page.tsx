'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/utils/api';
import { useToast, ToastContainer } from '@/components/Toast';

export default function SubmitExpense() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Travel',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receipt: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Categories that require receipt
  const receiptRequiredCategories = ['Accommodation', 'Communication', 'Equipment', 'Food', 'Fuel', 'Meals', 'Miscellaneous', 'Office Supplies', 'Travel'];
  const isReceiptRequired = receiptRequiredCategories.includes(formData.category);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, receipt: file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Validation
    if (!formData.receipt && (!formData.amount || parseFloat(formData.amount) <= 0)) {
      addToast('Please enter a valid amount or upload a receipt', 'error');
      return;
    }

    if (!formData.description || formData.description.length < 5) {
      addToast('Description must be at least 5 characters', 'error');
      return;
    }

    if (isReceiptRequired && !formData.receipt) {
      addToast('Receipt is required for this category', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('category', formData.category);
      formDataToSend.append('amount', formData.amount || '0');
      formDataToSend.append('date', formData.date);
      formDataToSend.append('description', formData.description);
      if (formData.receipt) {
        formDataToSend.append('receipt', formData.receipt);
      }

      const response = await apiCall('/expenses/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      const data: any = await response.json().catch(() => null);
      if (!response.ok) {
        throw data;
      }

      if (data) {
        addToast(`Expense submitted successfully! ID: #${data.id}`, 'success');
        router.push('/expenses');
        setFormData({
          amount: '',
          category: 'Travel',
          description: '',
          date: new Date().toISOString().split('T')[0],
          receipt: null,
        });
        setFileName('');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMsg = error?.detail || 'Failed to submit expense';
      addToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Expense</h1>
          <p className="text-gray-600">Fill in the details below to submit your expense for reimbursement</p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Receipt Upload {isReceiptRequired && <span className="text-red-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <div className="text-4xl mb-2">📄</div>
                    <span className="text-gray-600">
                      {fileName || 'Click to upload receipt (JPG, PNG, PDF)'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Max file size: 10MB
                    </span>
                  </label>
                </div>
                {isReceiptRequired && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Receipt is required for {formData.category} expenses
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Accommodation">Accommodation</option>
                  <option value="Communication">Communication</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Food">Food</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Meals">Meals</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Other">Other</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₹) {!formData.receipt && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder={formData.receipt ? "Optional - will be extracted from receipt" : "Enter amount"}
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!formData.receipt}
                  />
                </div>
                {formData.receipt && (
                  <p className="text-xs text-blue-600 mt-1">💡 Amount will be extracted from receipt automatically</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your expense (minimum 5 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                  minLength={5}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                >
                  {isSubmitting ? '🔄 Submitting...' : '📤 Submit Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload a clear receipt for faster approval</li>
            <li>• Amount is optional when receipt is attached (will be extracted automatically)</li>
            <li>• Provide a detailed description for better tracking</li>
            <li>• Expenses over ₹5,000 typically require manager approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
