import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2, RefreshCw, Shield } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useToast } from './Toast';

export function AdminPanel({ onNavigate }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [users, setUsers] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [ov, vol, usr] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getVolunteers('all'),
        adminAPI.getUsers(),
      ]);
      setOverview(ov);
      setVolunteers(vol?.volunteers || []);
      setUsers(usr?.users || []);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to load admin data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setApproval = async (volunteerId, isApproved) => {
    setSavingId(volunteerId);
    try {
      await adminAPI.setVolunteerApproval(volunteerId, isApproved);
      toast.success(isApproved ? 'Volunteer approved' : 'Volunteer moved to pending');
      await load();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Update failed';
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-white/60 text-sm">Manage volunteers, users, and platform overview</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => onNavigate('home')} className="bg-cyan-500 hover:bg-cyan-400 text-white">
              Back Home
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-4 border-red-500/40 bg-red-500/10">
            <div className="flex items-start gap-2 text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ['Users', overview?.users],
            ['Approved Volunteers', overview?.approvedVolunteers],
            ['Pending Volunteers', overview?.pendingVolunteers],
            ['Completed Interviews', overview?.completedInterviews],
            ['Bookings', overview?.bookings],
          ].map(([k, v]) => (
            <Card key={k} className="p-4 bg-white/5 border-white/10">
              <p className="text-white/50 text-xs">{k}</p>
              <p className="text-white text-2xl font-bold mt-1">{loading ? '...' : (v ?? 0)}</p>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-white/5 border-white/10">
          <h2 className="text-white font-semibold mb-3">Volunteer Approvals</h2>
          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
            {(volunteers || []).map((v) => (
              <div key={v._id} className="p-3 rounded-xl border border-white/10 bg-slate-900/40 flex items-center justify-between gap-3">
                <div>
                  <p className="text-white font-medium">{v.name}</p>
                  <p className="text-white/50 text-xs">{v.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={v.isApproved ? 'bg-emerald-500 text-white border-0' : 'bg-amber-500 text-white border-0'}>
                      {v.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                    <span className="text-white/40 text-xs">{v.coinsCharged} coins/session</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={savingId === v._id || v.isApproved}
                    onClick={() => setApproval(v._id, true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    disabled={savingId === v._id || !v.isApproved}
                    onClick={() => setApproval(v._id, false)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Pending
                  </Button>
                </div>
              </div>
            ))}
            {!loading && volunteers.length === 0 && (
              <p className="text-white/50 text-sm">No volunteers found.</p>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-white/5 border-white/10">
          <h2 className="text-white font-semibold mb-3">Recent Users</h2>
          <div className="space-y-2 max-h-[30vh] overflow-y-auto">
            {(users || []).slice(0, 30).map((u) => (
              <div key={u._id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/30 border border-white/10">
                <div>
                  <p className="text-white text-sm">{u.name}</p>
                  <p className="text-white/40 text-xs">{u.email}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    {u.role}
                  </Badge>
                  <p className="text-white/40 text-xs mt-1">{u.coins ?? 0} coins</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

