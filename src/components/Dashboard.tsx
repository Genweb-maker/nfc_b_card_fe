'use client';

import { useState, useEffect } from 'react';
import { getConnectionStats } from '../lib/api';
import { showToast } from './Toast';
import { Users, Download, Smartphone, ScanLine, Bell, Share2, UserPlus, Settings, QrCode, Wifi, BarChart3, Zap } from 'lucide-react';

interface Stats {
  received: number;
  sent: number;
  nfc: number;
  qr: number;
  total: number;
}

interface DashboardProps {
  onPageChange: (page: 'dashboard' | 'profile' | 'share' | 'connections') => void;
}

export default function Dashboard({ onPageChange }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    received: 0,
    sent: 0,
    nfc: 0,
    qr: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPWAButton, setShowPWAButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    loadStats();
    checkPWAInstallable();
    setupPWAInstallPrompt();
  }, []);

  const setupPWAInstallPrompt = () => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Clean up event listener
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  };

  const checkPWAInstallable = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = (window as any).navigator?.standalone === true || isStandalone;
    
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check if it's iOS Safari
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSSafari = isIOSDevice && !(window as any).MSStream;
    
    // Show PWA button if:
    // 1. App is not already installed
    // 2. It's a mobile device OR we have a deferred prompt
    // 3. Special handling for iOS Safari (since it doesn't support beforeinstallprompt)
    if (!isInstalled) {
      if (isMobile || deferredPrompt || isIOSSafari) {
        setShowPWAButton(true);
      }
    } else {
      setShowPWAButton(false);
    }
  };

  const handlePWAInstall = async () => {
    // Check if it's iOS Safari
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSSafari = isIOSDevice && !(window as any).MSStream;
    
    if (deferredPrompt) {
      // Use the native install prompt for supported browsers
      try {
        // Show the install prompt
        const result = await deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          showToast('App installed successfully!', 'success');
          setShowPWAButton(false);
        } else {
          showToast('App installation cancelled', 'info');
        }
        
        // Clear the deferredPrompt so it can only be used once
        setDeferredPrompt(null);
      } catch (error) {
        console.error('PWA installation failed:', error);
        showToast('Installation failed. Please try adding to home screen manually.', 'error');
      }
    } else if (isIOSSafari) {
      // Special instructions for iOS Safari
      showToast(
        'To install: 1) Tap the Share button 2) Scroll down and tap "Add to Home Screen" 3) Tap "Add"',
        'info',
        8000
      );
    } else {
      // Fallback for other browsers
      showToast(
        'To install this app: Look for "Add to Home Screen" or "Install App" option in your browser menu',
        'info',
        6000
      );
    }
  };

  const loadStats = async () => {
    try {
      const response = await getConnectionStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      showToast('Failed to load dashboard stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Users,
      title: 'Profiles Shared',
      value: stats.sent,
      bgColor: 'bg-gray-800'
    },
    {
      icon: Download,
      title: 'Profile Received',
      value: stats.received,
      bgColor: 'bg-gray-800'
    },
    {
      icon: Smartphone,
      title: 'NFC Shares',
      value: stats.nfc,
      bgColor: 'bg-gray-800'
    },
    {
      icon: ScanLine,
      title: 'QR Shares',
      value: stats.qr,
      bgColor: 'bg-gray-800'
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-6">
        <div className="flex items-center gap-2 text-gray-800">
          <img src="/icons/nfc_logo.jpg" alt="NPC Business Card" className="w-6 h-6" />
          <span className="font-semibold text-lg">NPC Business Card</span>
        </div>
        <div className="flex items-center gap-3 text-gray-800">
          {showPWAButton && (
            <button
              onClick={handlePWAInstall}
              className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          )}
          <Bell className="w-6 h-6" />
        </div>
      </div>

      {/* Greeting */}
      <div className="px-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Good Morning!</h1>
        <p className="text-gray-600">Here's your activity overview</p>
      </div>

      {/* Dashboard Section */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statCards.map((card, index) => (
            <div key={index} className={`${card.bgColor} text-white p-4 rounded-lg shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs opacity-90">{card.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => onPageChange('share')}
            className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="bg-blue-100 p-3 rounded-full">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-800">Share</span>
          </button>

          <button
            onClick={() => onPageChange('connections')}
            className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="bg-green-100 p-3 rounded-full">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-800">Connections</span>
          </button>

          <button
            onClick={() => onPageChange('profile')}
            className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="bg-purple-100 p-3 rounded-full">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-800">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
} 