import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { DashboardPage } from '@/pages/DashboardPage';
import { LiveDetectionPage } from '@/pages/LiveDetectionPage';
import { UploadDetectionPage } from '@/pages/UploadDetectionPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { getAuthUser, logout, type AuthUser } from '@/services/auth';
import type { PageId } from '@/types';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  // Check existing auth on mount
  useEffect(() => {
    const existing = getAuthUser();
    setUser(existing);
    setAuthReady(true);
  }, []);

  const handleLogin = (u: AuthUser) => {
    setUser(u);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // Don't render anything until we've checked localStorage
  if (!authReady) {
    return <div className="min-h-screen bg-ink-50" />;
  }

  // Not authenticated → show login page
  if (!user) {
    return <LoginPage onSuccess={handleLogin} />;
  }

  // Authenticated → show main app
  return (
    <div className="min-h-screen flex bg-ink-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <TopHeader
          user={user}
          onLogout={handleLogout}
          onNavigateSettings={() => setCurrentPage('settings')}
        />
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
          {currentPage === 'live' && <LiveDetectionPage />}
          {currentPage === 'upload' && <UploadDetectionPage />}
          {currentPage === 'history' && <HistoryPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

export default App;
