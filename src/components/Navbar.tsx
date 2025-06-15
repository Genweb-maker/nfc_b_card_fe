'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from './Toast';
import { LayoutDashboard, User, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: 'dashboard' | 'profile' | 'share' | 'connections') => void;
}

export default function Navbar({ currentPage, onPageChange }: NavbarProps) {
  const { logout } = useAuth();

  const handleQRScan = () => {
    // Handle QR scan functionality
    onPageChange('share');
  };

  const handleSettings = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      isImageIcon: false
    },
    { 
      id: 'connections', 
      label: 'Connection', 
      icon: '/icons/share.png',
      isImageIcon: true
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      isImageIcon: false
    },
    { 
      id: 'settings', 
      label: 'Logout', 
      icon: LogOut,
      isImageIcon: false,
      onClick: handleSettings
    },
  ];

  return (
    <>
      {/* QR Scan Button - Overlapping the bottom navbar */}
      <button
        onClick={handleQRScan}
        className="fixed bottom-12  left-1/2 transform -translate-x-1/4 w-16 h-16 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all duration-200 hover:scale-105 z-[60]"
      >
        <img src="/icons/scan.png" alt="QR Scan" className="w-6 h-6" />
      </button>

      {/* Bottom Navigation */}
      <nav className="bottom-navbar rounded-t-3xl">
        <div className="flex items-center justify-around py-3 px-4">
          {navItems.map((item) => {
            return (
              <button
                key={item.id}
                onClick={item.onClick ? item.onClick : () => onPageChange(item.id as any)}
                className={`bottom-nav-item ${currentPage === item.id ? 'active' : ''}`}
              >
                {item.isImageIcon ? (
                  <img src={item.icon as string} alt={item.label} className="w-5 h-5 mb-1" />
                ) : (
                  (() => {
                    const IconComponent = item.icon as React.ComponentType<{className: string}>;
                    return <IconComponent className="w-5 h-5 mb-1" />;
                  })()
                )}
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
} 