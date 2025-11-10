// Coin Store component - allows users to purchase premium features and courses using coins
// Displays available items, handles purchases, and shows coin balance

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, Sparkles, Zap, Star, TrendingUp, Crown, Rocket } from 'lucide-react';

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

export function CoinStore({ onNavigate, userCoins, onPurchase }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Handle item purchase and deduct coins
  const handlePurchase = (item) => {
    if (userCoins >= item.price) {
      onPurchase(item.price);
      setPurchaseSuccess(true);
      // Close success message after 2 seconds
      setTimeout(() => {
        setPurchaseSuccess(false);
        setSelectedItem(null);
      }, 2000);
    }
  };

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
                className="p-6 glass-card hover:cyber-glow transition-all cursor-pointer group relative overflow-hidden border-white/20"
                onClick={() => setSelectedItem(item)}
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
                    <Button
                      size="sm"
                      className={`bg-gradient-to-r ${getTypeColor(item.type)} hover:opacity-90 text-white border-0`}
                      disabled={userCoins < item.price}
                    >
                      {userCoins < item.price ? 'Not Enough Coins' : 'Get Now'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Purchase confirmation modal */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="glass-card border-white/20 text-white">
            {selectedItem && !purchaseSuccess && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-white">{selectedItem.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{selectedItem.icon}</div>
                    <p className="text-white/70">{selectedItem.description}</p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="mb-3 text-white">What's included:</h4>
                    <ul className="space-y-2">
                      {selectedItem.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-white/80">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg">
                    <div>
                      <div className="text-sm text-white/70">Price</div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">🪙</span>
                        <span className="text-2xl text-white font-semibold">{selectedItem.price}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-white/70">Your Balance</div>
                      <div className="text-2xl text-white font-semibold">{userCoins}</div>
                    </div>
                  </div>

                  {userCoins < selectedItem.price ? (
                    <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-lg text-center">
                      <p className="text-white">
                        You need {selectedItem.price - userCoins} more coins to purchase this item
                      </p>
                      <Button
                        onClick={() => onNavigate('ai-interview')}
                        variant="outline"
                        className="mt-3 border-white/20 text-white hover:bg-white/10"
                      >
                        Complete AI Interview to Earn Coins
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(selectedItem)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      size="lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Purchase Now
                    </Button>
                  )}
                </div>
              </>
            )}

            {purchaseSuccess && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                  <Star className="w-10 h-10 text-green-400 fill-green-400" />
                </div>
                <h3 className="mb-2 text-white">Purchase Successful! 🎉</h3>
                <p className="text-white/70">
                  Your item has been activated and is ready to use
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

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