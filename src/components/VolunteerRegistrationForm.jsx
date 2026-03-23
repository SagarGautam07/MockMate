// VolunteerRegistrationForm.jsx — v7 complete rewrite
// NO <form> tags. All buttons have type="button". Full error handling.

import { useState } from 'react';
import { X, CheckCircle, Loader2, Clock } from 'lucide-react';
import { volunteerAPI } from '../services/api';
import { useAuth }       from '../contexts/AuthContext';
import { useToast }      from './Toast';

const EXPERTISE  = ['Technical', 'Behavioral', 'System Design', 'HR', 'Communication', 'Leadership'];
const DAYS       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EXPERIENCE = ['1-2 years', '3-5 years', '5-10 years', '10+ years'];
const TIMES      = [
  { v: 'morning',   l: 'Morning  (8 AM – 12 PM)'   },
  { v: 'afternoon', l: 'Afternoon (12 PM – 5 PM)'  },
  { v: 'evening',   l: 'Evening  (5 PM – 10 PM)'   },
];

export default function VolunteerRegistrationForm({ onClose, onSuccess }) {
  const { user }  = useAuth();
  const { toast } = useToast();

  const [busy,      setBusy]      = useState(false);
  const [done,      setDone]      = useState(false);
  const [fieldErrs, setFieldErrs] = useState({});

  const [f, setF] = useState({
    name:    user?.displayName || '',
    role:    '',
    exp:     '',
    skills:  [],
    days:    [],
    time:    '',
    coins:   30,
    bio:     '',
  });

  const set  = (k, v) => { setF(p => ({ ...p, [k]: v })); setFieldErrs(p => ({ ...p, [k]: '' })); };
  const tog  = (k, v) => setF(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }));

  function validate() {
    const e = {};
    if (!f.name.trim())    e.name   = 'Name is required';
    if (!f.role.trim())    e.role   = 'Role and company is required';
    if (!f.exp)            e.exp    = 'Select your experience level';
    if (!f.skills.length)  e.skills = 'Select at least one expertise area';
    if (!f.days.length)    e.days   = 'Select at least one available day';
    if (!f.time)           e.time   = 'Select a time slot';
    if (f.bio.trim().length < 5) e.bio = 'Bio must be at least 5 characters';
    const c = Number(f.coins);
    if (!c || c < 10 || c > 200) e.coins = 'Coins must be 10–200';
    return e;
  }

  async function submit() {
    if (!user)  { toast.error('Please sign in first'); return; }
    if (busy)   return;

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrs(errs);
      toast.warning(Object.values(errs)[0] || 'Please fix the highlighted fields');
      return;
    }

    setBusy(true);
    setFieldErrs({});

    try {
      const res = await volunteerAPI.register({
        name:         f.name.trim(),
        role:         f.role.trim(),
        experience:   f.exp,
        expertise:    f.skills,
        availability: f.days.map(d => ({ day: d, slots: [f.time] })),
        coinsCharged: Number(f.coins),
        bio:          f.bio.trim(),
      });
      setDone(true);
      toast.success(res?.message || 'Application submitted successfully.');
      if (onSuccess) onSuccess(res);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Submission failed — please try again';
      toast.error(msg);
      setFieldErrs({ _: msg });
    } finally {
      setBusy(false);
    }
  }

  /* ── Success screen ─────────────────────────────────── */
  if (done) return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center
                      justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-white font-bold text-xl mb-2">Application Submitted!</h3>
      <p className="text-white/60 text-sm mb-6">
        You will be approved and visible to candidates within 24 hours.
      </p>
      <button type="button" onClick={onClose}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold
                         px-6 py-2.5 rounded-xl transition-colors">
        Close
      </button>
    </div>
  );

  /* ── Form ───────────────────────────────────────────── */
  const inp = (err) =>
    `w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white placeholder-white/30
     focus:outline-none text-sm transition-colors ${err ? 'border-red-500/60' : 'border-white/10 focus:border-cyan-500/60'}`;

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <h2 className="text-white font-bold text-lg">Become a Volunteer</h2>
          <p className="text-white/50 text-sm">Help candidates and earn coins</p>
        </div>
        <button type="button" onClick={onClose}
                className="text-white/40 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body — plain div, NOT a <form> */}
      <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

        {fieldErrs._ && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30
                          text-red-300 text-sm">
            {fieldErrs._}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-1.5">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input type="text" value={f.name} onChange={e => set('name', e.target.value)}
                 placeholder="Your full name" className={inp(fieldErrs.name)} />
          {fieldErrs.name && <p className="text-red-400 text-xs mt-1">{fieldErrs.name}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-1.5">
            Current Role &amp; Company <span className="text-red-400">*</span>
          </label>
          <input type="text" value={f.role} onChange={e => set('role', e.target.value)}
                 placeholder="e.g. Senior Engineer at Google" className={inp(fieldErrs.role)} />
          {fieldErrs.role && <p className="text-red-400 text-xs mt-1">{fieldErrs.role}</p>}
        </div>

        {/* Experience */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-1.5">
            Years of Experience <span className="text-red-400">*</span>
          </label>
          <select value={f.exp} onChange={e => set('exp', e.target.value)}
                  className={inp(fieldErrs.exp).replace('placeholder-white/30', '')
                             .replace('bg-white/5', 'bg-slate-800')}>
            <option value="" disabled>Select level</option>
            {EXPERIENCE.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {fieldErrs.exp && <p className="text-red-400 text-xs mt-1">{fieldErrs.exp}</p>}
        </div>

        {/* Expertise */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-2">
            Expertise Areas <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EXPERTISE.map(opt => (
              <button key={opt} type="button" onClick={() => tog('skills', opt)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                  border transition-all text-left ${
                        f.skills.includes(opt)
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}>
                <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center
                                  justify-center ${f.skills.includes(opt)
                                    ? 'bg-cyan-500 border-cyan-500' : 'border-white/30'}`}>
                  {f.skills.includes(opt) && (
                    <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                      <polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="white"
                                strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            ))}
          </div>
          {fieldErrs.skills && <p className="text-red-400 text-xs mt-1">{fieldErrs.skills}</p>}
        </div>

        {/* Days */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-2">
            Available Days <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(d => (
              <button key={d} type="button" onClick={() => tog('days', d)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border
                                  transition-all ${f.days.includes(d)
                                    ? 'bg-cyan-500 border-cyan-500 text-white'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}>
                {d}
              </button>
            ))}
          </div>
          {fieldErrs.days && <p className="text-red-400 text-xs mt-1">{fieldErrs.days}</p>}
        </div>

        {/* Time slot */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-2">
            Time Slot <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {TIMES.map(t => (
              <button key={t.v} type="button" onClick={() => set('time', t.v)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                                  border text-sm transition-all text-left ${f.time === t.v
                                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}>
                <Clock className="w-4 h-4 shrink-0" />
                {t.l}
              </button>
            ))}
          </div>
          {fieldErrs.time && <p className="text-red-400 text-xs mt-1">{fieldErrs.time}</p>}
        </div>

        {/* Coins */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-1.5">
            Coins Per Session
            <span className="text-white/40 font-normal ml-1 text-xs">(10–200)</span>
          </label>
          <input type="number" min={10} max={200} value={f.coins}
                 onChange={e => set('coins', e.target.value)}
                 className={inp(fieldErrs.coins)} />
          {fieldErrs.coins && <p className="text-red-400 text-xs mt-1">{fieldErrs.coins}</p>}
        </div>

        {/* Bio */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-1.5">
            Short Bio <span className="text-red-400">*</span>
            <span className={`ml-1 text-xs font-normal ${f.bio.length > 280 ? 'text-red-400' : 'text-white/40'}`}>
              ({f.bio.length}/300)
            </span>
          </label>
          <textarea rows={4} value={f.bio}
                    onChange={e => set('bio', e.target.value.slice(0, 300))}
                    placeholder="Describe your background and how you can help..."
                    className={inp(fieldErrs.bio) + ' resize-none'} />
          {fieldErrs.bio && <p className="text-red-400 text-xs mt-1">{fieldErrs.bio}</p>}
        </div>

      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 flex gap-3">
        <button type="button" onClick={onClose}
                className="flex-1 border border-white/20 text-white/70 hover:text-white
                           hover:bg-white/5 font-medium py-2.5 rounded-xl text-sm transition-all">
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={busy}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30
                           disabled:cursor-not-allowed text-white font-semibold py-2.5
                           rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Application'}
        </button>
      </div>

    </div>
  );
}
