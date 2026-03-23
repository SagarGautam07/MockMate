import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Star,
  Users,
  Clock,
  Briefcase,
  Search,
  UserPlus,
  Coins,
  ChevronDown,
  Sparkles,
  Link2,
  Video,
} from 'lucide-react';
import { volunteerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import VolunteerBookingModal from './VolunteerBookingModal';
import VolunteerRegistrationForm from './VolunteerRegistrationForm';

function formatAvailability(availability) {
  if (!availability) return 'Availability not provided';
  if (typeof availability === 'string') return availability;
  if (!Array.isArray(availability)) return 'Availability not provided';

  const parts = availability
    .map((entry) => {
      if (!entry?.day) return null;
      const slots = Array.isArray(entry.slots) && entry.slots.length
        ? ` (${entry.slots.join(', ')})`
        : '';
      return `${entry.day}${slots}`;
    })
    .filter(Boolean);

  return parts.length ? parts.join(', ') : 'Availability not provided';
}

export function VolunteerInterview({ userCoins: initialUserCoins = 0, onSpendCoins, onNavigate }) {
  const { user, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expertiseFilter, setExpertiseFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingTarget, setBookingTarget] = useState(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [selectedVolunteerName, setSelectedVolunteerName] = useState('');
  const [detectedRoomId, setDetectedRoomId] = useState('');
  const [pendingJoinRoomId, setPendingJoinRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [userCoins, setUserCoins] = useState(initialUserCoins);
  const [signingInVolunteer, setSigningInVolunteer] = useState(false);
  const loadErrorShownRef = useRef(false);

  useEffect(() => {
    setUserCoins(initialUserCoins);
  }, [initialUserCoins]);

  const navigateToMeeting = (room, volunteerName = '') => {
    const cleanedRoom = extractRoomCode(room);
    if (!cleanedRoom) {
      toast.error('Enter a valid room code or invite link');
      return;
    }

    const params = new URLSearchParams({ room: cleanedRoom });
    if (volunteerName) {
      params.set('volunteer', volunteerName);
    }

    window.history.pushState(
      { page: 'volunteer-meeting' },
      '',
      `/volunteer/meeting?${params.toString()}`,
    );

    if (onNavigate) {
      onNavigate('volunteer-meeting');
      window.history.replaceState(
        { page: 'volunteer-meeting' },
        '',
        `/volunteer/meeting?${params.toString()}`,
      );
      return;
    }

    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const extractRoomCode = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^[A-Z0-9]{4,12}$/i.test(raw)) return raw.toUpperCase();
    try {
      const url = new URL(raw);
      const q = url.searchParams.get('room');
      if (q) return q.toUpperCase();
    } catch (_) {}
    const decoded = decodeURIComponent(raw);
    const m = decoded.match(/room=([A-Z0-9]+)/i);
    return m?.[1]?.toUpperCase() || '';
  };

  const detectRoomFromWindow = () => {
    const href = window.location.href;
    const params = new URLSearchParams(window.location.search);
    return (
      extractRoomCode(params.get('room')) ||
      extractRoomCode(window.location.search) ||
      extractRoomCode(window.location.hash) ||
      extractRoomCode(href)
    );
  };

  useEffect(() => {
    const room = detectRoomFromWindow();
    if (!room) return;

    setDetectedRoomId(room);
    setJoinInput((prev) => prev || room);

    if (user) {
      navigateToMeeting(room);
      return;
    }

    setPendingJoinRoomId(room);
    toast.info(`Invite detected for room ${room}. Sign in, then tap Join Invite Room.`);
  }, [user]);

  useEffect(() => {
    if (!user || !pendingJoinRoomId) return;
    setDetectedRoomId(pendingJoinRoomId);
  }, [user, pendingJoinRoomId]);

  useEffect(() => {
    loadErrorShownRef.current = false;
    setLoading(true);
    volunteerAPI
      .list(expertiseFilter !== 'All' ? { expertise: expertiseFilter } : {})
      .then((data) => setVolunteers(data.volunteers || []))
      .catch(() => {
        if (!loadErrorShownRef.current) {
          toast.error('Failed to load volunteers');
          loadErrorShownRef.current = true;
        }
      })
      .finally(() => setLoading(false));
  }, [expertiseFilter]);

  const displayed = useMemo(
    () =>
      (volunteers || [])
        .filter((v) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            v.name?.toLowerCase().includes(q) ||
            v.role?.toLowerCase().includes(q) ||
            (v.expertise || []).some((e) => e.toLowerCase().includes(q))
          );
        })
        .sort((a, b) => {
          if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
          if (sortBy === 'coins') return (a.coinsCharged || 0) - (b.coinsCharged || 0);
          if (sortBy === 'reviews') return (b.totalReviews || 0) - (a.totalReviews || 0);
          return 0;
        }),
    [volunteers, searchQuery, sortBy],
  );

  const handleBook = (volunteer) => {
    if (!user) {
      toast.info('Please sign in to book a session');
      return;
    }
    setBookingTarget(volunteer);
  };

  const handleBecomeVolunteer = async () => {
    if (user) {
      setShowRegForm(true);
      return;
    }
    try {
      setSigningInVolunteer(true);
      await signInWithGoogle();
      toast.success('Signed in successfully');
      setShowRegForm(true);
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') return;
      toast.error(err?.message || 'Sign in required to become a volunteer');
    } finally {
      setSigningInVolunteer(false);
    }
  };

  const openLiveInterviewRoom = (room, volunteerName = '') => {
    const cleanedRoom = extractRoomCode(room);
    if (!cleanedRoom) {
      toast.error('Enter a valid room code or invite link');
      return;
    }
    if (volunteerName) {
      setSelectedVolunteerName(volunteerName);
    }
    setDetectedRoomId(cleanedRoom);
    setPendingJoinRoomId('');
    navigateToMeeting(cleanedRoom, volunteerName);
  };

  const handleStartLiveInterview = () => {
    if (!user) {
      toast.info('Please sign in to start a volunteer interview');
      return;
    }
    const generatedRoom = pendingJoinRoomId || Math.random().toString(36).slice(2, 8).toUpperCase();
    openLiveInterviewRoom(generatedRoom, selectedVolunteerName);
  };

  const handleJoinFromInput = () => {
    const room = extractRoomCode(joinInput);
    if (!room) {
      toast.error('Enter a valid room code or invite link');
      return;
    }
    if (!user) {
      setPendingJoinRoomId(room);
      setDetectedRoomId(room);
      toast.info(`Room ${room} saved. Sign in, then tap Join Invite Room.`);
      return;
    }
    openLiveInterviewRoom(room);
  };

  const handleJoinDetectedRoom = async () => {
    const room = detectedRoomId || pendingJoinRoomId || extractRoomCode(joinInput);
    if (!room) {
      toast.error('No invite room found');
      return;
    }

    if (!user) {
      try {
        await signInWithGoogle();
      } catch (err) {
        if (err?.code !== 'auth/popup-closed-by-user') {
          toast.error(err?.message || 'Sign in required to join the invite room');
        }
        return;
      }
    }

    openLiveInterviewRoom(room);
  };

  const handleBookingConfirm = async (bookingData) => {
    const result = await volunteerAPI.book(bookingData);
    const cost = bookingTarget?.coinsCharged || 0;
    setUserCoins((prev) => prev - cost);
    if (onSpendCoins && cost > 0) {
      onSpendCoins(cost);
    }
    if (bookingTarget?.name) {
      toast.success(`Session booked with ${bookingTarget.name}!`);
    } else {
      toast.success('Session booked successfully!');
    }
    return result;
  };

  return (
    <div className="px-4 py-6 text-white md:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 text-white">
        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Volunteer Interviews</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-white/78">
              Book a session with experienced professionals
            </p>
          </div>
          <button
            type="button"
            onClick={handleBecomeVolunteer}
            disabled={signingInVolunteer}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400
                        disabled:bg-cyan-500/50 disabled:cursor-not-allowed
                        text-white font-semibold px-5 py-2.5 rounded-xl
                        transition-colors self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            {signingInVolunteer ? 'Signing in...' : 'Become a Volunteer'}
          </button>
        </div>

        {/* Registration form — shown inline when toggled */}
        {showRegForm && (
          <VolunteerRegistrationForm
            onClose={() => setShowRegForm(false)}
            onSuccess={(res) => {
              setShowRegForm(false);
              if (!res?.isApproved) {
                toast.info('Application received. Your profile will appear after approval.');
              } else {
                toast.success('Your volunteer profile is now live.');
              }
              if (res?.volunteer) {
                setVolunteers((prev) => {
                  const withoutSame = prev.filter((v) => (v._id || v.id) !== (res.volunteer._id || res.volunteer.id));
                  return [res.volunteer, ...withoutSame];
                });
              }
              volunteerAPI.list()
                .then((d) => setVolunteers(d.volunteers || []))
                .catch(() => {});
            }}
          />
        )}

        {detectedRoomId && (
          <div className="flex flex-col gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-cyan-100">Invite room detected</h3>
              <p className="mt-1 text-sm leading-6 text-cyan-50/85">
                Room <span className="font-mono font-semibold">{detectedRoomId}</span> is ready to join on this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={handleJoinDetectedRoom}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm self-start md:self-auto"
            >
              Join Invite Room
            </button>
          </div>
        )}

        <section className="relative overflow-hidden rounded-[32px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(59,130,246,0.18),_transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.97),rgba(17,24,39,0.98))] p-5 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_90px_rgba(2,6,23,0.55)] md:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Volunteer Live Room
              </div>

              <div className="space-y-3">
                <h3 className="max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-[2.2rem]">
                  Start Volunteer Video Interview
                </h3>
                <p className="max-w-2xl text-base leading-7 text-white/75">
                  Launch a dedicated interview room, invite a volunteer instantly, or join with a room code from another browser or device.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Video className="h-4 w-4 text-cyan-300" />
                    Start a new room
                  </div>
                  <p className="mb-4 text-sm leading-6 text-white/65">
                    Pick a volunteer if you want a labelled room, then open the interview screen immediately.
                  </p>
                  <label className="relative block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/82">Volunteer</span>
                    <select
                      value={selectedVolunteerName}
                      onChange={(e) => setSelectedVolunteerName(e.target.value)}
                      className="h-13 w-full appearance-none rounded-2xl border border-white/15 bg-slate-900/95 px-4 pr-12 text-sm text-white transition focus:border-cyan-400/60 focus:outline-none"
                    >
                      <option value="">Select volunteer (optional)</option>
                      {displayed.map((v) => (
                        <option key={v._id || v.id} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-[46px] h-4 w-4 text-white/55" />
                  </label>
                  <button
                    type="button"
                    onClick={handleStartLiveInterview}
                    className="mt-4 inline-flex h-13 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition hover:scale-[1.01] hover:from-cyan-300 hover:to-blue-400"
                  >
                    Start Interview
                  </button>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-slate-950/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Link2 className="h-4 w-4 text-cyan-300" />
                    Join an existing room
                  </div>
                  <p className="mb-4 text-sm leading-6 text-white/65">
                    Paste the invite link or room code shared by someone else and jump straight into the same meeting.
                  </p>
                  <label className="relative block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/82">Invite link or room code</span>
                    <Link2 className="pointer-events-none absolute left-4 top-[46px] h-4 w-4 text-cyan-200" />
                    <input
                      value={joinInput}
                      onChange={(e) => setJoinInput(e.target.value)}
                      placeholder="Paste invite link or room code"
                      className="h-13 w-full rounded-2xl border border-white/15 bg-slate-950/85 pl-11 pr-4 text-sm text-white placeholder:text-white/45 shadow-inner shadow-black/20 transition focus:border-cyan-400/60 focus:bg-slate-950 focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleJoinFromInput}
                    className="mt-4 inline-flex h-13 w-full items-center justify-center rounded-2xl border border-cyan-300/35 bg-white/10 px-5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-cyan-300/55 hover:bg-cyan-400/18"
                  >
                    Join from Link/Code
                  </button>
                </div>
              </div>
            </div>

            <aside className="rounded-[28px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(8,15,31,0.92),rgba(17,24,39,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">How it works</p>
                  <h4 className="mt-2 text-xl font-semibold text-white">Fast interview setup</h4>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-white/70">
                  3 steps
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ['1', 'Choose your path', 'Start a fresh room or join one with a shared code.'],
                  ['2', 'Invite or enter', 'Copy the invite link for a volunteer, or paste one you received.'],
                  ['3', 'Begin the session', 'Open the dedicated meeting screen and continue the interview there.'],
                ].map(([step, title, copy]) => (
                  <div key={step} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.045] p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/14 text-sm font-semibold text-cyan-100">
                      {step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/62">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-300/16 bg-cyan-400/8 p-4">
                <p className="text-sm font-semibold text-white">One-laptop testing tip</p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  If your webcam is already busy in one browser, the second browser can still join in audio or viewer mode and receive the volunteer’s stream.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <div className="flex flex-col gap-3 text-white sm:flex-row">
          {/* Search */}
          <div className="relative flex-1 text-white">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, or expertise..."
              className="w-full rounded-xl border border-white/15 bg-white/6
                          py-2.5 pl-9 pr-4 text-white placeholder:text-white/45
                          focus:outline-none focus:border-cyan-500/60 text-sm
                          transition-colors"
            />
          </div>

          {/* Expertise filter */}
          <label className="relative text-white">
            <select
              value={expertiseFilter}
              onChange={(e) => setExpertiseFilter(e.target.value)}
              className="h-11 appearance-none rounded-xl border border-white/15 bg-slate-900/95 px-4 pr-10
                          text-sm text-white transition-colors focus:border-cyan-500/60
                          focus:outline-none"
            >
              {[
                'All',
                'Technical',
                'Behavioral',
                'System Design',
                'HR',
                'Communication',
                'Leadership',
              ].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
          </label>

          {/* Sort */}
          <label className="relative text-white">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 appearance-none rounded-xl border border-white/15 bg-slate-900/95 px-4 pr-10
                          text-sm text-white transition-colors focus:border-cyan-500/60
                          focus:outline-none"
            >
              <option value="rating">Sort: Top Rated</option>
              <option value="coins">Sort: Lowest Cost</option>
              <option value="reviews">Sort: Most Reviews</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
          </label>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-white/78">
            {displayed.length} volunteer{displayed.length !== 1 ? 's' : ''} available
            {expertiseFilter !== 'All' && ` in ${expertiseFilter}`}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="animate-pulse bg-white/5 border border-white/10
                                       rounded-2xl h-64"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && displayed.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <Users className="w-12 h-12 text-white/20 mx-auto" />
            <h3 className="text-lg font-medium text-white/80">No volunteers found</h3>
            <p className="text-sm text-white/72">
              {searchQuery
                ? 'Try a different search term'
                : 'Be the first to volunteer in this category!'}
            </p>
          </div>
        )}

        {/* Volunteer cards grid */}
        {!loading && displayed.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((volunteer) => (
              <VolunteerCard
                key={volunteer.id || volunteer._id}
                volunteer={volunteer}
                onBook={() => handleBook(volunteer)}
              />
            ))}
          </div>
        )}

        {/* Booking modal */}
        {bookingTarget && (
          <VolunteerBookingModal
            volunteer={bookingTarget}
            userCoins={userCoins}
            onConfirm={handleBookingConfirm}
            onClose={() => setBookingTarget(null)}
          />
        )}

      </div>
    </div>
  );
}

function VolunteerCard({ volunteer, onBook }) {
  return (
    <div
      className="bg-white/5 border border-white/10 hover:border-cyan-500/30
                       rounded-2xl p-5 flex flex-col gap-4 transition-all
                       hover:bg-white/[0.07] group text-white"
    >
      {/* Header: avatar + name + rating */}
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-br
                           from-cyan-500/30 to-purple-500/30
                           border border-white/10
                           flex items-center justify-center shrink-0 text-lg font-bold text-white"
        >
          {volunteer.name?.[0]?.toUpperCase() || 'V'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{volunteer.name}</h3>
          <p className="truncate text-sm text-white/78">{volunteer.role}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-sm font-medium">
              {(volunteer.rating ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-white/55">
              ({volunteer.totalReviews ?? 0} reviews)
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-cyan-400 font-bold text-lg">
            <Coins className="w-4 h-4" />
            {volunteer.coinsCharged ?? 0}
          </div>
          <p className="text-xs text-white/55">/session</p>
        </div>
      </div>

      {/* Expertise tags */}
      <div className="flex flex-wrap gap-1.5">
        {(volunteer.expertise || []).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full bg-purple-500/20
                              text-purple-300 text-xs font-medium border border-purple-500/20"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bio */}
      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-white/74">
        {volunteer.bio ||
          'Experienced interviewer ready to help you improve your interview performance.'}
      </p>

      {/* Availability */}
      <div className="flex items-center gap-1.5 text-xs text-white/65">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{formatAvailability(volunteer.availability)}</span>
      </div>

      {/* Experience badge */}
      <div className="flex items-center gap-1.5 text-xs text-white/65">
        <Briefcase className="w-3.5 h-3.5 shrink-0" />
        <span>{volunteer.experience || 'Experience varies'}</span>
      </div>

      {/* Book button */}
      <button
        type="button"
        onClick={onBook}
        className="w-full bg-cyan-500 hover:bg-cyan-400
                      text-white font-semibold py-2.5 rounded-xl
                      transition-all text-sm
                      flex items-center justify-center gap-2
                      group-hover:shadow-lg group-hover:shadow-cyan-500/20"
      >
        <Coins className="w-4 h-4" />
        Book Session ({volunteer.coinsCharged ?? 0} coins)
      </button>
    </div>
  );
}
