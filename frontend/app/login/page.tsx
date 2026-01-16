'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

type UserRole = 'employee' | 'manager' | 'finance' | null;

const roleInfo = {
  employee: {
    title: '👤 Employee',
    description: 'Register and submit your expenses',
    email: '',
    password: '',
    features: ['Submit Expenses', 'View My Expenses', 'Download Reports'],
    color: 'from-blue-500 to-blue-600'
  },
  manager: {
    title: '👨‍💼 Manager',
    description: 'Review and approve employee expenses',
    email: 'manager@expensehub.com',
    password: 'password123',
    features: ['View All Expenses', 'Approve/Reject Bills', 'AI-Powered Analysis'],
    color: 'from-purple-500 to-purple-600'
  },
  finance: {
    title: '💰 Finance',
    description: 'Track employee spending and analytics',
    email: 'sarah.johnson@expensehub.com',
    password: 'password123',
    features: ['Employee Spending Analytics', 'All Approvals', 'Reports & Insights'],
    color: 'from-emerald-500 to-emerald-600'
  }
};

export default function Login() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    if (role && roleInfo[role]) {
      setSelectedRole(role);
      setFormData({
        email: roleInfo[role].email,
        password: roleInfo[role].password,
      });
      setError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);

        // Build a frontend-compatible user object from the server's flat response
        const roleMap: Record<string, number> = {
          'EMPLOYEE': 1,
          'MANAGER': 2,
          'FINANCE': 3,
          'ADMIN': 4
        };

        const serverRole = typeof data.role === 'string' ? data.role.toUpperCase() : undefined;
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'User';
        
        const user = {
          id: data.user_id,
          employee_id: data.employee_id || data.user_id,
          user_name: fullName,
          first_name: firstName,
          last_name: lastName,
          email: data.email || '',
          role_id: serverRole ? (roleMap[serverRole] ?? null) : null,
          role: serverRole ? serverRole.toLowerCase() : 'employee'
        };

        // Store individual fields for easy access
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user_name', fullName);
        localStorage.setItem('employee_id', user.employee_id);
        localStorage.setItem('email', user.email);
        localStorage.setItem('user_role', user.role);

        // Redirect Managers (2) to manager dashboard, Finance (3) to finance dashboard, others to dashboard
        if (user.role_id === 2) {
          router.push('/manager-dashboard');
        } else if (user.role_id === 3) {
          router.push('/finance-dashboard');
        } else {
          router.push('/');
        }
      } else {
        const errorData = data?.detail || data?.message || 'Login failed';
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : Array.isArray(errorData) 
            ? errorData.map((err: any) => err.msg || String(err)).join(', ')
            : 'Login failed';
        setError(errorMessage);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error connecting to server';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="text-3xl font-bold text-primary-900">ExpenseHub</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-3">
            Secure Login
          </h1>
          <p className="text-xl text-slate-600 mb-12">
            Select your role to access your dashboard
          </p>
        </div>

        {!selectedRole ? (
          // Role Selection Screen
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
            {Object.entries(roleInfo).map(([roleKey, info]) => (
              <button
                key={roleKey}
                onClick={() => handleRoleSelect(roleKey as UserRole)}
                className="bg-white border border-slate-200 rounded-xl p-8 text-left hover:shadow-soft-lg hover:border-primary-300 transition group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition">{info.title.split(' ')[0]}</div>
                <h3 className="text-xl font-bold text-primary-900 mb-2 group-hover:text-primary-600 transition">
                  {info.title.split(' ').slice(1).join(' ')}
                </h3>
                <p className="text-slate-600 mb-6 text-sm">{info.description}</p>
                <div className="space-y-3 text-sm">
                  {info.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700">
                      <span className="text-primary-600 font-bold">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Login Form Screen
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-soft-md">
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setFormData({ email: '', password: '' });
                  setError('');
                }}
                className="text-primary-600 hover:text-primary-800 font-semibold mb-8 inline-block transition text-sm"
              >
                ← Back to Role Selection
              </button>

              <h2 className="text-2xl font-bold text-primary-900 mb-2">
                {roleInfo[selectedRole].title}
              </h2>
              <p className="text-slate-600 mb-8 text-sm">{roleInfo[selectedRole].description}</p>

              {/* Demo Credentials - Only show for Manager and Finance */}
              {selectedRole !== 'employee' && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                  <p className="text-primary-900 text-sm font-semibold mb-3">Demo Credentials:</p>
                  <div className="space-y-2 text-xs text-primary-700">
                    <div className="bg-white rounded p-2 font-mono text-slate-600">
                      <div className="text-primary-900 font-semibold mb-1">Email:</div>
                      {roleInfo[selectedRole].email}
                    </div>
                    <div className="bg-white rounded p-2 font-mono text-slate-600">
                      <div className="text-primary-900 font-semibold mb-1">Password:</div>
                      {roleInfo[selectedRole].password}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-primary-900 font-semibold mb-2 text-sm">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-primary-900 font-semibold mb-2 text-sm">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 pr-12 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-primary-600 transition font-semibold text-xs"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-slate-600 text-sm mt-6">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
