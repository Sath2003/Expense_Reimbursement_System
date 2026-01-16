'use client';

import Link from 'next/link';

export default function SpendingTracker() {
  const teamSpending = [
    { department: 'Sales', total: 5200, percentage: 45 },
    { department: 'Engineering', total: 3800, percentage: 33 },
    { department: 'HR', total: 1500, percentage: 13 },
    { department: 'Marketing', total: 900, percentage: 9 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Spending Tracker</h1>
          <p className="text-gray-600">Monitor team spending and analytics</p>
        </div>

        {/* Total Spending */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white mb-8 shadow-lg">
          <p className="text-purple-100 text-sm mb-1">Total Team Spending</p>
          <p className="text-5xl font-bold">$11,400</p>
          <p className="text-purple-100 text-sm mt-2">This month (January 2026)</p>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Spending by Department</h2>
          
          {teamSpending.map((dept, idx) => (
            <div key={idx} className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">{dept.department}</span>
                <span className="text-gray-900 font-bold">${dept.total.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${dept.percentage}%` }}
                ></div>
              </div>
              <p className="text-gray-500 text-sm mt-1">{dept.percentage}% of total</p>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Spending Trends</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Chart will display here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
