// Coin Store component - allows users to purchase premium features and courses using coins
// Displays available items, handles purchases, and shows coin balance

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Sparkles, Zap, Star, TrendingUp, Crown, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { coinsAPI } from '../services/api';

// Available items in the coin store
const STORE_ITEMS = [
  {
    id: 'premium-course-1',
    title: 'Advanced System Design Mastery',
    description: 'Master system design with real-world scenarios and expert guidance',
    price: 200,
    icon: '🏗️',
    type: 'course',
    features: ['10+ hours of content', 'Real interview questions', 'Expert mentorship'],
  },
  {
    id: 'premium-course-2',
    title: 'Behavioral Interview Excellence',
    description: 'Perfect your STAR method and storytelling techniques',
    price: 150,
    icon: '🎯',
    type: 'course',
    features: ['8 hours of training', '50+ practice scenarios', 'Feedback templates'],
  },
  {
    id: 'premium-course-3',
    title: 'Coding Interview Bootcamp',
    description: 'Data structures, algorithms, and problem-solving strategies',
    price: 250,
    icon: '💻',
    type: 'course',
    features: ['15+ hours', '100+ problems', 'Live coding sessions'],
  },
  {
    id: 'advanced-mock',
    title: 'Advanced Mock Interview Package',
    description: '5 mock interviews with C-level executives',
    price: 300,
    icon: '👔',
    type: 'interview',
    features: ['5 premium sessions', 'Executive interviewers', 'Detailed reports'],
  },
  {
    id: 'profile-boost-7',
    title: 'Profile Boost - 7 Days',
    description: 'Highlight your profile on job portal for 7 days',
    price: 100,
    icon: '🚀',
    type: 'boost',
    features: ['7x visibility', 'Priority in searches', 'Featured badge'],
  },
  {
    id: 'profile-boost-30',
    title: 'Profile Boost - 30 Days',
    description: 'Maximum visibility for a full month',
    price: 350,
    icon: '⭐',
    type: 'boost',
    features: ['30x visibility', 'Premium placement', 'Analytics dashboard'],
  },
  {
    id: 'ai-unlimited',
    title: 'AI Interview Pro - Monthly',
    description: 'Unlimited AI interviews with advanced analytics',
    price: 180,
    icon: '🤖',
    type: 'subscription',
    features: ['Unlimited sessions', 'Advanced AI feedback', 'Priority support'],
  },
  {
    id: 'mentor-priority',
    title: 'Priority Mentor Access',
    description: 'Skip the queue and book top mentors instantly',
    price: 120,
    icon: '⚡',
    type: 'feature',
    features: ['Instant booking', 'Top 10 mentors', 'No waiting'],
  },
];

export function CoinStore({ onNavigate, userCoins: initialUserCoins, onPurchase }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCoins, setUserCoins] = useState(initialUserCoins ?? 0);
  const [purchasing, setPurchasing] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);
  const [purchased, setPurchased] = useState(new Set());
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    setUserCoins(initialUserCoins ?? 0);
  }, [initialUserCoins]);

  const loadHistory = async () => {
    if (!user) {
      setTransactions([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const data = await coinsAPI.getHistory();
      setTransactions(data?.transactions || []);
    } catch (_) {
      setTransactions([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  async function handlePurchase(item) {
    if (!user) { toast.error('Please sign in to purchase'); return; }
    if (userCoins < item.price) {
      toast.error(`Insufficient coins. You need ${item.price} but have ${userCoins}.`);
      return;
    }
    if (purchasing) return;

    setPurchasing(item.id);
    try {
      await coinsAPI.purchase({ itemId: item.id, cost: item.price });
      setUserCoins((prev) => prev - item.price);
      setPurchased((prev) => new Set([...prev, item.id]));
      setConfirmItem(null);
      onPurchase?.(item.price);
      toast.success(`${item.title} unlocked! ${item.price} coins deducted.`);
      loadHistory();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Purchase failed';
      toast.error(msg);
    } finally {
      setPurchasing(null);
    }
  }

  // Get gradient color classes based on item type
  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return 'from-blue-500 to-cyan-500';
      case 'interview': return 'from-purple-500 to-pink-500';
      case 'boost': return 'from-orange-500 to-red-500';
      case 'subscription': return 'from-green-500 to-emerald-500';
      case 'feature': return 'from-amber-500 to-yellow-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Get icon component based on item type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return Sparkles;
      case 'interview': return Star;
      case 'boost': return Rocket;
      case 'subscription': return Crown;
      case 'feature': return Zap;
      default: return Star;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => onNavigate('dashboard')}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-full mb-6 animate-float">
            <span className="text-4xl">🪙</span>
            <div className="text-left">
              <div className="text-sm text-white/70">Your Balance</div>
              <div className="text-2xl text-white font-semibold">{userCoins} Coins</div>
            </div>
          </div>
          
          <h1 className="text-5xl mb-4 text-white">Coin Store</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Unlock premium features, courses, and boost your career with coins
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORE_ITEMS.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            
            return (
              <Card
                key={item.id}
                className="p-6 glass-card hover:cyber-glow transition-all group relative overflow-hidden border-white/20"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getTypeColor(item.type)} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{item.icon}</div>
                    <Badge className={`bg-gradient-to-r ${getTypeColor(item.type)} text-white border-0`}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {item.type}
                    </Badge>
                  </div>

                  <h3 className="mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-white/70 mb-4">
                    {item.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {item.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                        <span className="text-green-400">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🪙</span>
                      <span className="text-2xl text-white font-semibold">{item.price}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => (purchased.has(item.id) ? null : setConfirmItem(item))}
                      disabled={purchased.has(item.id)}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        purchased.has(item.id)
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default'
                          : userCoins < item.price
                            ? 'bg-white/10 border border-white/20 text-white/40 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white'
                      }`}
                    >
                      {purchased.has(item.id) ? '✓ Unlocked'
                        : userCoins < item.price ? `Need ${item.price - userCoins} more coins`
                        : `Get Now (${item.price} coins)`}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 p-6 glass-card border-white/20">
          <h2 className="text-white text-xl mb-4">Purchase History</h2>
          {historyLoading ? (
            <p className="text-white/60 text-sm">Loading purchases...</p>
          ) : transactions.length === 0 ? (
            <p className="text-white/60 text-sm">No purchases yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 8).map((tx) => (
                <div
                  key={tx._id || `${tx.createdAt}-${tx.reason}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div>
                    <p className="text-white text-sm">{tx.reason || 'Purchase'}</p>
                    <p className="text-white/40 text-xs">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'Unknown date'}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'spend' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {tx.type === 'spend' ? '-' : '+'}
                    {tx.amount || 0} coins
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Purchase confirmation modal */}
        {confirmItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setConfirmItem(null)}
          >
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-white font-bold text-lg mb-2">Confirm Purchase</h3>
              <p className="text-white/60 text-sm mb-1">You are about to purchase:</p>
              <p className="text-cyan-400 font-semibold mb-4">{confirmItem.title}</p>
              <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 mb-5">
                <span className="text-white/70 text-sm">Cost</span>
                <span className="text-cyan-400 font-bold">{confirmItem.price} coins</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 mb-5">
                <span className="text-white/70 text-sm">Your balance after</span>
                <span className={`font-bold ${userCoins - confirmItem.price < 0 ? 'text-red-400' : 'text-white'}`}>
                  {userCoins - confirmItem.price} coins
                </span>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setConfirmItem(null)} className="flex-1 border border-white/20 text-white/70 hover:text-white hover:bg-white/5 font-medium py-2.5 rounded-xl text-sm transition-all">
                  Cancel
                </button>
                <button type="button" onClick={() => handlePurchase(confirmItem)} disabled={!!purchasing} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                  {purchasing ? 'Processing...' : `Confirm (${confirmItem.price} coins)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Information section on how to earn more coins */}
        <Card className="mt-12 p-8 glass-card border-white/20 text-center">
          <TrendingUp className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="mb-3 text-white">Need More Coins?</h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Complete AI interviews and rate your experiences to earn coins
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => onNavigate('ai-interview')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white border-0"
            >
              Complete AI Interview (+5 coins)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
