import { useEffect, useState } from 'react';
import { Home } from './components/Home';
import { AIInterview } from './components/AIInterview';
import { VolunteerInterview } from './components/VolunteerInterview';
import VolunteerLiveInterview from './components/VolunteerLiveInterview';
import { JobPortal } from './components/JobPortal';
import { UserDashboard } from './components/UserDashboard';
import { CoinStore } from './components/CoinStore';
import { AdminPanel } from './components/AdminPanel';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import API_URL from './config';
import { useAuth } from './contexts/AuthContext';
import { userAPI } from './services/api';

// Map page keys to URL-friendly paths
const PAGE_ROUTES = {
  home: '/',
  'ai-interview': '/ai-interview',
  jobs: '/jobs',
  dashboard: '/dashboard',
  'volunteer-interview': '/volunteer',
  'volunteer-meeting': '/volunteer/meeting',
  'coin-store': '/coins',
  admin: '/admin',
};

const ROUTE_TO_PAGE = {
  '/': 'home',
  '/ai-interview': 'ai-interview',
  '/jobs': 'jobs',
  '/job-portal': 'jobs',
  '/dashboard': 'dashboard',
  '/volunteer': 'volunteer-interview',
  '/volunteer-interview': 'volunteer-interview',
  '/volunteer/meeting': 'volunteer-meeting',
  '/coins': 'coin-store',
  '/coin-store': 'coin-store',
  '/admin': 'admin',
};

const VALID_PAGES = Object.keys(PAGE_ROUTES);
const PROTECTED_PAGES = ['dashboard', 'ai-interview', 'coin-store'];

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userCoins, setUserCoins] = useState(150);
  const [userRole, setUserRole] = useState('candidate');
  const [backendOnline, setBackendOnline] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const { user, signInWithGoogle } = useAuth();

  // Award coins to user (e.g., after completing interviews)
  const addCoins = (amount) => {
    setUserCoins((prev) => prev + amount);
  };

  // Deduct coins when user makes purchases
  const spendCoins = (amount) => {
    setUserCoins((prev) => Math.max(0, prev - amount));
  };

  const navigate = (page) => {
    const target = VALID_PAGES.includes(page) ? page : 'home';
    setCurrentPage(target);
    setPageLoading(true);
    setTimeout(() => setPageLoading(false), 200);
    const path = PAGE_ROUTES[target] || '/';
    window.history.pushState({ page: target }, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // On mount: read current URL and navigate to matching page
  useEffect(() => {
    const path = window.location.pathname;
    const page = ROUTE_TO_PAGE[path];
    setCurrentPage(page !== undefined ? page : '404');
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      const page = ROUTE_TO_PAGE[path];
      setCurrentPage(page !== undefined ? page : '404');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Load user coins from backend when authenticated
  useEffect(() => {
    if (user) {
      userAPI
        .getMe()
        .then((data) => {
          setUserCoins(data?.coins ?? 150);
          setUserRole(data?.role || 'candidate');
        })
        .catch(() => {});
    } else {
      setUserRole('candidate');
      setUserCoins(150);
    }
  }, [user]);

  // Backend health check on app startup (only when not in mock mode)
  useEffect(() => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') return;

    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then(() => {
        console.log('✅ Backend connected');
        setBackendOnline(true);
      })
      .catch(() => {
        console.warn('⚠️ Backend not reachable. Running in demo mode.');
        setBackendOnline(false);
      });
  }, []);

  const renderAuthRequired = (title, subtitle = 'Please sign in to access this page.') => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 text-center p-8">
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-white/60 mb-8 max-w-md">
        {subtitle}
      </p>
      <button
        type="button"
        onClick={async () => {
          try {
            setAuthActionLoading(true);
            await signInWithGoogle();
          } catch (_) {
            navigate('home');
          } finally {
            setAuthActionLoading(false);
          }
        }}
        disabled={authActionLoading}
        className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        {authActionLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </div>
  );

  // Route to appropriate page component based on current page state
  const renderPage = () => {
    if (!user && PROTECTED_PAGES.includes(currentPage)) {
      if (currentPage === 'dashboard') return renderAuthRequired('Dashboard Locked');
      if (currentPage === 'coin-store') return renderAuthRequired('Coin Store Locked');
      return renderAuthRequired('AI Interview Locked');
    }
    if (currentPage === 'admin' && !user) {
      return renderAuthRequired('Admin Access', 'Please sign in with an admin account.');
    }
    if (currentPage === 'admin' && userRole !== 'admin') {
      return renderAuthRequired('Access Denied', 'This page is restricted to admin users only.');
    }

    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'ai-interview':
        return (
          <AIInterview
            onCoinsEarned={addCoins}
            onNavigate={navigate}
          />
        );
      case 'volunteer-interview':
        return (
          <VolunteerInterview
            userCoins={userCoins}
            onSpendCoins={spendCoins}
            onCoinsEarned={addCoins}
            onNavigate={navigate}
          />
        );
      case 'volunteer-meeting': {
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room') || '';
        const volunteer = params.get('volunteer') || 'Volunteer';

        return (
          <div className="px-4 py-6 md:px-6">
            <VolunteerLiveInterview
              open
              volunteerName={volunteer}
              currentUserName={user?.displayName || user?.email || 'You'}
              initialRoomId={room}
              onClose={() => navigate('volunteer-interview')}
            />
          </div>
        );
      }
      case 'jobs':
        return (
          <JobPortal
            onNavigate={navigate}
            userCoins={userCoins}
            onSpendCoins={spendCoins}
          />
        );
      case 'dashboard':
        return (
          <UserDashboard
            onNavigate={navigate}
            userCoins={userCoins}
            onCoinsEarned={addCoins}
          />
        );
      case 'coin-store':
        return (
          <CoinStore
            onNavigate={navigate}
            userCoins={userCoins}
            onPurchase={spendCoins}
          />
        );
      case 'admin':
        return <AdminPanel onNavigate={navigate} />;
      default:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center
                          bg-gradient-to-br from-slate-950 to-slate-900 text-center p-8">
            <div className="text-8xl font-black text-white/10 mb-4">404</div>
            <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
            <p className="text-white/60 mb-8 max-w-md">
              The page you are looking for does not exist or has been moved.
            </p>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold
                         px-6 py-3 rounded-xl transition-colors"
            >
              Go Home
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {!backendOnline && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-amber-500/40 bg-amber-500/20 px-4 py-1.5 text-center text-xs text-amber-300">
          ⚠️ Running in demo mode — backend not connected. Data shown is for demonstration only.
        </div>
      )}

      <Navbar currentPage={currentPage} onNavigate={navigate} userCoins={userCoins} user={user} userRole={userRole} />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto pt-16 ${currentPage === 'volunteer-meeting' ? 'pb-6' : 'pb-16'} ${!backendOnline ? 'pt-24' : ''}`}>
        {pageLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent
                            rounded-full animate-spin" />
          </div>
        ) : (
          renderPage()
        )}
      </main>

      {currentPage !== 'volunteer-meeting' && <Footer onNavigate={navigate} />}
    </div>
  );
}
