'use client';

import Link from 'next/link';

export default function Analytics() {
  const metrics = [
    { label: 'Total Expenses', value: '$11,400', change: '+12.5%', icon: '💰' },
    { label: 'Avg Expense', value: '$425', change: '+5.2%', icon: '📊' },
    { label: 'Approved Rate', value: '92%', change: '+3.1%', icon: '✅' },
    { label: 'Pending Review', value: '8', change: '-2.3%', icon: '⏳' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">View detailed analytics and reports</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="text-4xl mb-3">{metric.icon}</div>
              <p className="text-gray-600 text-sm font-semibold mb-1">{metric.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
              <p className="text-green-600 text-sm font-semibold">{metric.change} from last month</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Expenses by Category</h2>
            <div className="space-y-4">
              {[
                { category: 'Travel', amount: 4500, percentage: 39 },
                { category: 'Meals', amount: 3200, percentage: 28 },
                { category: 'Office Supplies', amount: 2100, percentage: 18 },
                { category: 'Equipment', amount: 1600, percentage: 15 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 font-semibold">{item.category}</span>
                    <span className="text-gray-900 font-bold">${item.amount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Overview</h2>
            <div className="space-y-4">
              {[
                { status: 'Approved', count: 145, color: 'bg-green-500' },
                { status: 'Pending', count: 12, color: 'bg-yellow-500' },
                { status: 'Rejected', count: 8, color: 'bg-red-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                  <span className="text-gray-700 font-semibold flex-1">{item.status}</span>
                  <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Trend</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Trend chart will display here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
