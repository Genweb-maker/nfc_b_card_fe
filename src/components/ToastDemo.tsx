'use client';

import { showToast } from './Toast';
import { handleError, showSuccess, showWarning, showInfo, handleNetworkError } from '../lib/errorHandler';

export default function ToastDemo() {
  const demoNotifications = [
    {
      label: 'Success Toast',
      action: () => showSuccess('Operation completed successfully!'),
      className: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Error Toast',
      action: () => handleError(new Error('Something went wrong!'), { context: 'demo operation' }),
      className: 'bg-red-600 hover:bg-red-700'
    },
    {
      label: 'Warning Toast',
      action: () => showWarning('Please be careful with this action'),
      className: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      label: 'Info Toast',
      action: () => showInfo('Here is some useful information'),
      className: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Network Error',
      action: () => handleNetworkError(new Error('Failed to fetch'), 'load data'),
      className: 'bg-red-600 hover:bg-red-700'
    },
    {
      label: 'Legacy Success',
      action: () => showToast('Legacy success message', 'success'),
      className: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Multiple Toasts',
      action: () => {
        showSuccess('First notification');
        setTimeout(() => showWarning('Second notification'), 500);
        setTimeout(() => showInfo('Third notification'), 1000);
      },
      className: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Toast Notification Demo
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Click the buttons below to see the new themed toast notifications in action!
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {demoNotifications.map((demo, index) => (
            <button
              key={index}
              onClick={demo.action}
              className={`px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-1 ${demo.className}`}
            >
              {demo.label}
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Features:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Modern backdrop blur styling matching app theme</li>
            <li>• Smooth slide-in animations from the right</li>
            <li>• Color-coded borders for different notification types</li>
            <li>• Dismissible with close button</li>
            <li>• Auto-dismiss with configurable durations</li>
            <li>• Better error handling with context information</li>
            <li>• Backward compatibility with existing code</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 