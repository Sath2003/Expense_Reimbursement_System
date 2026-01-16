'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserInfo {
  user_name: string;
  employee_id: string;
  email: string;
  role: string;
}

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Check if token exists and is valid
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData && userData.role_id) {
          setIsLoggedIn(true);
          
          // Extract user info from localStorage or user object
          const userName = localStorage.getItem('user_name') || userData.user_name || userData.name || 'User';
          const employeeId = localStorage.getItem('employee_id') || userData.employee_id || userData.id || 'N/A';
          const email = localStorage.getItem('email') || userData.email || 'N/A';
          const userRole = localStorage.getItem('user_role') || userData.role || 'Employee';
          
          setUserInfo({
            user_name: userName,
            employee_id: employeeId,
            email: email,
            role: userRole
          });
          
          // Route based on role:
          // Manager (role 2) → Manager Dashboard (Approvals only)
          // HR/Finance (role 3) → HR Dashboard (Approvals + Analytics)
          if (userData.role_id === 2) {
            // Manager - goes to manager dashboard (approvals only)
            router.push('/manager-dashboard');
          } else if (userData.role_id === 3) {
            // HR/Finance - goes to HR dashboard (approvals + analytics)
            router.push('/hr-dashboard');
          }
          // Employees stay on dashboard
        } else {
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [router]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Floating money animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <style>{`
            @keyframes float-up { 
              0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(-100vh) translateX(100px) rotate(360deg); opacity: 0; }
            }
            @keyframes float-up-2 { 
              0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(-100vh) translateX(-100px) rotate(-360deg); opacity: 0; }
            }
            .money-float { animation: float-up 8s infinite ease-in; }
            .money-float-alt { animation: float-up-2 10s infinite ease-in; }
            .money-item { font-size: 3rem; }
          `}</style>
          
          {/* Money floating elements */}
          <div className="money-item money-float absolute left-[10%]" style={{ animationDelay: '0s' }}>💵</div>
          <div className="money-item money-float-alt absolute left-[20%]" style={{ animationDelay: '1s' }}>💴</div>
          <div className="money-item money-float absolute left-[30%]" style={{ animationDelay: '2s' }}>💶</div>
          <div className="money-item money-float-alt absolute left-[40%]" style={{ animationDelay: '3s' }}>💷</div>
          <div className="money-item money-float absolute left-[50%]" style={{ animationDelay: '4s' }}>💵</div>
          <div className="money-item money-float-alt absolute left-[60%]" style={{ animationDelay: '5s' }}>💴</div>
          <div className="money-item money-float absolute left-[70%]" style={{ animationDelay: '6s' }}>💶</div>
          <div className="money-item money-float-alt absolute left-[80%]" style={{ animationDelay: '7s' }}>💷</div>
          <div className="money-item money-float absolute left-[90%]" style={{ animationDelay: '8s' }}>💵</div>
          
          <div className="money-item money-float absolute left-[15%]" style={{ animationDelay: '1.5s' }}>💳</div>
          <div className="money-item money-float-alt absolute left-[35%]" style={{ animationDelay: '2.5s' }}>💰</div>
          <div className="money-item money-float absolute left-[55%]" style={{ animationDelay: '3.5s' }}>💳</div>
          <div className="money-item money-float-alt absolute left-[75%]" style={{ animationDelay: '4.5s' }}>💰</div>
        </div>

        <div className="relative z-10 text-center max-w-3xl">
          <style>{`
            @keyframes float { 
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            .animate-float { animation: float 6s ease-in-out infinite; }
          `}</style>
          <div className="mb-12 animate-float">
            <div className="inline-block mb-6 text-8xl">💼</div>
            <h1 className="text-6xl md:text-7xl font-black text-primary-900 mb-4">
              Expense Hub
            </h1>
            <p className="text-2xl md:text-3xl text-primary-700 font-light mb-3">
              Smart Expense Management System
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Streamline your reimbursement process with intelligent tracking, approvals, and real-time analytics
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link
              href="/login"
              className="px-12 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-bold shadow-soft-lg hover:shadow-soft-lg hover:scale-105 transition transform duration-300"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-12 py-4 bg-white border-2 border-primary-300 text-primary-700 rounded-xl font-bold hover:bg-primary-50 hover:border-primary-400 transition duration-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      href: '/submit-expense',
      icon: '📝',
      title: 'Submit Expense',
      description: 'Submit a new expense for reimbursement',
      color: 'primary',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      borderColor: 'border-primary-300',
      textColor: 'text-primary-600'
    },
    {
      href: '/expenses',
      icon: '💰',
      title: 'My Expenses',
      description: 'View and track your submitted expenses',
      color: 'secondary',
      bgColor: 'bg-gradient-to-br from-secondary-50 to-secondary-100',
      borderColor: 'border-secondary-300',
      textColor: 'text-secondary-600'
    },
    {
      href: '/reports',
      icon: '📋',
      title: 'Reports',
      description: 'Generate and view expense reports',
      color: 'accent',
      bgColor: 'bg-gradient-to-br from-accent-50 to-accent-100',
      borderColor: 'border-accent-300',
      textColor: 'text-accent-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8 relative overflow-hidden">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-in { animation: slide-in 0.6s ease-out; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-12px); box-shadow: 0 25px 50px rgba(59, 130, 246, 0.2); }
        .stat-card { backdrop-filter: blur(10px); }
      `}</style>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-16 animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
                Dashboard
              </h1>
              <p className="text-base md:text-xl text-slate-700 font-light">
                Welcome back, {userInfo?.user_name}! Here's your command center for expense management
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('user_name');
                localStorage.removeItem('user_role');
                localStorage.removeItem('employee_id');
                localStorage.removeItem('email');
                window.location.reload();
              }}
              className="ml-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Employee Info Card */}
        {userInfo && (
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-2 border-blue-300 rounded-xl p-8 mb-12 shadow-soft-md">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>👤</span> Employee Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="border-r border-blue-300 last:border-r-0 pr-4 md:pr-6 lg:pr-8">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Full Name</p>
                <p className="text-xl font-bold text-slate-900">{userInfo.user_name}</p>
              </div>
              <div className="border-r border-blue-300 last:border-r-0 pr-4 md:pr-6 lg:pr-8">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">🔑 Employee ID</p>
                <p className="text-xl font-bold text-slate-900">{userInfo.employee_id}</p>
              </div>
              <div className="border-r border-blue-300 last:border-r-0 pr-4 md:pr-6 lg:pr-8">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">✉️ Email</p>
                <p className="text-lg font-bold text-slate-900 break-all">{userInfo.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">👔 Role</p>
                <p className="text-xl font-bold text-slate-900 capitalize">{userInfo.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-12">
          <div className="stat-card bg-white/5 border border-blue-400/30 rounded-xl p-6 text-white shadow-lg hover:bg-white/10 transition">
            <div className="text-4xl mb-3">📤</div>
            <p className="text-blue-300 text-xs md:text-sm mb-1 font-semibold">Ready to Submit</p>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Submit Now</p>
          </div>
          <div className="stat-card bg-white/5 border border-purple-400/30 rounded-xl p-6 text-white shadow-lg hover:bg-white/10 transition">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-purple-300 text-xs md:text-sm mb-1 font-semibold">Your Expenses</p>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">Track Progress</p>
          </div>
          <div className="stat-card bg-white/5 border border-emerald-400/30 rounded-xl p-6 text-white shadow-lg hover:bg-white/10 transition">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-emerald-300 text-xs md:text-sm mb-1 font-semibold">Pending Action</p>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Review Status</p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`card-hover ${item.bgColor} border-2 ${item.borderColor} rounded-xl p-6 md:p-8 group cursor-pointer backdrop-blur-sm h-full flex flex-col`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="text-5xl md:text-6xl mb-4 transform group-hover:scale-110 transition duration-300">
                {item.icon}
              </div>
              <h3 className={`text-xl md:text-2xl font-bold ${item.textColor} mb-2 group-hover:brightness-150 transition`}>
                {item.title}
              </h3>
              <p className="text-gray-700 text-xs md:text-sm leading-relaxed font-medium flex-grow">
                {item.description}
              </p>
              <div className={`mt-4 flex items-center ${item.textColor} font-bold text-xs md:text-sm opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-2`}>
                Get Started →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
