'use client';

import { useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import Dashboard from '../components/Dashboard';
import ProfilePage from '../components/ProfilePage';
import SharePage from '../components/SharePage';
import ConnectionsPage from '../components/ConnectionsPage';
import AuthPage from '../components/AuthPage';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

type Page = 'dashboard' | 'profile' | 'share' | 'connections';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEO
          title="Login - NFC Business Card"
          description="Sign in to your NFC Business Card account to manage your digital business cards and connections."
        />
        <AuthPage />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            <SEO
              title="Dashboard - NFC Business Card"
              description="Manage your digital business cards and view your networking statistics on your personal dashboard."
            />
            <Dashboard onPageChange={setCurrentPage} />
          </>
        );
      case 'profile':
        return (
          <>
            <SEO
              title="Profile - NFC Business Card"
              description="Edit and manage your digital business card profile information including contact details and professional information."
            />
            <ProfilePage />
          </>
        );
      case 'share':
        return (
          <>
            <SEO
              title="Share - NFC Business Card"
              description="Share your digital business card using NFC or QR codes for quick and easy networking."
            />
            <SharePage />
          </>
        );
      case 'connections':
        return (
          <>
            <SEO
              title="Connections - NFC Business Card"
              description="View and manage your business connections and contacts from your networking activities."
            />
            <ConnectionsPage />
          </>
        );
      default:
        return (
          <>
            <SEO />
            <Dashboard onPageChange={setCurrentPage} />
          </>
        );
    }
  };

  return (
    <>
      <main className="min-h-screen pb-20">
        {renderPage()}
      </main>
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <PWAInstallPrompt />
    </>
  );
}

export default function Home() {
  return (
    <>
      <SEO />
      <AuthProvider>
        <AppContent />
        <Toast />
      </AuthProvider>
    </>
  );
}
