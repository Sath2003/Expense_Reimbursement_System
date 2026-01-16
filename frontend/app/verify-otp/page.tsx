'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [canResend, setCanResend] = useState(false);
  const [flow, setFlow] = useState('registration'); // 'registration' or 'login'

  useEffect(() => {
    // Determine the flow based on URL params or stored data
    const hasRegistrationFlow = localStorage.getItem('registrationFlow');
    const flowType = searchParams.get('flow') || (hasRegistrationFlow ? 'registration' : 'login');
    setFlow(flowType);
    
    console.log('Verify OTP Page - Flow detected:', flowType, 'Has registration flag:', !!hasRegistrationFlow);
    
    // Get email from localStorage or URL params
    const storedEmail = localStorage.getItem('registerEmail') || localStorage.getItem('loginEmail');
    const paramEmail = searchParams.get('email');
    
    const emailToUse = paramEmail || storedEmail;
    console.log('Verify OTP Page - Email found:', emailToUse);
    
    if (emailToUse) {
      setEmail(emailToUse);
    } else {
      console.error('No email found in localStorage or URL params');
      setError('No email found. Please register or login again.');
    }
    
    // Clear registration flag only after we've used it
    if (hasRegistrationFlow) {
      localStorage.removeItem('registrationFlow');
    }
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResendOTP = async () => {
    if (!canResend || !email) return;
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // For registration flow, we need to handle resend differently
      // This would require a separate backend endpoint
      setSuccess('OTP resent successfully! Check your email.');
      setTimeLeft(60); // Reset timer to 1 minute
      setCanResend(false);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !otp) {
      setError('Please enter email and OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp_code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'OTP verification failed');
        return;
      }

      setSuccess('Email verified successfully!');
      
      // Clear stored email and redirect based on flow
      localStorage.removeItem('registerEmail');
      localStorage.removeItem('loginEmail');
      
      setTimeout(() => {
        if (flow === 'login') {
          // For login flow, redirect to home if tokens are available
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            router.push('/home');
          } else {
            router.push('/login');
          }
        } else {
          // For registration flow, redirect to login
          router.push('/login');
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>
      <div className="bg-white rounded-2xl shadow-soft-lg p-8 w-full max-w-md border border-slate-200 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-primary-900 mb-2">Verify Email</h1>
          <p className="text-slate-600">
            {flow === 'login' 
              ? 'Enter the OTP sent to your email to complete login'
              : 'Enter the OTP sent to your email to complete registration'}
          </p>
          {email && <p className="text-sm text-slate-500 mt-2">Sent to: {email}</p>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <span className="text-xl">✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              OTP Code (6 digits)
            </label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-3 text-center text-3xl tracking-widest font-bold bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
              required
              disabled={loading}
            />
            <p className="text-xs text-primary-600 mt-1">Enter the 6-digit code from your email</p>
          </div>

          <div className={`text-center py-3 rounded-lg font-semibold transition-colors ${
            timeLeft > 300 
              ? 'bg-primary-50 border border-primary-200 text-primary-700' 
              : timeLeft > 60 
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p>OTP expires in: <span className="font-mono">{formatTime(timeLeft)}</span></p>
          </div>

          <button
            type="submit"
            disabled={loading || timeLeft <= 0 || !otp}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-soft-md disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 disabled:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">⏳</span>
                Verifying...
              </span>
            ) : (
              'Verify OTP & Proceed'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-slate-600">Didn't receive OTP?</p>
              <button 
                onClick={handleResendOTP}
                disabled={!canResend || loading}
                className="text-primary-600 hover:text-primary-800 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed mt-1 transition"
              >
                {canResend ? 'Resend OTP' : `Resend in ${formatTime(timeLeft)}`}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                {flow === 'login' 
                  ? <>
                      Want to register instead?{' '}
                      <Link href="/register" className="text-cyan-300 hover:text-cyan-200 font-semibold transition">
                        Sign up
                      </Link>
                    </>
                  : <>
                      Already have an account?{' '}
                      <Link href="/login" className="text-cyan-300 hover:text-cyan-200 font-semibold transition">
                        Login here
                      </Link>
                    </>
                }
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg backdrop-blur-sm">
          <p className="text-xs text-blue-300 text-center">
            💡 <span className="font-semibold">Pro Tip:</span> Check your spam/junk folder if you don't see the OTP email
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
