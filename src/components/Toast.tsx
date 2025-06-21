'use client';

import toast, { Toaster, resolveValue } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Helper function to render icon components for react-hot-toast
const renderIcon = (IconComponent: React.ComponentType<{className: string}>, className: string) => {
  return <IconComponent className={className} />;
};

// Export the toast functions for use throughout the app
export const showToastNew = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast(message, { 
    icon: renderIcon(AlertCircle, "w-5 h-5 text-yellow-500") 
  }),
  info: (message: string) => toast(message, { 
    icon: renderIcon(Info, "w-5 h-5 text-blue-500") 
  }),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string) => toast.dismiss(id),
  promise: function<T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ) {
    return toast.promise(promise, msgs);
  }
};

// Custom toast component that matches the app theme
const CustomToast = ({ t, message, type }: any) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'loading':
        return <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'loading':
        return 'border-l-indigo-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div
      className={`
        ${t.visible ? 'animate-enter' : 'animate-leave'}
        bg-white/95 backdrop-blur-sm border border-gray-200 ${getBorderColor()} border-l-4
        rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md
        transition-all duration-300 hover:shadow-xl
      `}
    >
      {getIcon()}
      <div className="flex-1">
        <p className="text-gray-800 font-medium text-sm">{resolveValue(message, t)}</p>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function Toast() {
  return (
    <Toaster
      position="bottom-right"
      gutter={12}
      containerStyle={{
        bottom: '20px',
        right: '20px',
      }}
      toastOptions={{
        duration: 5000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0,
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        loading: {
          duration: Infinity,
          iconTheme: {
            primary: '#6366f1',
            secondary: '#ffffff',
          },
        },
      }}
    >
      {(t) => (
        <CustomToast
          t={t}
          message={t.message}
          type={t.type}
        />
      )}
    </Toaster>
  );
}

// Legacy support - keep the old function signature for backward compatibility
export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) {
  const toastOptions = { duration };
  
  switch (type) {
    case 'success':
      toast.success(message, toastOptions);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'warning':
      toast(message, { 
        ...toastOptions, 
        icon: renderIcon(AlertCircle, "w-5 h-5 text-yellow-500") 
      });
      break;
    case 'info':
    default:
      toast(message, { 
        ...toastOptions, 
        icon: renderIcon(Info, "w-5 h-5 text-blue-500") 
      });
      break;
  }
} 