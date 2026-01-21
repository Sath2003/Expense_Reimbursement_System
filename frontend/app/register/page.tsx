'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    department: '',
    designation: '',
  });
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const departmentDesignations: { [key: string]: string[] } = {
    Engineering: ['Software Engineer', 'Senior Developer', 'Junior Developer', 'Tech Lead', 'Engineering Manager', 'Architect'],
    Sales: ['Sales Executive', 'Sales Manager', 'Regional Manager', 'Sales Director'],
    Marketing: ['Marketing Executive', 'Marketing Manager', 'Content Strategist', 'Brand Manager'],
    HR: ['HR Executive', 'HR Manager', 'Recruiter', 'HR Director'],
    Finance: ['Accountant', 'Finance Manager', 'CFO', 'Financial Analyst'],
    Operations: ['Operations Executive', 'Operations Manager', 'Logistics Manager', 'Operations Director'],
    Manufacturing: ['Production Manager', 'Plant Engineer', 'Quality Assurance Manager', 'Manufacturing Lead'],
    Civil: ['Civil Engineer', 'Site Engineer', 'Project Manager', 'Chief Engineer'],
    Mechanical: ['Mechanical Engineer', 'Design Engineer', 'Project Lead', 'Maintenance Manager'],
    Electrical: ['Electrical Engineer', 'Power Systems Engineer', 'Maintenance Engineer', 'Technical Lead'],
    Other: ['Employee', 'Manager', 'Director', 'Executive'],
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength === 0) return 'Enter password';
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength === 0) return 'bg-gray-300';
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-400';
    return 'bg-green-600';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: `${countryCode} ${formData.phone_number}`.trim(),
          password: formData.password,
          department: formData.department,
          designation: formData.designation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to OTP verification...');
        // Store email and registration flag BEFORE redirecting
        localStorage.setItem('registerEmail', formData.email);
        localStorage.setItem('registrationFlow', 'true');
        
        console.log('Stored email and registration flag, navigating to /verify-otp');
        
        // Redirect immediately with hard refresh
        window.location.href = '/verify-otp';
      } else {
        const errorData = data?.detail || data?.message || 'Registration failed';
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : Array.isArray(errorData) 
            ? errorData.map((err: any) => err.msg || String(err)).join(', ')
            : 'Registration failed';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft-lg p-8 w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Create Account
          </h1>
          <p className="text-slate-600 text-sm">
            Join ExpenseHub to manage your expenses
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-secondary-50 border border-secondary-200 text-secondary-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-primary-900 font-semibold mb-2 text-sm">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-primary-900 font-semibold mb-2 text-sm">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-primary-900 font-semibold mb-2 text-sm">
              Phone Number
            </label>
            <div className="flex gap-3">
              <select
                name="country_code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-40 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
              >
                <option value="+91">IN (+91)</option>
                <option value="+1">US (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+61">AU (+61)</option>
                <option value="+971">UAE (+971)</option>
                <option value="+65">SG (+65)</option>
              </select>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="9876543210"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-primary-900 font-semibold mb-2 text-sm">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
            />
          </div>

          <div>
            <label className="block text-primary-900 font-semibold mb-2 text-sm">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
            >
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Civil">Civil</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-primary-900 font-semibold mb-2 text-sm">
              Designation / Job Title
            </label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
              disabled={!formData.department}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:opacity-50 text-sm"
            >
              <option value="">
                {formData.department ? 'Select designation' : 'Select department first'}
              </option>
              {formData.department && departmentDesignations[formData.department]?.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-primary-900 font-semibold mb-2 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-primary-600 text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded transition ${
                        i <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-semibold ${
                  passwordStrength <= 1 ? 'text-red-600' :
                  passwordStrength <= 2 ? 'text-orange-600' :
                  passwordStrength <= 3 ? 'text-yellow-600' :
                  'text-secondary-600'
                }`}>
                  Password Strength: {getPasswordStrengthLabel(passwordStrength)}
                </p>
                <ul className="text-xs text-slate-600 mt-2 space-y-1">
                  <li className={formData.password.length >= 8 ? 'text-secondary-700 font-semibold' : ''}>
                    {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </li>
                  <li className={/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'text-secondary-700 font-semibold' : ''}>
                    {/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? '✓' : '○'} Mix of uppercase & lowercase
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'text-secondary-700 font-semibold' : ''}>
                    {/[0-9]/.test(formData.password) ? '✓' : '○'} At least one number
                  </li>
                  <li className={/[^a-zA-Z0-9]/.test(formData.password) ? 'text-secondary-700 font-semibold' : ''}>
                    {/[^a-zA-Z0-9]/.test(formData.password) ? '✓' : '○'} Special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="block text-primary-900 font-semibold mb-2 text-sm">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-primary-600 text-sm"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {formData.confirm_password && (
              <p className={`text-xs mt-2 font-semibold ${
                formData.password === formData.confirm_password ? 'text-secondary-700' : 'text-red-600'
              }`}>
                {formData.password === formData.confirm_password ? '✓ Passwords match' : '✕ Passwords do not match'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-soft"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-600 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
