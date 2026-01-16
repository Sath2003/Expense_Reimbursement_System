'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [status, setStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const test = async () => {
      setLoading(true);
      const results: Record<string, any> = {};

      // Test 1: Can we reach backend health?
      try {
        console.log('Testing health endpoint...');
        const healthResponse = await fetch('http://localhost:8000/health', {
          method: 'GET',
        });
        results.health = {
          status: healthResponse.status,
          ok: healthResponse.ok,
          text: await healthResponse.text(),
        };
        console.log('Health check passed:', results.health);
      } catch (err: any) {
        results.health = { error: err.message };
        console.error('Health check failed:', err);
      }

      // Test 2: Can we reach API root?
      try {
        console.log('Testing API root...');
        const apiResponse = await fetch('http://localhost:8000/api/', {
          method: 'GET',
        });
        results.apiRoot = {
          status: apiResponse.status,
          ok: apiResponse.ok,
          text: await apiResponse.text(),
        };
      } catch (err: any) {
        results.apiRoot = { error: err.message };
        console.error('API root failed:', err);
      }

      // Test 3: Check token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      results.token = token ? `✓ Token exists (${token.substring(0, 20)}...)` : '✗ No token found';

      // Test 4: Try to login
      try {
        console.log('Testing login endpoint...');
        const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'amit.patel@expensemgmt.com',
            password: 'senior@123',
          }),
        });
        results.login = {
          status: loginResponse.status,
          ok: loginResponse.ok,
          data: await loginResponse.json(),
        };
        console.log('Login response:', results.login);
      } catch (err: any) {
        results.login = { error: err.message };
        console.error('Login failed:', err);
      }

      setStatus(results);
      setLoading(false);
    };

    test();
  }, []);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔍 Debug - Backend Connection</h1>

      {loading ? (
        <div className="text-yellow-400">Testing connection...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(status).map(([key, value]) => (
            <div key={key} className="bg-gray-800 p-4 rounded border border-gray-700">
              <h2 className="text-lg font-semibold text-cyan-400 mb-2">{key}</h2>
              <pre className="text-sm overflow-auto bg-gray-900 p-2 rounded text-gray-300">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-gray-400 text-sm">
        <p>Check browser console (F12) for detailed logs</p>
      </div>
    </div>
  );
}
