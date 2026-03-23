import { useState } from 'react';
import { Brain, Github } from 'lucide-react';

export function Footer({ onNavigate }) {
  const [modal, setModal] = useState(null); // 'faq' | 'privacy' | 'terms' | null

  return (
    <footer className="glass-card fixed inset-x-0 bottom-0 z-40 border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="hidden gap-6 md:grid md:grid-cols-3">
          {/* Brand */}
          <div>
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center cyber-glow animate-pulse-slow">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="gradient-text-animate">MockMate</span>
            </button>
            <p className="text-sm text-white/70">
              Practice interviews, get feedback, and land your next role faster.
            </p>
            <p className="text-sm text-white/60 mt-2">Built for job seekers in India 🇮🇳</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <button className="text-left text-white/70 hover:text-cyan-400" onClick={() => onNavigate('home')}>
                Home
              </button>
              <button className="text-left text-white/70 hover:text-cyan-400" onClick={() => onNavigate('ai-interview')}>
                AI Interview
              </button>
              <button className="text-left text-white/70 hover:text-cyan-400" onClick={() => onNavigate('jobs')}>
                Job Portal
              </button>
              <button className="text-left text-white/70 hover:text-cyan-400" onClick={() => onNavigate('volunteer-interview')}>
                Volunteer
              </button>
              <button className="text-left text-white/70 hover:text-cyan-400" onClick={() => onNavigate('dashboard')}>
                Dashboard
              </button>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white mb-3">Resources</h4>
            <div className="flex flex-col gap-2 text-sm">
              <button type="button" onClick={() => setModal('faq')} className="text-left text-white/50 hover:text-white transition-colors">
                FAQ
              </button>
              <button type="button" onClick={() => setModal('privacy')} className="text-left text-white/50 hover:text-white transition-colors">
                Privacy Policy
              </button>
              <button type="button" onClick={() => setModal('terms')} className="text-left text-white/50 hover:text-white transition-colors">
                Terms of Service
              </button>
              <a href="https://github.com/SagarGautam07/MockMate" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors inline-flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub ↗
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-3 flex flex-col gap-2 border-t border-cyan-500/10 pt-3 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 MockMate. All rights reserved.</span>
          <span>Built with ❤️ by Sagar Kumar Gautam</span>
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">
                {modal === 'faq' ? 'Frequently Asked Questions' : modal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              <button type="button" onClick={() => setModal(null)} className="text-white/40 hover:text-white transition-colors text-xl">✕</button>
            </div>

            {modal === 'faq' && (
              <div className="space-y-5 text-white/70 text-sm leading-relaxed">
                {[
                  ['What is MockMate?', 'MockMate is an AI-powered mock interview platform that helps candidates prepare for technical, behavioral, and HR interviews through practice sessions with real-time AI feedback.'],
                  ['How do coins work?', 'You earn 5 coins for each completed interview session. Coins can be used to book sessions with volunteer mentors or unlock premium features in the Coin Store.'],
                  ['Is my data private?', 'Yes. Your interview recordings and answers are only used to generate your personalised feedback. We do not share your data with third parties.'],
                  ['Can I practice for free?', 'Yes. All AI interview sessions are completely free. Coins are used only for volunteer mentoring sessions and premium features.'],
                  ['How do I become a volunteer?', 'Go to the Volunteer Interviews page and click "Become a Volunteer". Fill in your details and you will be approved within 24 hours.'],
                ].map(([q, a]) => (
                  <div key={q} className="border-b border-white/10 pb-4">
                    <h3 className="text-white font-semibold mb-1.5">{q}</h3>
                    <p>{a}</p>
                  </div>
                ))}
              </div>
            )}

            {modal === 'privacy' && (
              <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                <p><strong className="text-white">Last updated:</strong> March 2026</p>
                <p>MockMate (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates this platform. This privacy policy explains how we collect, use, and protect your information.</p>
                <h3 className="text-white font-semibold">Information We Collect</h3>
                <p>We collect your name, email address, and profile information when you sign in with Google. We also collect interview session data including your answers and the AI-generated feedback.</p>
                <h3 className="text-white font-semibold">How We Use Your Information</h3>
                <p>Your information is used to provide the MockMate service, personalise your experience, and improve our AI models. We do not sell your personal information.</p>
                <h3 className="text-white font-semibold">Contact</h3>
                <p>For privacy concerns, contact us at: support@mockmate.app</p>
              </div>
            )}

            {modal === 'terms' && (
              <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                <p><strong className="text-white">Last updated:</strong> March 2026</p>
                <p>By using MockMate you agree to these terms. MockMate is provided for educational and career preparation purposes.</p>
                <h3 className="text-white font-semibold">Acceptable Use</h3>
                <p>You may use MockMate for personal interview preparation. You may not misuse the platform, attempt to reverse-engineer our AI systems, or use the service for commercial purposes without permission.</p>
                <h3 className="text-white font-semibold">Coins and Purchases</h3>
                <p>Coins are virtual currency with no real monetary value. They cannot be transferred, sold, or exchanged for cash. Unused coins expire if your account is inactive for 12 months.</p>
                <h3 className="text-white font-semibold">Limitation of Liability</h3>
                <p>MockMate is provided &quot;as is&quot;. We do not guarantee employment outcomes from using the platform.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
