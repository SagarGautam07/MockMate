// Home page component for MockMate - landing page with features overview and navigation
// Displays platform introduction, feature cards, stats, and call-to-action sections

import { Button } from './ui/button';
import { Card } from './ui/card';
import { Bot, Briefcase, Zap, Award, TrendingUp, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Home({ onNavigate }) {
  const { user, signInWithGoogle } = useAuth();

  // Handle button click - if not logged in, show Google auth, otherwise navigate
  const handleButtonClick = async (page) => {
    if (!user) {
      try {
        await signInWithGoogle();
        // After successful login, navigate to the requested page
        onNavigate(page);
      } catch (error) {
        console.error('Failed to sign in:', error);
        // You can add a toast notification here if needed
      }
    } else {
      // User is already logged in, navigate directly
      onNavigate(page);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background visual effects for cyberpunk aesthetic */}
      <div className="absolute inset-0 particle-bg"></div>
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-600/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
      
      {/* Hero section with main CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-6 animate-float">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white">AI-Powered Interview Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse-slow">
            Master Your Interview Skills with MockMate
          </h1>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Practice with AI, get real feedback from mentors, and land your dream job.
            A complete ecosystem for interview preparation and job hunting.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => handleButtonClick('ai-interview')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
            >
              <Bot className="w-5 h-5 mr-2" />
              Start AI Practice
            </Button>
            <Button 
              size="lg" 
              onClick={() => handleButtonClick('volunteer-interview')}
              className="glass-card border-cyan-500/50 text-white hover:bg-white/20"
            >
              <Users className="w-5 h-5 mr-2" />
              Book Mock Interview
            </Button>
          </div>
          
          {/* Show user info if logged in */}
          {user && (
            <div className="mt-4 text-center">
              <p className="text-white/60 text-sm">
                Welcome, {user.displayName || user.email}!
              </p>
            </div>
          )}
        </div>

        {/* Feature cards showcasing platform capabilities */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all cursor-pointer group" onClick={() => handleButtonClick('ai-interview')}>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-white">AI Interview Mode</h3>
            <p className="text-white/70 mb-4">
              Practice with our advanced AI interviewer. Get instant, personalized feedback on your responses.
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">✓</span>
                <span>Instant AI-powered feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">✓</span>
                <span>Multiple interview types</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">✓</span>
                <span>Earn +5 coins per session</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all cursor-pointer group" onClick={() => handleButtonClick('volunteer-interview')}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-white">Volunteer Mock Interviews</h3>
            <p className="text-white/70 mb-4">
              Schedule realistic interviews with industry professionals. Earn coins by volunteering!
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Real human interaction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Detailed professional feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Earn up to 50 coins/session</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all cursor-pointer group" onClick={() => handleButtonClick('jobs')}>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-white">Job Portal</h3>
            <p className="text-white/70 mb-4">
              After practicing, apply directly to curated job listings. Your preparation pays off!
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Curated job opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Boost profile with coins</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Track your applications</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Platform statistics display */}
        <div className="glass-card neon-border rounded-2xl p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-2 text-cyan-400">10K+</div>
              <div className="text-sm text-white/60">Practice Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2 text-purple-400">5K+</div>
              <div className="text-sm text-white/60">Mock Interviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2 text-green-400">2K+</div>
              <div className="text-sm text-white/60">Jobs Posted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2 text-pink-400">85%</div>
              <div className="text-sm text-white/60">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Step-by-step process explanation */}
        <div className="text-center mb-12">
          <h2 className="mb-12 text-white">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 cyber-glow">
                1
              </div>
              <h4 className="mb-2 text-white">Practice with AI</h4>
              <p className="text-sm text-white/60">
                Start with unlimited AI interview sessions to build confidence
              </p>
              <ArrowRight className="hidden md:block absolute top-6 -right-8 w-6 h-6 text-cyan-400" />
            </div>

            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 cyber-glow">
                2
              </div>
              <h4 className="mb-2 text-white">Mock Interview</h4>
              <p className="text-sm text-white/60">
                Book sessions with real professionals for genuine feedback
              </p>
              <ArrowRight className="hidden md:block absolute top-6 -right-8 w-6 h-6 text-purple-400" />
            </div>

            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 cyber-glow">
                3
              </div>
              <h4 className="mb-2 text-white">Improve Skills</h4>
              <p className="text-sm text-white/60">
                Review feedback and track your progress over time
              </p>
              <ArrowRight className="hidden md:block absolute top-6 -right-8 w-6 h-6 text-green-400" />
            </div>

            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 cyber-glow">
                4
              </div>
              <h4 className="mb-2 text-white">Apply for Jobs</h4>
              <p className="text-sm text-white/60">
                Confidently apply to your dream jobs on our platform
              </p>
            </div>
          </div>
        </div>

        {/* Final call-to-action section */}
        <div className="glass-card neon-border rounded-2xl p-8 md:p-12 text-center cyber-glow">
          <Award className="w-16 h-16 mx-auto mb-4 text-amber-400 animate-float" />
          <h2 className="mb-4 text-white">Ready to Ace Your Next Interview?</h2>
          <p className="text-lg mb-6 text-white/80 max-w-2xl mx-auto">
            Join thousands of successful candidates who prepared with MockMate
          </p>
          <Button 
            size="lg" 
            onClick={() => handleButtonClick('dashboard')}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 border-0 text-white"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}
