'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary-900">ExpenseHub</div>
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-6 py-2 text-primary-600 font-semibold hover:text-primary-800 transition">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition shadow-soft">
                Register
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-8">
            <span className="text-primary-700 text-sm font-semibold">Professional Expense Management</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary-900 mb-6 leading-tight">
            Streamline Your Business Expenses
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            A comprehensive expense management system designed for modern organizations. 
            Submit, review, and approve expenses with confidence and transparency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition shadow-soft-md">
                Get Started
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-3 border-2 border-primary-300 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-900 mb-4">Core Features</h2>
            <p className="text-xl text-slate-600">Everything you need to manage expenses efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-lg border border-slate-200 hover:shadow-soft-lg transition">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Submit Expenses</h3>
              <p className="text-slate-600">
                Easily submit expense reports with detailed information, receipts, and supporting documents. 
                Camera integration for quick bill capture.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-8 rounded-lg border border-secondary-200 hover:shadow-soft-lg transition">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Multi-Level Approvals</h3>
              <p className="text-secondary-700">
                Streamlined approval workflow with manager review and finance team validation. 
                AI-powered expense verification for added security.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-8 rounded-lg border border-accent-200 hover:shadow-soft-lg transition">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-accent-900 mb-3">Analytics & Reports</h3>
              <p className="text-accent-700">
                Comprehensive analytics and reporting. Track spending patterns, 
                departmental costs, and employee expenses with detailed insights.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-lg border border-slate-200 hover:shadow-soft-lg transition">
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Secure & Compliant</h3>
              <p className="text-slate-600">
                Enterprise-grade security with role-based access control, 
                audit trails, and compliance with industry standards.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-lg border border-primary-200 hover:shadow-soft-lg transition">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">AI Verification</h3>
              <p className="text-primary-700">
                Intelligent bill recognition and validation using advanced AI. 
                Automatic expense categorization and anomaly detection.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-lg border border-slate-200 hover:shadow-soft-lg transition">
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Mobile Friendly</h3>
              <p className="text-slate-600">
                Responsive design that works seamlessly on all devices. 
                Submit expenses on the go with full functionality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-900 mb-4">For Every Role</h2>
            <p className="text-xl text-slate-600">Tailored features for different user types</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Employee Card */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-soft-md transition">
              <div className="h-2 bg-gradient-to-r from-slate-400 to-slate-600"></div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-primary-900 mb-2">👤 Employees</h3>
                <p className="text-slate-600 mb-6">Submit and track your business expenses with ease.</p>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-primary-600 font-bold">→</span>Submit expense reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary-600 font-bold">→</span>Upload receipts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary-600 font-bold">→</span>Track approval status
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary-600 font-bold">→</span>Download reports
                  </li>
                </ul>
              </div>
            </div>

            {/* Manager Card */}
            <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden hover:shadow-soft-md transition">
              <div className="h-2 bg-gradient-to-r from-secondary-400 to-secondary-600"></div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-secondary-900 mb-2">👨‍💼 Managers</h3>
                <p className="text-secondary-700 mb-6">Review and approve employee expense submissions.</p>
                <ul className="space-y-3 text-secondary-700">
                  <li className="flex items-center gap-2">
                    <span className="text-secondary-600 font-bold">→</span>Review submissions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary-600 font-bold">→</span>Approve or reject
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary-600 font-bold">→</span>Team analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary-600 font-bold">→</span>Manage approvals
                  </li>
                </ul>
              </div>
            </div>

            {/* Finance Card */}
            <div className="bg-white border border-accent-200 rounded-lg overflow-hidden hover:shadow-soft-md transition">
              <div className="h-2 bg-gradient-to-r from-accent-400 to-accent-600"></div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-accent-900 mb-2">💰 Finance</h3>
                <p className="text-accent-700 mb-6">Monitor spending and validate approved expenses.</p>
                <ul className="space-y-3 text-accent-700">
                  <li className="flex items-center gap-2">
                    <span className="text-accent-600 font-bold">→</span>View all expenses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-600 font-bold">→</span>AI verification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-600 font-bold">→</span>Analytics dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-600 font-bold">→</span>Financial reports
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to streamline your expenses?</h2>
          <p className="text-lg text-slate-700 mb-8">
            Join organizations managing expenses more efficiently
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-3 bg-white text-primary-900 font-semibold rounded-lg hover:bg-primary-50 transition shadow-soft-md">
                Start Free
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-primary-800 transition">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-primary-900 mb-4">ExpenseHub</h4>
              <p className="text-slate-600 text-sm">Professional expense management for modern organizations.</p>
            </div>
            <div>
              <h4 className="font-semibold text-primary-900 mb-4">Product</h4>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li><Link href="/login" className="hover:text-primary-600">Features</Link></li>
                <li><Link href="/login" className="hover:text-primary-600">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary-900 mb-4">Company</h4>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li><a href="#" className="hover:text-primary-600">About</a></li>
                <li><a href="#" className="hover:text-primary-600">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li><a href="#" className="hover:text-primary-600">Privacy</a></li>
                <li><a href="#" className="hover:text-primary-600">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-slate-600 text-sm">
            <p>&copy; 2024 ExpenseHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
