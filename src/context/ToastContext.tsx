import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '../types';
import { CheckIcon, AlertCircleIcon, CloseIcon } from '../assets/icons/Icons';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9) + Date.now();
    const newToast: ToastMessage = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-item">
            {toast.type === 'success' && <CheckIcon size={20} className="text-white" strokeWidth={2.5} />}
            {toast.type === 'error' && <AlertCircleIcon size={20} className="text-red-400" />}
            {toast.type === 'info' && <CheckIcon size={20} className="text-white" />}
            {toast.type === 'warning' && <AlertCircleIcon size={20} className="text-amber-400" />}
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '0.01em' }}>{toast.title}</div>
              {toast.message && (
                <div style={{ fontSize: 12, color: '#A3A3A3', marginTop: 2 }}>{toast.message}</div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', color: '#777', cursor: 'pointer', padding: 4 }}
            >
              <CloseIcon size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
