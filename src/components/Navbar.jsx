import { useMemo, useState } from 'react';
import { Brain, Coins, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

export function Navbar({ currentPage, onNavigate, user: userProp, userCoins, userRole = 'candidate' }) {
  const { user: authUser, logOut, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const user = userProp ?? authUser;
  const [open, setOpen] = useState(false);

  const links = useMemo(() => {
    const base = [
      { key: 'home', label: 'Home' },
      { key: 'ai-interview', label: 'AI Interview' },
      { key: 'jobs', label: 'Job Portal' },
      { key: 'volunteer-interview', label: 'Volunteer' },
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'coin-store', label: 'Coins' },
    ];
    if (userRole === 'admin') base.push({ key: 'admin', label: 'Admin' });
    return base;
  }, [userRole]);

  const go = (key) => {
    onNavigate(key);
    setOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success('Signed out successfully');
    } catch (err) {
      const msg = err?.message || 'Failed to sign out';
      toast.error(msg);
    } finally {
      go('home');
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Signed in successfully');
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') return;
      toast.error(err?.message || 'Failed to sign in');
    }
  };

  return (
    <nav className="glass-card fixed inset-x-0 top-0 z-50 border-b border-cyan-500/20 scan-line backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Brand */}
          <button onClick={() => go('home')} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center cyber-glow animate-pulse-slow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text-animate">MockMate</span>
          </button>

          {/* Center: Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = currentPage === l.key;
              return (
                <button
                  key={l.key}
                  onClick={() => go(l.key)}
                  className={`px-4 py-2 rounded-lg transition-all relative ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 neon-border-cyan'
                      : 'text-white/70 hover:text-cyan-400 hover:bg-white/5'
                  }`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: User / Coins / Mobile menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => go('coin-store')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full transition-all hover:scale-105 cursor-pointer cyber-glow neon-border"
              title="Coins"
            >
              <Coins className="w-4 h-4 text-white" />
              <span className="font-semibold text-white">{userCoins ?? 0}</span>
            </button>

            {user ? (
              <div className="relative group hidden sm:block">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-cyan-500/50" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold text-sm">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-white text-sm font-medium hidden md:block max-w-[120px] truncate">
                    {user.displayName?.split(' ')[0] || 'Profile'}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900/95 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 backdrop-blur-sm">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white text-sm font-medium truncate">{user.displayName || 'User'}</p>
                    <p className="text-white/40 text-xs truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <button type="button" onClick={() => { go('dashboard'); }} className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm transition-colors">
                      Dashboard
                    </button>
                    <button type="button" onClick={() => { go('coin-store'); }} className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm transition-colors">
                      Coin Store
                    </button>
                    {userRole === 'admin' && (
                      <button type="button" onClick={() => { go('admin'); }} className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm transition-colors">
                        Admin Panel
                      </button>
                    )}
                    <div className="border-t border-white/10 my-1" />
                    <button type="button" onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleSignIn}
                className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2 rounded-lg text-sm hidden sm:inline-flex"
              >
                Sign In
              </Button>
            )}

            <button
              className="md:hidden px-2 py-2 text-white/80 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden border-t border-cyan-500/20 py-3">
            <div className="flex flex-col gap-1">
              {links.map((l) => {
                const active = currentPage === l.key;
                return (
                  <button
                    key={l.key}
                    onClick={() => go(l.key)}
                    className={`text-left px-4 py-2 rounded-lg transition-all ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 neon-border-cyan'
                        : 'text-white/70 hover:text-cyan-400 hover:bg-white/5'
                    }`}
                  >
                    {l.label}
                  </button>
                );
              })}
              {!user && (
                <Button
                  onClick={handleSignIn}
                  className="mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
