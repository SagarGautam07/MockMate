// This component displays the job portal where users can browse and apply to Indian job listings.
// It includes search, filtering, job details, and application submission functionality.

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building2, Search, Send, Bookmark, TrendingUp } from 'lucide-react';

// Mock job listings focused on Indian companies and locations with INR salary ranges
const JOB_LISTINGS = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechMahindra',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹6-12 LPA',
    posted: '2 days ago',
    logo: 'TM',
    tags: ['React', 'TypeScript', 'Tailwind'],
    description: 'We are looking for an experienced frontend engineer to join our growing team in Bangalore...',
    requirements: ['3+ years of experience', 'Expert in React', 'Strong TypeScript skills'],
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    company: 'Infosys',
    location: 'Pune, India',
    type: 'Full-time',
    salary: '₹8-15 LPA',
    posted: '1 week ago',
    logo: 'IF',
    tags: ['Node.js', 'React', 'AWS'],
    description: 'Join our fast-paced team and work on cutting-edge projects for global clients...',
    requirements: ['3+ years full-stack experience', 'Cloud expertise', 'Strong problem-solving skills'],
  },
  {
    id: 3,
    title: 'Backend Engineer',
    company: 'Wipro',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: '₹7-14 LPA',
    posted: '3 days ago',
    logo: 'WP',
    tags: ['Python', 'Django', 'PostgreSQL'],
    description: 'Build scalable backend systems for our enterprise clients...',
    requirements: ['4+ years backend development', 'Database expertise', 'API design'],
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'TCS',
    location: 'Mumbai, India',
    type: 'Full-time',
    salary: '₹9-16 LPA',
    posted: '5 days ago',
    logo: 'TC',
    tags: ['Kubernetes', 'Docker', 'CI/CD'],
    description: 'Help us build and maintain our cloud infrastructure for enterprise solutions...',
    requirements: ['3+ years DevOps experience', 'Kubernetes knowledge', 'Automation skills'],
  },
  {
    id: 5,
    title: 'Mobile Developer',
    company: 'Zomato',
    location: 'Gurgaon, India',
    type: 'Full-time',
    salary: '₹10-18 LPA',
    posted: '1 day ago',
    logo: 'ZM',
    tags: ['React Native', 'iOS', 'Android'],
    description: 'Create beautiful mobile experiences for millions of users across India...',
    requirements: ['2+ years mobile development', 'Cross-platform expertise', 'UI/UX sense'],
  },
  {
    id: 6,
    title: 'Product Manager',
    company: 'Flipkart',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹12-20 LPA',
    posted: '4 days ago',
    logo: 'FK',
    tags: ['Product Strategy', 'Agile', 'Analytics'],
    description: 'Lead product development and drive our product vision in the e-commerce space...',
    requirements: ['4+ years PM experience', 'Technical background', 'Data-driven mindset'],
  },
  {
    id: 7,
    title: 'Data Scientist',
    company: 'Paytm',
    location: 'Noida, India',
    type: 'Full-time',
    salary: '₹11-19 LPA',
    posted: '2 days ago',
    logo: 'PT',
    tags: ['Python', 'Machine Learning', 'SQL'],
    description: 'Work on advanced analytics and machine learning models for financial services...',
    requirements: ['3+ years data science experience', 'ML/AI expertise', 'Strong analytical skills'],
  },
  {
    id: 8,
    title: 'UI/UX Designer',
    company: 'Swiggy',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹7-13 LPA',
    posted: '6 days ago',
    logo: 'SW',
    tags: ['Figma', 'Design Systems', 'User Research'],
    description: 'Design intuitive and beautiful user experiences for our food delivery platform...',
    requirements: ['2+ years UI/UX experience', 'Portfolio required', 'User-centric thinking'],
  },
];

export function JobPortal({ onNavigate, userCoins, onSpendCoins }) {
  // State management for job portal features
  const [profileBoosted, setProfileBoosted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState('idle');
  const [savedJobs, setSavedJobs] = useState([]);

  // Filter jobs based on search query, location, and job type
  const filteredJobs = JOB_LISTINGS.filter((job) => {
    const matchesSearch = 
      searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = !locationFilter || job.location.includes(locationFilter) || locationFilter === 'remote' && job.location === 'Remote';
    const matchesType = !typeFilter || job.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  // Toggle job save status for bookmarking functionality
  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  // Handle job application submission
  const submitApplication = () => {
    setApplicationStatus('submitted');
    // Reset form after 2 seconds
    setTimeout(() => {
      setApplicationStatus('idle');
      setSelectedJob(null);
    }, 2000);
  };

  // Boost user profile visibility using coins
  const boostProfile = () => {
    if (userCoins >= 100) {
      onSpendCoins(100);
      setProfileBoosted(true);
    }
  };

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

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center cyber-glow animate-pulse-slow">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white">Job Portal</h2>
              <p className="text-sm text-cyan-400">
                Find your next opportunity after mastering your interview skills
              </p>
            </div>
          </div>
          
          {profileBoosted && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 animate-pulse-slow">
              🚀 Profile Boosted
            </Badge>
          )}
        </div>

        {/* Platform statistics banner */}
        <Card className="p-6 mb-8 glass-card neon-border cyber-glow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1 text-cyan-400">2,847</div>
              <div className="text-sm text-white/60">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1 text-purple-400">1,234</div>
              <div className="text-sm text-white/60">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1 text-green-400">156</div>
              <div className="text-sm text-white/60">New Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1 text-pink-400">89%</div>
              <div className="text-sm text-white/60">Response Rate</div>
            </div>
          </div>
        </Card>

        {/* Profile boost feature - increases job visibility */}
        {!profileBoosted && (
          <Card className="p-6 mb-6 glass-card neon-border holographic">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-amber-400 animate-float" />
                <div>
                  <h3 className="text-white">Boost Your Profile</h3>
                  <p className="text-sm text-white/70">Get 3x more visibility and priority in searches</p>
                </div>
              </div>
              <Button
                onClick={boostProfile}
                disabled={userCoins < 100}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 cyber-glow border-0 text-white"
              >
                <span className="mr-2">🪙 100</span>
                Boost Profile
              </Button>
            </div>
          </Card>
        )}

        {/* Job search and filtering interface */}
        <Card className="p-6 mb-6 glass-card neon-border">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                {/* Indian cities filter options */}
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                <SelectItem value="Noida">Noida</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Job listing tabs - All, Saved, and Applied */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Jobs ({filteredJobs.length})</TabsTrigger>
            <TabsTrigger value="saved">Saved ({savedJobs.length})</TabsTrigger>
            <TabsTrigger value="applied">Applied (0)</TabsTrigger>
          </TabsList>

          {/* All available jobs list */}
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      {job.logo}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="mb-1">{job.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.posted}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job.id)}
                        >
                          <Bookmark className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <Badge variant="secondary">{job.type}</Badge>
                        <span className="flex items-center gap-1 text-sm">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span>{job.salary}</span>
                        </span>
                        {job.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedJob(job)}>
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            {selectedJob && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>{selectedJob.title}</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6">
                                  <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                                      {selectedJob.logo}
                                    </div>
                                    <div>
                                      <h3>{selectedJob.company}</h3>
                                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          {selectedJob.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <DollarSign className="w-4 h-4" />
                                          {selectedJob.salary}
                                        </span>
                                        <Badge>{selectedJob.type}</Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="mb-2">Job Description</h4>
                                    <p className="text-muted-foreground">
                                      {selectedJob.description}
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="mb-2">Requirements</h4>
                                    <ul className="space-y-2">
                                      {selectedJob.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                                          <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                                          <span>{req}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="mb-2">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedJob.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  {applicationStatus === 'idle' && (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block mb-2">Cover Letter</label>
                                        <Textarea
                                          placeholder="Tell us why you're a great fit for this role..."
                                          className="min-h-[120px]"
                                        />
                                      </div>

                                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <div className="flex items-start gap-2">
                                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                          <div>
                                            <h4 className="text-sm mb-1">Interview Preparation Tip</h4>
                                            <p className="text-sm text-muted-foreground">
                                              Practice with our AI or book a mock interview before applying to increase your chances!
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      <Button onClick={submitApplication} className="w-full" size="lg">
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit Application
                                      </Button>
                                    </div>
                                  )}

                                  {applicationStatus === 'submitted' && (
                                    <div className="text-center py-8">
                                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
                                      </div>
                                      <h3 className="mb-2">Application Submitted!</h3>
                                      <p className="text-muted-foreground">
                                        Your application has been sent. Good luck!
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline">
                          Quick Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Saved/bookmarked jobs */}
          <TabsContent value="saved">
            {savedJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Saved Jobs</h3>
                <p className="text-muted-foreground">
                  Save jobs you're interested in to easily find them later
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {JOB_LISTINGS.filter(job => savedJobs.includes(job.id)).map((job) => (
                  <Card key={job.id} className="p-6">
                    <h3>{job.title}</h3>
                    <p className="text-muted-foreground">{job.company}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Applied jobs history */}
          <TabsContent value="applied">
            <Card className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start applying to jobs and track your applications here
              </p>
              <Button onClick={() => onNavigate('ai-interview')}>
                Practice Interview First
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
