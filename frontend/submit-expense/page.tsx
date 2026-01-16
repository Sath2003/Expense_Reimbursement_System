'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CameraCapture from '../components/CameraCapture';

export default function ExpenseSubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [expenseId, setExpenseId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.category_id || !formData.amount || !formData.description) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/expenses/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: parseInt(formData.category_id),
          amount: parseFloat(formData.amount),
          description: formData.description,
          expense_date: formData.expense_date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Failed to submit expense');
        return;
      }

      setExpenseId(data.id);
      setSuccess('Expense submitted! You can now add attachments.');
      
      // Reset form
      setFormData({
        category_id: '',
        amount: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = async (file: File) => {
    if (!expenseId) {
      setError('Please submit expense first before uploading photos');
      return;
    }

    await uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch(
        `http://localhost:8000/api/expenses/${expenseId}/upload-bill`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        setAttachedFiles((prev) =>
          prev.filter((f) => f.name !== file.name)
        );
        setSuccess(`File ${file.name} uploaded successfully`);
      } else {
        setError('Failed to upload file');
      }
    } catch (err) {
      setError('Error uploading file');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary-900 mb-2">Submit Expense</h1>
            <p className="text-slate-600">Add receipts and supporting documents with camera support</p>
          </div>
          <Link href="/home" className="text-primary-600 hover:text-primary-800 font-semibold text-sm flex items-center gap-2">
            ← Back
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-soft-md overflow-hidden">
          {/* Expense Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category */}
              <div>
                <label className="block text-primary-900 font-semibold mb-3 text-sm">
                  Expense Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-slate-900 transition text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="1">Travel</option>
                  <option value="2">Food & Meals</option>
                  <option value="3">Accommodation</option>
                  <option value="4">Office Supplies</option>
                  <option value="5">Communication</option>
                  <option value="6">Miscellaneous</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Amount */}
                <div>
                  <label className="block text-primary-900 font-semibold mb-3 text-sm">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 transition text-sm"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-primary-900 font-semibold mb-3 text-sm">Expense Date</label>
                  <input
                    type="date"
                    name="expense_date"
                    value={formData.expense_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 transition text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-primary-900 font-semibold mb-3 text-sm">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the purpose and details of this expense..."
                  rows={4}
                  minLength={5}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 transition text-sm resize-none"
                  required
                ></textarea>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-secondary-50 border border-secondary-200 text-secondary-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition text-sm ${
                  loading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 shadow-soft'
                }`}
              >
                {loading ? 'Submitting Expense...' : 'Submit Expense'}
              </button>
            </form>

            {/* File Upload Section - Shows after expense is submitted */}
            {expenseId && (
              <div className="mt-10 pt-10 border-t border-slate-200">
                <h2 className="text-2xl font-bold text-primary-900 mb-2">Add Supporting Documents</h2>
                <p className="text-slate-600 mb-6 text-sm">
                  Upload receipt photos, invoices, or other supporting documents
                </p>

                <div className="space-y-4">
                  {/* Camera Capture Button */}
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-soft text-sm"
                  >
                    📸 Capture with Camera
                  </button>

                  {/* File Upload Button */}
                  <label className="w-full py-3 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-soft text-sm">
                    📁 Upload Files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {/* File Preview */}
                  {attachedFiles.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                      <h3 className="font-semibold text-primary-900 mb-4 text-sm">
                        Files Selected: {attachedFiles.length}
                      </h3>
                      <ul className="space-y-3">
                        {attachedFiles.map((file, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-sm"
                          >
                            <span className="text-slate-700 truncate">{file.name}</span>
                            <span className="text-slate-500 whitespace-nowrap ml-4">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Expense ID Info */}
                <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-primary-700 text-sm font-semibold">
                    Expense ID: <span className="font-mono text-primary-900">#{expenseId}</span>
                  </p>
                  <p className="text-primary-600 text-xs mt-2">
                    Your expense has been successfully submitted and is awaiting manager review.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
