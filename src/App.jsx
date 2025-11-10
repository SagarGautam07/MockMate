// Main App component for MockMate - manages routing, state, and navigation
// Handles user coins, interview history, and page navigation throughout the application

import { useState } from "react";
import { Home } from "./components/Home";
import { AIInterview } from "./components/AIInterview";
import { VolunteerInterview } from "./components/VolunteerInterview";
import { JobPortal } from "./components/JobPortal";
import { UserDashboard } from "./components/UserDashboard";
import { CoinStore } from "./components/CoinStore";
import {
  Briefcase,
  Bot,
  Users,
  Home as HomeIcon,
  User,
  Store,
} from "lucide-react";

export default function App() {
  // Application state management
  const [currentPage, setCurrentPage] = useState("home");
  const [userCoins, setUserCoins] = useState(150);
  const [interviewHistory, setInterviewHistory] = useState([]);

  // Add completed interview to history
  const addInterviewToHistory = (interview) => {
    setInterviewHistory([interview, ...interviewHistory]);
  };

  // Award coins to user (e.g., after completing interviews)
  const addCoins = (amount) => {
    setUserCoins((prev) => prev + amount);
  };

  // Deduct coins when user makes purchases
  const spendCoins = (amount) => {
    setUserCoins((prev) => Math.max(0, prev - amount));
  };

  // Route to appropriate page component based on current page state
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={setCurrentPage} />;
      case "ai-interview":
        return (
          <AIInterview
            onNavigate={setCurrentPage}
            onComplete={addInterviewToHistory}
            onCoinsEarned={addCoins}
          />
        );
      case "volunteer-interview":
        return (
          <VolunteerInterview
            onNavigate={setCurrentPage}
            onComplete={addInterviewToHistory}
            userCoins={userCoins}
            onSpendCoins={spendCoins}
            onCoinsEarned={addCoins}
          />
        );
      case "jobs":
        return (
          <JobPortal
            onNavigate={setCurrentPage}
            userCoins={userCoins}
            onSpendCoins={spendCoins}
          />
        );
      case "dashboard":
        return (
          <UserDashboard
            onNavigate={setCurrentPage}
            userCoins={userCoins}
            interviewHistory={interviewHistory}
            onCoinsEarned={addCoins}
          />
        );
      case "store":
        return (
          <CoinStore
            onNavigate={setCurrentPage}
            userCoins={userCoins}
            onPurchase={spendCoins}
          />
        );
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="size-full flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Top navigation bar - hidden on home page */}
      {currentPage !== "home" && (
        <nav className="glass-card border-b border-cyan-500/20 sticky top-0 z-50 scan-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center cyber-glow animate-pulse-slow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="gradient-text-animate">
                  MockMate
                </span>
              </div>

              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage("home")}
                  className={`px-4 py-2 rounded-lg transition-all relative group ${
                    currentPage === "home"
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 neon-border-cyan"
                      : "text-white/70 hover:text-cyan-400 hover:bg-white/5"
                  }`}
                >
                  <HomeIcon className="w-4 h-4 inline mr-2" />
                  Home
                  {currentPage === "home" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600"></span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentPage("ai-interview")}
                  className={`px-4 py-2 rounded-lg transition-all relative ${
                    currentPage === "ai-interview"
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 neon-border-cyan"
                      : "text-white/70 hover:text-cyan-400 hover:bg-white/5"
                  }`}
                >
                  <Bot className="w-4 h-4 inline mr-2" />
                  AI Practice
                  {currentPage === "ai-interview" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600"></span>
                  )}
                </button>
                <button
                  onClick={() =>
                    setCurrentPage("volunteer-interview")
                  }
                  className={`px-4 py-2 rounded-lg transition-all relative ${
                    currentPage === "volunteer-interview"
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 neon-border-cyan"
                      : "text-white/70 hover:text-cyan-400 hover:bg-white/5"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Volunteer Mock
                  {currentPage === "volunteer-interview" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600"></span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentPage("jobs")}
                  className={`px-4 py-2 rounded-lg transition-all relative ${
                    currentPage === "jobs"
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 neon-border-cyan"
                      : "text-white/70 hover:text-cyan-400 hover:bg-white/5"
                  }`}
                >
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Jobs
                  {currentPage === "jobs" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600"></span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className={`px-4 py-2 rounded-lg transition-all relative ${
                    currentPage === "dashboard"
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 neon-border-cyan"
                      : "text-white/70 hover:text-cyan-400 hover:bg-white/5"
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Dashboard
                  {currentPage === "dashboard" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600"></span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage("store")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full transition-all hover:scale-105 cursor-pointer cyber-glow neon-border"
                >
                  <span className="text-white">🪙</span>
                  <span className="font-semibold text-white">
                    {userCoins}
                  </span>
                  <Store className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile-friendly bottom navigation */}
          <div className="md:hidden border-t border-cyan-500/20">
            <div className="flex justify-around py-2">
              <button
                onClick={() => setCurrentPage("home")}
                className={`p-2 transition-colors ${currentPage === "home" ? "text-cyan-400" : "text-white/60"}`}
              >
                <HomeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage("ai-interview")}
                className={`p-2 transition-colors ${currentPage === "ai-interview" ? "text-cyan-400" : "text-white/60"}`}
              >
                <Bot className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage("volunteer-interview")
                }
                className={`p-2 transition-colors ${currentPage === "volunteer-interview" ? "text-cyan-400" : "text-white/60"}`}
              >
                <Users className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage("jobs")}
                className={`p-2 transition-colors ${currentPage === "jobs" ? "text-cyan-400" : "text-white/60"}`}
              >
                <Briefcase className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage("dashboard")}
                className={`p-2 transition-colors ${currentPage === "dashboard" ? "text-cyan-400" : "text-white/60"}`}
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

