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
  const recipientRequiredCategories = ['Travel', 'Equipment', 'Accommodation', 'Office Supplies', 'Fuel', 'Food', 'Communication', 'Miscellaneous', 'Meals'];
  const isReceiptRequired = recipientRequiredCategories.includes(formData.category);

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
    console.log('Form submitted', formData);
    
    if (!formData.description) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    // Check if receipt is required and provided
    if (isReceiptRequired && !formData.receipt) {
      addToast(`Receipt is required for ${formData.category} expenses`, 'error');
      return;
    }

    // Check if amount is required (when no receipt is provided and category is not Fuel)
    if (!formData.receipt && formData.category !== 'Fuel' && !formData.amount) {
      addToast('Please enter amount since no receipt is provided', 'error');
      return;
    }

    // Validate amount is a positive number if provided
    if (formData.amount && parseInt(formData.amount) <= 0) {
      addToast('Amount must be greater than 0', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Form data before submission:', formData);
      console.log('Submitting expense...');
      
      // Create FormData for multipart submission (for file upload)
      const submitData = new FormData();
      
      // Only include amount if it's provided and non-zero
      if (formData.amount && parseInt(formData.amount) > 0) {
        submitData.append('amount', formData.amount);
      }
      
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('date', formData.date);
      
      if (formData.receipt) {
        submitData.append('receipt', formData.receipt);
      }

      // Log FormData contents
      for (let pair of submitData.entries()) {
        console.log('FormData entry:', pair[0], '=', pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
      }

      // Use the API utility function
      const response = await apiCall('/expenses/submit', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        let errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : data.detail && typeof data.detail === 'object'
            ? JSON.stringify(data.detail)
            : data.message || 'Failed to submit expense. Please try again.';
        
        // Improve error message for extraction failures
        if (errorMsg.includes('Could not automatically extract amount')) {
          errorMsg = '📋 Receipt received, but amount could not be extracted. You can manually enter the amount from the "My Expenses" page after submission.';
        } else if (errorMsg.includes('tesseract is not installed')) {
          errorMsg = '📋 Receipt received, but automatic extraction is not available. You can manually enter the amount from the "My Expenses" page after submission.';
        }
        
        addToast(errorMsg, 'error');
        setIsSubmitting(false);
        return;
      }

      console.log('Expense submitted successfully:', data);
      addToast(`✓ Expense submitted successfully! Your expense ID is #${data.id}`, 'success');
      
      // Reset form
      setFormData({ amount: '', category: 'Travel', description: '', date: new Date().toISOString().split('T')[0], receipt: null });
      setFileName('');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/expenses');
      }, 2000);
    } catch (error) {
      console.error('Error submitting expense:', error);
      const errorMsg = error instanceof Error ? error.message : 'Network error: Unable to connect to server. Please check your connection.';
      
      if (errorMsg.includes('No authentication token')) {
        addToast('Session expired. Please login again.', 'error');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        addToast(errorMsg, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="text-primary-600 hover:text-primary-800 font-semibold mb-4 inline-flex items-center gap-1 transition">
            ← Back to Dashboard
          </Link>
          <div className="mb-6">
            <h1 className="text-5xl font-black text-primary-900 mb-2">Submit Expense</h1>
            <p className="text-lg text-slate-600">Submit a new expense for reimbursement</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-soft-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* File Upload - Show First */}
            <div>
              <label className="block text-primary-900 font-bold mb-3">
                {isReceiptRequired ? (
                  <>Receipt/Payment Proof <span className="text-orange-600">*</span></>
                ) : (
                  <>Receipt/Payment Proof <span className="text-slate-500 font-normal text-sm">Optional</span></>
                )}
              </label>
              {isReceiptRequired && (
                <div className="mb-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    <span className="font-bold">⚠️ Required:</span> Receipt must be provided for {formData.category} expenses
                  </p>
                </div>
              )}
              <div className="relative">
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.docx,.doc"
                  className="hidden"
                  required={isReceiptRequired}
                />
                <label
                  htmlFor="file-input"
                  className={`block border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer group ${
                    isReceiptRequired
                      ? fileName
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-300 bg-red-50 hover:border-red-500'
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition transform">
                    {fileName ? '✓' : '📎'}
                  </div>
                  {fileName ? (
                    <>
                      <p className="text-gray-900 font-bold text-lg">{fileName}</p>
                      <p className="text-sm text-gray-600 mt-1">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-700 font-semibold text-lg">Drag and drop your receipt or payment proof here</p>
                      <p className="text-sm text-gray-600 mt-2">or click to browse</p>
                      <p className="text-xs text-gray-500 mt-3">
                        Supported: Receipt (PDF, JPG, PNG) • UPI/Payment Screenshots (JPG, PNG, GIF)
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Max 5MB per file</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Amount - Only show if NO receipt is provided OR category is Fuel */}
            <div className={!fileName || formData.category === 'Fuel' ? 'animate-fade-in' : 'hidden'}>
              <label className="block text-gray-800 font-bold mb-3">
                Amount <span className="text-red-500">{formData.category === 'Fuel' ? '' : '*'}</span>
                {formData.category === 'Fuel' && <span className="text-gray-500 font-normal text-sm ml-2">(Optional - will be extracted from receipt)</span>}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-600 font-semibold text-lg">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount in INR"
                  min="0"
                  step="1"
                  required={!fileName && formData.category !== 'Fuel'}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold transition"
                />
              </div>
              {formData.amount && (
                <p className="text-sm text-gray-600 mt-2">₹ {parseInt(formData.amount).toLocaleString('en-IN')}</p>
              )}
            </div>

            {/* Amount Auto-filled Message - Show if receipt is provided */}
            {fileName && (
              <div className="animate-fade-in bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✓ Receipt attached</p>
                <p className="text-sm text-green-700 mt-1">Amount will be extracted from the receipt during processing</p>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-gray-800 font-bold mb-3">Category <span className="text-red-500">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold transition bg-white cursor-pointer"
              >
                <option value="Accommodation">🏨 Accommodation</option>
                <option value="Communication">📞 Communication</option>
                <option value="Equipment">⚙️ Equipment</option>
                <option value="Food">🍽️ Food</option>
                <option value="Fuel">⛽ Fuel</option>
                <option value="Meals">🍽️ Meals & Drinks</option>
                <option value="Miscellaneous">📌 Miscellaneous</option>
                <option value="Office Supplies">📦 Office Supplies</option>
                <option value="Other">📌 Other</option>
                <option value="Travel">🚗 Travel</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-800 font-bold mb-3">Expense Date <span className="text-red-500">*</span> <span className="text-gray-500 font-normal text-sm">(When did you incur this expense?)</span></label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold transition cursor-pointer"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-800 font-bold mb-3">Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter detailed expense information (purpose, vendor, etc.)..."
                rows={5}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 font-semibold transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                onClick={(e) => {
                  console.log('Submit button clicked');
                  handleSubmit(e);
                }}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-soft-md cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ✓ Submit Expense
                  </span>
                )}
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-lg transition text-center flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-3">
              <span className="font-bold">📋 Important:</span>
            </p>
            <ul className="text-sm text-blue-900 space-y-2 ml-4">
              <li>✓ <span className="font-semibold">Receipt Required:</span> Travel, Equipment, Accommodation, Office Supplies</li>
              <li>✓ <span className="font-semibold">Receipt Optional:</span> Meals & Drinks, Other</li>
              <li>✓ <span className="font-semibold">Accepted Formats:</span> Original receipts (PDF/JPG/PNG) or UPI/Payment screenshots</li>
              <li>✓ <span className="font-semibold">Tip:</span> Submit within 30 days for faster processing</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(400px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
