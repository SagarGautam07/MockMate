import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Calendar,
  Award,
  Briefcase,
  Bot,
  Users,
  Star,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { userAPI, interviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

export function UserDashboard({ onNavigate, userCoins }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [me, setMe] = useState(null);
  const [history, setHistory] = useState([]);

  const [profileDraft, setProfileDraft] = useState({
    targetRole: '',
    experience: 'Fresher',
    skills: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);

  function getUserFriendlyMessage(err) {
    if (err?.code === 'auth/popup-closed-by-user') return null;
    const msg = String(err?.message || '');
    if (msg.toLowerCase().includes('network')) return 'Network error. Check your connection.';
    if (err?.response?.status === 401) return 'Session expired. Please sign in again.';
    if (err?.response?.status === 429) return 'Too many requests. Please wait a moment.';
    return 'Something went wrong. Please try again.';
  }

  const fetchAll = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [meData, hist] = await Promise.all([userAPI.getMe(), interviewAPI.getHistory()]);
      setMe(meData);
      setHistory(hist.sessions || []);
      setProfileDraft({
        targetRole: meData?.profile?.targetRole || '',
        experience: meData?.profile?.experience || 'Fresher',
        skills: (meData?.profile?.skills || []).join(', '),
        bio: meData?.profile?.bio || '',
      });
    } catch (err) {
      console.error('[UserDashboard]', err);
      const msg = getUserFriendlyMessage(err);
      if (msg) toast.error(msg);
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  const stats = useMemo(() => {
    const s = me?.stats || {};
    return {
      totalSessions: s.totalSessions ?? 0,
      avgScore: s.avgScore ?? 0,
      streak: s.streak ?? 0,
      lastActiveDate: s.lastActiveDate ?? null,
      skillScores: s.skillScores || { technical: 0, behavioral: 0, communication: 0, problemSolving: 0 },
    };
  }, [me]);

  const achievements = useMemo(() => {
    const highScore = history.some((h) => (h.overallScore || 0) >= 90);
    return [
      { icon: '🎯', title: 'First Session', description: 'Complete your first interview', unlocked: stats.totalSessions >= 1 },
      { icon: '🔥', title: '5 Day Streak', description: 'Practice 5 days in a row', unlocked: stats.streak >= 5 },
      { icon: '⭐', title: 'High Scorer', description: 'Score 90+ in an interview', unlocked: highScore },
      { icon: '🏆', title: 'Consistent', description: 'Complete 10 sessions', unlocked: stats.totalSessions >= 10 },
    ];
  }, [history, stats.totalSessions, stats.streak]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const skillsArr = profileDraft.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await userAPI.updateProfile({
        profile: {
          targetRole: profileDraft.targetRole,
          experience: profileDraft.experience,
          skills: skillsArr,
          bio: profileDraft.bio,
        },
      });
      toast.success('Profile updated!');
      await fetchAll();
    } catch (err) {
      console.error('[UserDashboard]', err);
      const msg = getUserFriendlyMessage(err);
      if (msg) toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 particle-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="mb-6 text-white hover:text-cyan-400 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {!user && (
          <Card className="p-8 glass-card neon-border text-center">
            <h3 className="text-white mb-2">Sign in to view your dashboard</h3>
            <p className="text-white/60 mb-6">Your stats and interview history will appear here after login.</p>
            <Button
              onClick={() => onNavigate('home')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
            >
              Go to Home
            </Button>
          </Card>
        )}

        {error && (
          <div className="mb-6 glass-card neon-border border-red-500/40 bg-red-500/10 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-white/90 text-sm">{error}</p>
                <Button onClick={fetchAll} variant="outline" className="mt-3 border-red-400/30 text-white hover:bg-white/10">
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {user && (
          <>
            <Card className="p-8 mb-8 glass-card neon-border cyber-glow">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 blur-xl opacity-60 animate-pulse-slow" />
                  <Avatar className="w-24 h-24 border-2 border-cyan-500/50 relative">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-2xl">
                      {(me?.name || user.displayName || user.email || 'U')
                        .split(' ')
                        .map((x) => x[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1">
                  <h2 className="mb-2 text-white">{me?.name || user.displayName || 'MockMate User'}</h2>
                  <p className="text-cyan-400 mb-4">{me?.profile?.targetRole || 'Software Engineer'}</p>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 glass-card neon-border-cyan rounded-lg">
                      <span className="text-amber-400 animate-float">🪙</span>
                      <span className="font-semibold text-white">{userCoins} Coins</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg border border-cyan-500/30">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-white">{stats.totalSessions} Sessions</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg border border-purple-500/30">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white">{history.length} Completed</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => onNavigate('ai-interview')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Practice Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onNavigate('jobs')}
                    className="border-cyan-500/30 text-white hover:bg-white/10"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-8 h-8 text-amber-400 animate-float" />
                  <Badge className="bg-green-500/20 text-green-400 border-0">Live</Badge>
                </div>
                <div className="text-2xl mb-1 gradient-text-animate">
                  {loading ? <div className="h-7 w-16 bg-white/10 rounded animate-pulse" /> : Math.round(stats.avgScore)}
                </div>
                <div className="text-sm text-white/60">Avg Score</div>
                <Progress value={stats.avgScore} className="mt-2 h-2 bg-white/10" />
              </Card>

              <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 text-cyan-400 animate-pulse-slow" />
                </div>
                <div className="text-2xl mb-1 text-cyan-400">
                  {loading ? <div className="h-7 w-12 bg-white/10 rounded animate-pulse" /> : stats.totalSessions}
                </div>
                <div className="text-sm text-white/60">Total Sessions</div>
                <p className="text-xs text-white/40 mt-2">
                  {stats.lastActiveDate ? `Last: ${new Date(stats.lastActiveDate).toLocaleDateString()}` : 'Last: —'}
                </p>
              </Card>

              <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-400 animate-pulse-slow" />
                </div>
                <div className="text-2xl mb-1 text-green-400">
                  {loading ? <div className="h-7 w-10 bg-white/10 rounded animate-pulse" /> : stats.streak}
                </div>
                <div className="text-sm text-white/60">Day Streak</div>
                <p className="text-xs text-white/40 mt-2">Keep it up! 🔥</p>
              </Card>

              <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-purple-400 animate-float" />
                </div>
                <div className="text-2xl mb-1">
                  {loading ? (
                    <div className="h-7 w-16 bg-white/10 rounded animate-pulse" />
                  ) : (
                    `${achievements.filter((a) => a.unlocked).length}/${achievements.length}`
                  )}
                </div>
                <div className="text-sm text-white/60">Achievements</div>
                <p className="text-xs text-white/40 mt-2">Unlock more by practicing</p>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="p-6 glass-card neon-border">
                    <h3 className="mb-6 text-white">Skill Progress</h3>
                    <div className="space-y-6">
                      {[
                        ['Technical Skills', stats.skillScores.technical],
                        ['Behavioral', stats.skillScores.behavioral],
                        ['Communication', stats.skillScores.communication],
                        ['Problem Solving', stats.skillScores.problemSolving],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/80">{label}</span>
                            <span className="text-sm text-white/50">{value}%</span>
                          </div>
                          <Progress value={value} />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 glass-card neon-border">
                    <h3 className="mb-6 text-white">Profile</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block mb-2 text-white">Target Role</label>
                        <Input
                          value={profileDraft.targetRole}
                          onChange={(e) => setProfileDraft((p) => ({ ...p, targetRole: e.target.value }))}
                          className="bg-white/5 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-white">Experience</label>
                        <Select
                          value={profileDraft.experience}
                          onValueChange={(v) => setProfileDraft((p) => ({ ...p, experience: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fresher">Fresher</SelectItem>
                            <SelectItem value="1-2 years">1-2 years</SelectItem>
                            <SelectItem value="3-5 years">3-5 years</SelectItem>
                            <SelectItem value="5+ years">5+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block mb-2 text-white">Skills (comma separated)</label>
                        <Input
                          value={profileDraft.skills}
                          onChange={(e) => setProfileDraft((p) => ({ ...p, skills: e.target.value }))}
                          placeholder="React, Node.js, MongoDB"
                          className="bg-white/5 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-white">Bio</label>
                        <Textarea
                          value={profileDraft.bio}
                          onChange={(e) => setProfileDraft((p) => ({ ...p, bio: e.target.value }))}
                          className="min-h-[120px] bg-white/5 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-500"
                        />
                      </div>
                      <Button
                        onClick={saveProfile}
                        disabled={saving}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Profile
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <Card className="p-6 glass-card neon-border">
                  <h3 className="mb-6 text-white">Interview History</h3>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white/5 rounded-xl h-16" />
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <h4 className="mb-2 text-white">No Interview History</h4>
                      <p className="text-white/60 mb-6">Start practicing to build your interview history.</p>
                      <Button onClick={() => onNavigate('ai-interview')}>Start First Interview</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-start gap-4 p-4 glass-card rounded-lg border border-white/10"
                        >
                          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-6 h-6 text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-white">
                                  {item.type} • {item.difficulty}
                                </h4>
                                <p className="text-sm text-white/60">{item.role || 'Software Engineer'}</p>
                              </div>
                              {item.overallScore != null && (
                                <Badge
                                  className={`${
                                    item.overallScore >= 80 ? 'bg-green-500' : 'bg-amber-500'
                                  } text-white border-0`}
                                >
                                  {item.overallScore}/100
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                +{item.coinsEarned ?? 0} coins
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="achievements">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((a, idx) => (
                    <Card key={idx} className={`p-6 ${a.unlocked ? '' : 'opacity-50'} glass-card neon-border`}>
                      <div className="text-4xl mb-3">{a.icon}</div>
                      <h4 className="mb-2 text-white">{a.title}</h4>
                      <p className="text-sm text-white/60 mb-3">{a.description}</p>
                      {a.unlocked ? (
                        <Badge className="bg-green-500 text-white border-0">Unlocked</Badge>
                      ) : (
                        <Badge variant="outline" className="border-white/20 text-white/70">
                          Locked
                        </Badge>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

