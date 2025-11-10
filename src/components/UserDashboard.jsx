// User Dashboard component - displays user profile, stats, interview history, and achievements
// Provides overview of user progress and performance metrics

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, User, Trophy, TrendingUp, Calendar, Award, Briefcase, Bot, Users, Star, Clock } from 'lucide-react';

export function UserDashboard({ onNavigate, userCoins, interviewHistory, onCoinsEarned }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Note: onCoinsEarned prop is available but not used in this component

  // Filter interview history by type
  const aiInterviews = interviewHistory.filter(i => i.type === 'AI Interview');
  const volunteerInterviews = interviewHistory.filter(i => i.type === 'Volunteer Interview');
  
  // Calculate average score from AI interviews
  const avgScore = aiInterviews.length > 0
    ? aiInterviews.reduce((acc, curr) => acc + curr.score, 0) / aiInterviews.length
    : 0;

  const totalInterviews = interviewHistory.length;

  // Mock skill progress data (would come from backend in production)
  const skillProgress = {
    technical: 75,
    behavioral: 60,
    communication: 85,
    problemSolving: 70,
  };

  // Mock data for upcoming interviews (would come from backend in production)
  const upcomingInterviews = [
    {
      id: 1,
      type: 'Mock Interview',
      interviewer: 'Jitendra Sir',
      date: 'Oct 3, 2025',
      time: '2:00 PM',
      status: 'scheduled',
    },
    {
      id: 2,
      type: 'Mock Interview',
      interviewer: 'Awasthi Sir',
      date: 'Oct 5, 2025',
      time: '10:00 AM',
      status: 'scheduled',
    },
  ];

  // Achievement system data
  const achievements = [
    { icon: '🎯', title: 'First Interview', description: 'Completed your first AI interview', unlocked: true },
    { icon: '🔥', title: '5 Day Streak', description: 'Practiced 5 days in a row', unlocked: true },
    { icon: '⭐', title: 'High Scorer', description: 'Scored above 90 in an interview', unlocked: false },
    { icon: '👥', title: 'Volunteer', description: 'Conducted a mock interview', unlocked: false },
    { icon: '💼', title: 'Job Hunter', description: 'Applied to 10 jobs', unlocked: false },
    { icon: '🏆', title: 'Interview Master', description: 'Completed 50 practice sessions', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 particle-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="mb-6 text-white hover:text-cyan-400 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Profile Header */}
        <Card className="p-8 mb-8 glass-card neon-border cyber-glow">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 blur-xl opacity-60 animate-pulse-slow"></div>
              <Avatar className="w-24 h-24 border-2 border-cyan-500/50 relative">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-2xl">
                  SKG
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <h2 className="mb-2 text-white">Sagar Kumar Gautam</h2>
              <p className="text-cyan-400 mb-4">Software Engineer | Prayagraj, U.P</p>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 glass-card neon-border-cyan rounded-lg">
                  <span className="text-amber-400 animate-float">🪙</span>
                  <span className="font-semibold text-white">{userCoins} Coins</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg border border-cyan-500/30">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white">{aiInterviews.length} AI Sessions</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg border border-purple-500/30">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white">{volunteerInterviews.length} Mock Interviews</span>
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

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-amber-400 animate-float" />
              <Badge className="bg-green-500/20 text-green-400 border-0">+12%</Badge>
            </div>
            <div className="text-2xl mb-1 gradient-text-animate">{avgScore.toFixed(0)}</div>
            <div className="text-sm text-white/60">Avg Score</div>
            <Progress value={avgScore} className="mt-2 h-2 bg-white/10" />
          </Card>

          <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-cyan-400 animate-pulse-slow" />
            </div>
            <div className="text-2xl mb-1 text-cyan-400">{totalInterviews}</div>
            <div className="text-sm text-white/60">Total Sessions</div>
            <p className="text-xs text-white/40 mt-2">Last: 2 days ago</p>
          </Card>

          <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-400 animate-pulse-slow" />
            </div>
            <div className="text-2xl mb-1 text-green-400">7</div>
            <div className="text-sm text-white/60">Day Streak</div>
            <p className="text-xs text-white/40 mt-2">Keep it up! 🔥</p>
          </Card>

          <Card className="p-6 glass-card neon-border hover:cyber-glow transition-all">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-400 animate-float" />
            </div>
            <div className="text-2xl mb-1">{achievements.filter(a => a.unlocked).length}/{achievements.length}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
            <p className="text-xs text-muted-foreground mt-2">2 more to unlock</p>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Skill progress visualization */}
              <Card className="p-6">
                <h3 className="mb-6">Skill Progress</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Technical Skills</span>
                      <span className="text-sm text-muted-foreground">{skillProgress.technical}%</span>
                    </div>
                    <Progress value={skillProgress.technical} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Behavioral</span>
                      <span className="text-sm text-muted-foreground">{skillProgress.behavioral}%</span>
                    </div>
                    <Progress value={skillProgress.behavioral} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Communication</span>
                      <span className="text-sm text-muted-foreground">{skillProgress.communication}%</span>
                    </div>
                    <Progress value={skillProgress.communication} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Problem Solving</span>
                      <span className="text-sm text-muted-foreground">{skillProgress.problemSolving}%</span>
                    </div>
                    <Progress value={skillProgress.problemSolving} />
                  </div>
                </div>
              </Card>

              {/* Recent interview activity feed */}
              <Card className="p-6">
                <h3 className="mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {interviewHistory.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === 'AI Interview' 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        {item.type === 'AI Interview' ? (
                          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h4 className="text-sm">{item.type}</h4>
                            <p className="text-xs text-muted-foreground capitalize">
                              {item.interviewType || 'General'}
                              {item.mentor && ` with ${item.mentor}`}
                            </p>
                          </div>
                          {item.score && (
                            <Badge variant={item.score >= 80 ? 'default' : 'secondary'} className="text-xs">
                              {item.score}/100
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {interviewHistory.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No activity yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => onNavigate('ai-interview')}
                      >
                        Start Practicing
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Performance analysis and recommendations */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="mb-6">Performance Insights</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium">Strengths</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Clear communication</li>
                      <li>• Strong technical knowledge</li>
                      <li>• Good problem-solving</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="font-medium">Focus Areas</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Behavioral examples</li>
                      <li>• System design depth</li>
                      <li>• Time management</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">Next Steps</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Practice STAR method</li>
                      <li>• Book mock interview</li>
                      <li>• Review system design</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6">
              <h3 className="mb-6">Interview History</h3>
              {/* Display all completed interviews with details */}
              
              {interviewHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="mb-2">No Interview History</h4>
                  <p className="text-muted-foreground mb-6">
                    Start practicing to build your interview history
                  </p>
                  <Button onClick={() => onNavigate('ai-interview')}>
                    Start First Interview
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviewHistory.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-accent/30 rounded-lg">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === 'AI Interview' 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        {item.type === 'AI Interview' ? (
                          <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4>{item.type}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {item.interviewType || item.difficulty || 'General'}
                              {item.mentor && ` with ${item.mentor}`}
                            </p>
                          </div>
                          {item.score && (
                            <Badge variant={item.score >= 80 ? 'default' : 'secondary'}>
                              {item.score}/100
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                          {item.questionsCount && (
                            <span>{item.questionsCount} questions</span>
                          )}
                          {item.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card className="p-6">
              <h3 className="mb-6">Upcoming Interviews</h3>
              {/* Display scheduled mock interviews (mock data) */}
              <div className="space-y-4">
                {upcomingInterviews.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-accent/30 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4>{item.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            with {item.interviewer}
                          </p>
                        </div>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.time}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm" variant="ghost" className="text-destructive">Cancel</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            {/* Achievement system with unlockable badges */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <Card
                  key={index}
                  className={`p-6 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20' 
                      : 'opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h4 className="mb-2">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {achievement.description}
                  </p>
                  {achievement.unlocked ? (
                    <Badge variant="default">Unlocked</Badge>
                  ) : (
                    <Badge variant="outline">Locked</Badge>
                  )}
                </Card>
              ))}
            </div>

            <Card className="p-6 mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-none">
              <div className="flex items-center gap-4">
                <Trophy className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3>Keep Going!</h3>
                  <p className="text-muted-foreground">
                    Complete more interviews to unlock achievements and earn rewards
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
