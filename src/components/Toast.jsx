import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { toDisplayMessage } from '../utils/errorMessage';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'bg-emerald-500/90 border-emerald-400',
  error: 'bg-red-500/90 border-red-400',
  info: 'bg-cyan-500/90 border-cyan-400',
  warning: 'bg-amber-500/90 border-amber-400',
};

const DURATIONS = { success: 4000, error: 6000, info: 4000, warning: 5000 };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type, message) => {
      const id = ++counter.current;
      const safeMessage = toDisplayMessage(message);
      setToasts((prev) => {
        const next = [...prev, { id, type, message: safeMessage }];
        return next.slice(-4); // max 4 visible
      });
      setTimeout(() => dismiss(id), DURATIONS[type] || 4000);
    },
    [dismiss]
  );

  const toast = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    info: (msg) => addToast('info', msg),
    warning: (msg) => addToast('warning', msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — bottom-right corner */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto flex items-start gap-3 min-w-72 max-w-sm
                px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg
                text-white text-sm font-medium
                animate-in slide-in-from-right-5 duration-300
                ${COLORS[t.type]}
              `}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
