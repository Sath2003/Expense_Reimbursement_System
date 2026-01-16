'use client';

import { useState, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success', duration = 4000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg animate-slide-in text-white font-semibold max-w-sm ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}
        >
          <span className="text-2xl">
            {toast.type === 'success' ? '✓' : '✕'}
          </span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-white hover:opacity-80 transition ml-2 text-xl"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
