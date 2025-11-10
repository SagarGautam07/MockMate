// Volunteer Interview component - displays available mentors and booking interface
// Currently shows "under development" message while displaying mentor information
// Note: Booking functionality is disabled as this feature is in development

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ArrowLeft, Users, Star, Calendar as CalendarIcon, Clock, Award, MessageSquare, Settings } from 'lucide-react';

// Available mentors for volunteer interviews (mock data)
const AVAILABLE_MENTORS = [
  {
    id: 1,
    name: 'Satyam Yadav',
    role: 'Senior Software Engineer',
    company: 'Google',
    avatar: 'SY',
    rating: 4.9,
    reviews: 127,
    expertise: ['Technical', 'System Design'],
    availability: 'Today, Tomorrow',
  },
  {
    id: 2,
    name: 'Rishank Srivastava',
    role: 'Engineering Manager',
    company: 'Meta',
    avatar: 'RS',
    rating: 4.8,
    reviews: 98,
    expertise: ['Behavioral', 'Leadership'],
    availability: 'Tomorrow, Thu',
  },
  {
    id: 3,
    name: 'Saumya Sharma',
    role: 'Tech Lead',
    company: 'Amazon',
    avatar: 'SS',
    rating: 5.0,
    reviews: 156,
    expertise: ['Technical', 'Behavioral'],
    availability: 'Today, Wed',
  },
  {
    id: 4,
    name: 'Shikhar Oberoy',
    role: 'Principal Engineer',
    company: 'Microsoft',
    avatar: 'SO',
    rating: 4.7,
    reviews: 89,
    expertise: ['System Design', 'Architecture'],
    availability: 'Wed, Thu, Fri',
  },
];

// Available time slots for booking (currently disabled)
const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

// Note: onComplete, onSpendCoins, and onCoinsEarned props are kept for future implementation
// but are not currently used since booking functionality is disabled
export function VolunteerInterview({ onNavigate, onComplete, userCoins, onSpendCoins, onCoinsEarned }) {
  // State for booking flow (currently disabled - UI is visible but non-functional)
  const [activeTab, setActiveTab] = useState('book');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [bookingStage, setBookingStage] = useState('select');
  const [volunteerMessage, setVolunteerMessage] = useState('');

  // Find selected mentor from available mentors
  const mentor = AVAILABLE_MENTORS.find(m => m.id === selectedMentor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 particle-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="mb-6 text-white hover:text-cyan-400 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center cyber-glow animate-pulse-slow">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Volunteer Mock Interviews</h2>
            <p className="text-sm text-cyan-400">
              Practice with real professionals or become a volunteer interviewer
            </p>
          </div>
        </div>

        {/* Under Development Alert */}
        <Alert className="mb-6 glass-card neon-border border-amber-500/50 bg-amber-500/10">
          <Settings className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-amber-400">⚙️ This feature is under development as part of a minor project.</AlertTitle>
          <AlertDescription className="text-white/80">
            Booking and scheduling interviews with mentors is currently being developed. You can view available mentors below, but booking functionality is not yet available.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
            <TabsTrigger value="book">Book Interview</TabsTrigger>
            <TabsTrigger value="volunteer">Become Volunteer</TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            {bookingStage === 'select' && (
              <div>
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                  {AVAILABLE_MENTORS.map((m) => (
                    <Card
                      key={m.id}
                      className={`p-6 glass-card neon-border transition-all ${
                        selectedMentor === m.id ? 'cyber-glow-intense neon-border' : 'opacity-75'
                      }`}
                      onClick={() => setSelectedMentor(m.id)}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12 border-2 border-cyan-500/50">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                              {m.avatar}
                            </AvatarFallback>
                          </Avatar>
                          {selectedMentor === m.id && (
                            <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md animate-pulse-slow"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="mb-1 text-white">{m.name}</h4>
                          <p className="text-sm text-cyan-400 mb-1">{m.role}</p>
                          <p className="text-sm text-white/60">{m.company}</p>
                        </div>
                        {selectedMentor === m.id && (
                          <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0 animate-pulse-slow">Selected</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse-slow" />
                          <span className="text-sm text-white">{m.rating}</span>
                        </div>
                        <span className="text-sm text-white/60">
                          {m.reviews} reviews
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {m.expertise.map((exp) => (
                          <Badge key={exp} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 border text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <CalendarIcon className="w-4 h-4 text-cyan-400" />
                        <span>{m.availability}</span>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button
                  onClick={() => setBookingStage('schedule')}
                  disabled={!selectedMentor}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  Continue to Schedule
                </Button>
              </div>
            )}

            {bookingStage === 'schedule' && mentor && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="mb-4 text-white">Selected Mentor</h3>
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        {mentor.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="mb-1 text-white">{mentor.name}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{mentor.role}</p>
                      <p className="text-sm text-muted-foreground">{mentor.company}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-white">Interview Type</label>
                      <Select value={interviewType} onValueChange={setInterviewType} disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Interview</SelectItem>
                          <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                          <SelectItem value="system-design">System Design</SelectItem>
                          <SelectItem value="general">General Discussion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block mb-2 text-white">Select Date</label>
                      <div className="border rounded-lg p-3 opacity-50 pointer-events-none">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={() => {}}
                          disabled={(date) => true}
                          className="rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4 text-white">Available Time Slots</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {TIME_SLOTS.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        onClick={() => setSelectedTime(time)}
                        disabled
                        className="justify-start"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {time}
                      </Button>
                    ))}
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="font-medium text-white">Cost: 20 coins</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your balance: {userCoins || 0} coins
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setBookingStage('select')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {}}
                      disabled
                      className="flex-1"
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="volunteer">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="mb-4 text-white">Become a Volunteer Interviewer</h3>
                <p className="text-muted-foreground mb-6">
                  Share your expertise and help others prepare for interviews while earning coins!
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white">Rating-Based Coin Rewards</h4>
                      <p className="text-sm text-muted-foreground">
                        3⭐ = 25 coins | 4⭐ = 40 coins | 5⭐ = 50 coins
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white">Help the Community</h4>
                      <p className="text-sm text-muted-foreground">
                        Make a difference by helping job seekers improve their skills
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white">Build Your Reputation</h4>
                      <p className="text-sm text-muted-foreground">
                        Get rated and build credibility in the community
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/50 p-4 rounded-lg">
                  <h4 className="mb-2 text-white">Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ 2+ years of professional experience</li>
                    <li>✓ Strong communication skills</li>
                    <li>✓ Ability to provide constructive feedback</li>
                    <li>✓ Commit to at least 2 hours per week</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 text-white">Application Form</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-white">Why do you want to volunteer?</label>
                    <Textarea
                      value={volunteerMessage}
                      onChange={(e) => setVolunteerMessage(e.target.value)}
                      placeholder="Tell us about your experience and motivation..."
                      className="min-h-[120px]"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-white">Areas of Expertise</label>
                    <div className="flex flex-wrap gap-2">
                      {['Technical', 'Behavioral', 'System Design', 'Leadership', 'Product'].map((area) => (
                        <Badge key={area} variant="outline" className="cursor-pointer hover:bg-accent">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-white">Availability</label>
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={() => {}} disabled className="w-full" size="lg">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Submit Application
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
