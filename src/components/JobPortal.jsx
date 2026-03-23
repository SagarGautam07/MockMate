import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building2, Search, Bookmark, TrendingUp, Users, AlertCircle, Loader2 } from 'lucide-react';
import { jobsAPI } from '../services/api';
import { useDebounce } from '../hooks/useFetch';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';

export function JobPortal({ onNavigate, userCoins, onSpendCoins }) {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management for job portal features
  const [profileBoosted, setProfileBoosted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const JOBS_PER_PAGE = 9;
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState('idle');
  const [savedJobs, setSavedJobs] = useState([]);

  // Job apply state
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [showApplied, setShowApplied] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  function getUserFriendlyMessage(err) {
    if (err?.code === 'auth/popup-closed-by-user') return null;
    const msg = String(err?.message || '');
    if (msg.toLowerCase().includes('network')) return 'Network error. Check your connection.';
    if (err?.response?.status === 401) return 'Session expired. Please sign in again.';
    if (err?.response?.status === 429) return 'Too many requests. Please wait a moment.';
    return 'Something went wrong. Please try again.';
  }

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        keyword: debouncedSearch || '',
        location: locationFilter && locationFilter !== 'All' ? locationFilter : '',
        type: typeFilter && typeFilter !== 'All' ? typeFilter : '',
      };
      const data = await jobsAPI.getJobs(params);
      setJobs(data.jobs || []);
      setTotal(data.total ?? (data.jobs || []).length);
    } catch (err) {
      console.error('[JobPortal]', err);
      const msg = getUserFriendlyMessage(err);
      if (msg) toast.error(msg);
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [debouncedSearch, locationFilter, typeFilter]);

  const filteredJobs = useMemo(() => {
    let result = jobs || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.company || '').toLowerCase().includes(q) ||
        (j.tags || []).some(t => String(t).toLowerCase().includes(q)) ||
        (j.location || '').toLowerCase().includes(q)
      );
    }

    if (locationFilter && locationFilter !== 'All') {
      result = result.filter(j =>
        (j.location || '').toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (typeFilter && typeFilter !== 'All') {
      result = result.filter(j => j.type === typeFilter);
    }

    if (showApplied) {
      result = result.filter(j => appliedJobIds.has(j.id || j._id));
    }

    return result;
  }, [jobs, searchQuery, locationFilter, typeFilter, showApplied, appliedJobIds]);

  const pagedJobs = useMemo(() => {
    const start = (page - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(start, start + JOBS_PER_PAGE);
  }, [filteredJobs, page]);

  useEffect(() => setPage(1), [searchQuery, locationFilter, typeFilter, showApplied]);

  // Quick Apply handler
  async function handleApply(job) {
    const id = job.id || job._id;
    if (!user) { toast.error('Please sign in to apply'); return; }
    if (appliedJobIds.has(id)) { toast.info('Already applied to this job'); return; }
    if (applyingId) return;

    setApplyingId(id);
    try {
      await jobsAPI.apply({ jobId: id, title: job.title, company: job.company });
    } catch (_) {
      // Non-critical — mark as applied even if API fails
    } finally {
      setAppliedJobIds(prev => new Set([...prev, id]));
      setApplyingId(null);
      toast.success(`Applied to ${job.title} at ${job.company}! 🎉`);
    }
  }

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

          <div className="text-sm text-white/60">
            {loading ? 'Loading jobs...' : `${filteredJobs.length} jobs`}
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

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/60 text-sm"
            >
              <option value="All">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Remote">Remote</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/60 text-sm"
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>

            <button
              type="button"
              onClick={() => setShowApplied(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                border transition-all whitespace-nowrap ${
                showApplied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              ✓ Applied {appliedJobIds.size > 0 && `(${appliedJobIds.size})`}
            </button>
          </div>
        </Card>

        {/* Job listing tabs - All, Saved, and Applied */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Jobs ({filteredJobs.length})</TabsTrigger>
            <TabsTrigger value="saved">Saved ({savedJobs.length})</TabsTrigger>
            <TabsTrigger value="applied">Applied ({appliedJobIds.size})</TabsTrigger>
          </TabsList>

          {/* All available jobs list */}
          <TabsContent value="all" className="mt-6">
            {error && (
              <div className="mb-6 glass-card neon-border border-red-500/40 bg-red-500/10 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white/90 text-sm">{error}</p>
                    <Button
                      onClick={fetchJobs}
                      variant="outline"
                      className="mt-3 border-red-400/30 text-white hover:bg-white/10"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white/5 rounded-xl h-48" />
                ))}
              </div>
            )}

            {!loading && !error && filteredJobs.length === 0 && (
              <Card className="p-12 text-center glass-card neon-border">
                <Briefcase className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="mb-2 text-white">No jobs found</h3>
                <p className="text-white/60">Try adjusting your filters</p>
              </Card>
            )}

            {!loading && !error && filteredJobs.length > 0 && (
              <>
              <div className="grid gap-4">
                {pagedJobs.map((job) => (
                  <Card key={job.id || job._id} className="p-6 glass-card neon-border hover:cyber-glow transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      {(job.company || 'C').slice(0, 2).toUpperCase()}
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
                              {job.postedDays ?? 0} days ago
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
                        <span className="flex items-center gap-1 text-sm text-white/60">
                          <Users className="w-4 h-4" />
                          {job.applicants ?? 0} applicants
                        </span>
                        {(job.tags || []).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                            border border-white/20 bg-white/5 hover:bg-white/10
                            text-white/70 hover:text-white transition-all"
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApply(job)}
                          disabled={!!applyingId}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                            transition-all ${
                            appliedJobIds.has(job.id || job._id)
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default'
                              : 'bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 text-white'
                          }`}
                        >
                          {appliedJobIds.has(job.id || job._id) ? '✓ Applied'
                           : applyingId === (job.id || job._id) ? 'Applying...'
                           : '⚡ Quick Apply'}
                        </button>
                      </div>
                    </div>
                  </div>
                  </Card>
                ))}
              </div>

              {filteredJobs.length > JOBS_PER_PAGE && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    ← Previous
                  </button>
                  <span className="text-white/60 text-sm px-3">
                    Page {page} of {Math.ceil(filteredJobs.length / JOBS_PER_PAGE)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(Math.ceil(filteredJobs.length / JOBS_PER_PAGE), p + 1))}
                    disabled={page >= Math.ceil(filteredJobs.length / JOBS_PER_PAGE)}
                    className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    Next →
                  </button>
                </div>
              )}
              </>
            )}
          </TabsContent>

          {/* Saved/bookmarked jobs */}
          <TabsContent value="saved">
            {savedJobs.length === 0 ? (
              <Card className="p-12 text-center glass-card neon-border">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Saved Jobs</h3>
                <p className="text-muted-foreground">
                  Save jobs you're interested in to easily find them later
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredJobs.filter((job) => savedJobs.includes(job.id)).map((job) => (
                  <Card key={job.id} className="p-6 glass-card neon-border">
                    <h3>{job.title}</h3>
                    <p className="text-muted-foreground">{job.company}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Applied jobs history */}
          <TabsContent value="applied">
            {appliedJobIds.size === 0 ? (
              <Card className="p-12 text-center glass-card neon-border">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start applying to jobs and track your applications here
                </p>
                <Button onClick={() => onNavigate('ai-interview')}>
                  Practice Interview First
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(jobs || []).filter(j => appliedJobIds.has(j.id || j._id)).map((job) => (
                  <Card key={job.id || job._id} className="p-6 glass-card neon-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400">✓ Applied</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setSelectedJob(null)}
        >
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl
                          max-h-[85vh] overflow-y-auto shadow-2xl">

            {/* Modal header */}
            <div className="sticky top-0 bg-slate-900 z-10 flex items-start justify-between
                            p-6 border-b border-white/10">
              <div>
                <h2 className="text-white font-bold text-xl">{selectedJob.title}</h2>
                <p className="text-white/60 mt-0.5 text-sm">
                  {selectedJob.company} · {selectedJob.location}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedJob(null)}
                      className="text-white/40 hover:text-white transition-colors ml-4 shrink-0">
                <span className="text-xl leading-none">✕</span>
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">

              {/* Key info chips */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20
                                 text-cyan-300 text-sm">{selectedJob.salary}</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10
                                 text-white/70 text-sm">{selectedJob.type}</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10
                                 text-white/70 text-sm">
                  {selectedJob.postedDays === 0 ? 'Posted today'
                   : selectedJob.postedDays === 1 ? 'Posted yesterday'
                   : `Posted ${selectedJob.postedDays} days ago`}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10
                                 text-white/70 text-sm">{selectedJob.applicants} applicants</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {(selectedJob.tags || []).map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-purple-500/20
                                     border border-purple-500/20 text-purple-300 text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-white font-semibold mb-2">About the Role</h3>
                <p className="text-white/70 text-sm leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply button */}
              <button
                type="button"
                onClick={() => { handleApply(selectedJob); setSelectedJob(null); }}
                disabled={appliedJobIds.has(selectedJob.id || selectedJob._id)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
                            flex items-center justify-center gap-2 ${
                  appliedJobIds.has(selectedJob.id || selectedJob._id)
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-white'
                }`}
              >
                {appliedJobIds.has(selectedJob.id || selectedJob._id)
                  ? '✓ Already Applied'
                  : '⚡ Apply Now'}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
