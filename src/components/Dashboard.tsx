'use client';

import { useState, useEffect } from 'react';
import { getConnectionStats } from '../lib/api';
import { showToast } from './Toast';
import { Users, Download, Smartphone, ScanLine, Bell, ChevronDown } from 'lucide-react';

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

  useEffect(() => {
    loadStats();
  }, []);

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
          <img src="/icons/Logomark.png" alt="NPC Business Card" className="w-6 h-6" />
          <span className="font-semibold text-lg">NPC Business Card</span>
        </div>
        <div className="text-gray-800">
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          <button className="flex items-center gap-1 text-gray-600 text-sm">
            Sort by
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className={`${stat.bgColor} rounded-2xl p-4 text-white`}>
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-sm text-white/80 mb-1">{stat.title}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 