'use client';

import './globals.css';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Check and clear expired tokens on app load
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token is expired, clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        // Invalid token format, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
