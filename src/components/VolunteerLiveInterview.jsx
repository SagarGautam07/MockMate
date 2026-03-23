import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Copy,
  Link,
  RefreshCw,
  Sparkles,
  Users,
  Radio,
  Clock3,
} from 'lucide-react';

const RTC_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || window.location.origin;

function ensureReceiveTransceivers(pc, stream) {
  const existingKinds = pc.getTransceivers().map((transceiver) => transceiver.receiver.track?.kind);
  const hasLocalAudio = !!stream?.getAudioTracks().length;
  const hasLocalVideo = !!stream?.getVideoTracks().length;

  if (!hasLocalVideo && !existingKinds.includes('video')) {
    pc.addTransceiver('video', { direction: 'recvonly' });
  }

  if (!hasLocalAudio && !existingKinds.includes('audio')) {
    pc.addTransceiver('audio', { direction: 'recvonly' });
  }
}

function formatDuration(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getInitials(name) {
  return String(name || 'V')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'V';
}

export default function VolunteerLiveInterview({
  open,
  onClose,
  volunteerName = 'Volunteer',
  currentUserName = 'You',
  initialRoomId = '',
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const timerRef = useRef(null);

  const [status, setStatus] = useState('connecting');
  const [roomId, setRoomId] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [joined, setJoined] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [socketId, setSocketId] = useState('');
  const [peerCount, setPeerCount] = useState(0);
  const [lastSignalEvent, setLastSignalEvent] = useState('booting');
  const [remotePresent, setRemotePresent] = useState(false);
  const [joinMode, setJoinMode] = useState('camera');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const isWaitingForVolunteer = !remotePresent && peerCount === 0;

  const closeAllPeerConnections = useCallback(() => {
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setPeerCount(0);
    setRemotePresent(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    closeAllPeerConnections();

    if (socketRef.current) {
      try {
        socketRef.current.emit('leave-room');
      } catch (_) {}
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setSocketReady(false);
    setSocketId('');
    setLastSignalEvent('disconnected');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, [closeAllPeerConnections]);

  const syncLocalTracksToPeerConnections = useCallback(async () => {
    if (!localStreamRef.current) return;

    for (const [peerId, pc] of peerConnectionsRef.current.entries()) {
      ensureReceiveTransceivers(pc, localStreamRef.current);
      const senders = pc.getSenders();
      localStreamRef.current.getTracks().forEach((track) => {
        const existingSender = senders.find((sender) => sender.track?.kind === track.kind);
        if (existingSender) {
          existingSender.replaceTrack(track);
          return;
        }
        pc.addTrack(track, localStreamRef.current);
      });

      if (socketRef.current && pc.signalingState === 'stable') {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit('offer', { to: peerId, sdp: offer });
        setLastSignalEvent(`renegotiated:${peerId.slice(0, 5)}`);
      }
    }
  }, []);

  const getOrCreatePeerConnection = useCallback((peerId) => {
    const existing = peerConnectionsRef.current.get(peerId);
    if (existing) return existing;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    ensureReceiveTransceivers(pc, localStreamRef.current);

    pc.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current) return;
      socketRef.current.emit('ice-candidate', {
        to: peerId,
        candidate: event.candidate,
      });
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      }
      setRemotePresent(true);
      setStatus('live');
      setLastSignalEvent(`remote-track:${peerId.slice(0, 5)}`);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setStatus('live');
        setRemotePresent(true);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.play().catch(() => {});
        }
        setLastSignalEvent(`pc-connected:${peerId.slice(0, 5)}`);
      }
      if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
        setRemotePresent(false);
      }
    };

    peerConnectionsRef.current.set(peerId, pc);
    return pc;
  }, []);

  const joinRoom = useCallback((targetRoom) => {
    const cleaned = String(targetRoom || '').trim().toUpperCase();
    if (!cleaned) {
      setError('Enter a room code first');
      return;
    }
    if (!socketRef.current) {
      setError('Signaling server not connected yet');
      return;
    }
    setError('');
    setRoomId(cleaned);
    setRoomInput(cleaned);
    setJoined(true);
    setStatus('waiting');
    socketRef.current.emit('join-room', {
      roomId: cleaned,
      userName: currentUserName,
    });
  }, [currentUserName]);

  const setupSocket = useCallback((seedRoom) => {
    const socket = io(SIGNALING_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketReady(true);
      setSocketId(socket.id || '');
      setLastSignalEvent('socket-connected');
      joinRoom(seedRoom);
    });

    socket.on('room-peers', async ({ peers }) => {
      if (!Array.isArray(peers)) return;
      setPeerCount(peers.length);
      setLastSignalEvent(peers.length > 0 ? `room-peers:${peers.length}` : 'room-empty');
      if (peers.length === 0) {
        setStatus((prev) => (prev === 'ended' ? prev : 'waiting'));
        return;
      }

      for (const peerId of peers) {
        const pc = getOrCreatePeerConnection(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { to: peerId, sdp: offer });
        setLastSignalEvent(`offer-sent:${peerId.slice(0, 5)}`);
      }
    });

    socket.on('peer-joined', ({ peerId }) => {
      if (!peerId) return;
      setPeerCount((prev) => Math.max(prev, 1));
      setLastSignalEvent(`peer-joined:${peerId.slice(0, 5)}`);
      setStatus((prev) => (prev === 'ended' ? prev : 'waiting'));
    });

    socket.on('offer', async ({ from, sdp }) => {
      if (!from || !sdp) return;
      setLastSignalEvent(`offer-received:${from.slice(0, 5)}`);
      const pc = getOrCreatePeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { to: from, sdp: answer });
      setPeerCount((prev) => Math.max(prev, 1));
      setLastSignalEvent(`answer-sent:${from.slice(0, 5)}`);
    });

    socket.on('answer', async ({ from, sdp }) => {
      if (!from || !sdp) return;
      setLastSignalEvent(`answer-received:${from.slice(0, 5)}`);
      const pc = getOrCreatePeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      setStatus((prev) => (prev === 'ended' ? prev : 'live'));
      setPeerCount((prev) => Math.max(prev, 1));
    });

    socket.on('ice-candidate', async ({ from, candidate }) => {
      if (!from || !candidate) return;
      setLastSignalEvent(`ice:${from.slice(0, 5)}`);
      const pc = getOrCreatePeerConnection(from);
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (_) {}
    });

    socket.on('peer-left', ({ peerId }) => {
      const pc = peerConnectionsRef.current.get(peerId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(peerId);
      }
      setPeerCount((prev) => Math.max(0, prev - 1));
      setLastSignalEvent(`peer-left:${peerId?.slice(0, 5) || 'unknown'}`);
      setRemotePresent(false);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setStatus((prev) => (prev === 'ended' ? prev : 'waiting'));
    });

    socket.on('disconnect', () => {
      setSocketReady(false);
      setLastSignalEvent('socket-disconnected');
    });
  }, [getOrCreatePeerConnection, joinRoom]);

  const requestMedia = useCallback(async () => {
    const constraints = [
      { video: true, audio: true },
      { video: true, audio: false },
      { video: false, audio: true },
    ];

    let lastError = null;
    for (const c of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(c);
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop());
        }
        localStreamRef.current = stream;
        setJoinMode(
          stream.getVideoTracks().length > 0
            ? 'camera'
            : stream.getAudioTracks().length > 0
              ? 'audio'
              : 'viewer'
        );
        setCamOn(stream.getVideoTracks().some((t) => t.enabled));
        setMicOn(stream.getAudioTracks().some((t) => t.enabled));
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setRemotePresent(false);
        setError('');
        return stream;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Could not access camera/microphone.');
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    setStatus('connecting');
    setError('');
    setSeconds(0);
    setMicOn(true);
    setCamOn(true);
    setJoined(false);
    setRemotePresent(false);
    setSocketReady(false);
    setSocketId('');
    setPeerCount(0);
    setLastSignalEvent('booting');
    setJoinMode('camera');
    setCopied(false);

    const seedRoom = initialRoomId || makeRoomCode();
    setRoomInput(seedRoom);
    setRoomId('');

    requestMedia()
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setupSocket(seedRoom);
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      })
      .catch((err) => {
        setStatus('waiting');
        setJoinMode('viewer');
        setError(
          err?.name === 'NotAllowedError'
            ? 'Camera/microphone permission denied. Joining as viewer mode. You can still receive the other person and Retry Camera later.'
            : err?.name === 'NotReadableError'
              ? 'Camera is already being used by another browser/app on this laptop. Joining as viewer mode here is expected.'
              : 'Could not access camera/microphone. Joining as viewer mode. You can Retry Camera later.'
        );
        setupSocket(seedRoom);
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [cleanup, initialRoomId, open, requestMedia, setupSocket]);

  const callLabel = useMemo(() => {
    if (status === 'connecting') return 'Connecting...';
    if (status === 'waiting') return 'Waiting for peer to join';
    if (status === 'ended') return 'Call ended';
    return 'Live interview';
  }, [status]);

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
  };

  const toggleCam = () => {
    const next = !camOn;
    setCamOn(next);
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
  };

  const copyRoomCode = async () => {
    if (!roomInput) return;
    try {
      await navigator.clipboard.writeText(roomInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (_) {}
  };

  const copyInviteLink = async () => {
    const code = roomId || roomInput;
    if (!code) return;
    const current = new URL(window.location.href);
    const parts = current.pathname.split('/').filter(Boolean);
    const volunteerIdx = parts.findIndex((p) => p.toLowerCase() === 'volunteer');
    const baseParts = volunteerIdx >= 0 ? parts.slice(0, volunteerIdx) : parts;
    const volunteerPath = `/${[...baseParts, 'volunteer'].join('/')}`;
    const inviteUrl = new URL(window.location.origin + volunteerPath);
    inviteUrl.searchParams.set('room', code);
    const invite = inviteUrl.toString();
    try {
      await navigator.clipboard.writeText(invite);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 1200);
    } catch (_) {}
  };

  const retryCamera = useCallback(async () => {
    try {
      setStatus('connecting');
      await requestMedia();
      await syncLocalTracksToPeerConnections();
      if (joined) setStatus('waiting');
    } catch (err) {
      setStatus('waiting');
      setJoinMode('viewer');
      setError(
        err?.name === 'NotAllowedError'
          ? 'Camera or microphone permission denied. Staying in viewer mode until permissions are allowed.'
          : err?.name === 'NotReadableError'
            ? 'Camera is already in use on this laptop. Stay in viewer mode on this browser or close the other camera session.'
            : 'Still unable to access camera/microphone. Staying in viewer mode.'
      );
    }
  }, [joined, requestMedia, syncLocalTracksToPeerConnections]);

  const endCall = () => {
    setStatus('ended');
    cleanup();
  };

  if (!open) return null;

  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden rounded-[32px] border border-cyan-400/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.10),_transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.98))] shadow-[0_28px_120px_rgba(2,6,23,0.62)]">
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/90">
              <Radio className="h-3.5 w-3.5" />
              Live Volunteer Session
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">Volunteer Video Interview</h3>
            <p className="text-sm text-white/50">
              {callLabel} with {volunteerName} - {formatDuration(seconds)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/70 transition hover:bg-white/14 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-white/8 px-4 py-4">
          <div className="rounded-[24px] border border-white/8 bg-slate-950/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex flex-1 items-center gap-2">
                <Link className="h-4 w-4 text-cyan-400" />
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                  placeholder="Room code"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:min-w-[430px]">
                <button
                  type="button"
                  onClick={() => joinRoom(roomInput || makeRoomCode())}
                  disabled={!socketReady}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_rgba(34,211,238,0.22)] transition hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {joined ? 'Rejoin' : 'Join Room'}
                </button>
                <button
                  type="button"
                  onClick={copyRoomCode}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/10 px-4 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/14"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/16"
                >
                  <Link className="h-3.5 w-3.5" />
                  {inviteCopied ? 'Invite Copied' : 'Copy Invite Link'}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300/75">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
                <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
                {formatDuration(seconds)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-cyan-300" />
                {peerCount > 0 ? `${peerCount + 1} participants` : 'Waiting for volunteer'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Mode: {joinMode}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-white/40">
            Share room code: <span className="text-cyan-300">{roomId || roomInput || '-'}</span>
          </p>
        </div>

        <div className="p-4 md:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.86),rgba(15,23,42,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_35%)]" />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                controls={false}
                className={`h-full w-full object-cover ${remotePresent ? '' : 'hidden'}`}
              />
              {!remotePresent && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full max-w-md rounded-[28px] border border-cyan-400/12 bg-slate-950/72 p-6 text-center shadow-[0_25px_70px_rgba(2,6,23,0.45)] backdrop-blur">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-cyan-100">
                      <span className="text-2xl font-semibold">{getInitials(volunteerName)}</span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm uppercase tracking-[0.22em] text-cyan-300/70">Volunteer</p>
                      <h4 className="mt-2 text-xl font-semibold text-white md:text-2xl">{volunteerName}</h4>
                      <p className="mt-3 text-sm leading-6 text-slate-300/75">
                        {peerCount > 0
                          ? `${volunteerName} is in the room. Their video will appear as soon as their media starts.`
                          : `Invite ${volunteerName} using the room code or invite link. When they join, their video will appear here.`}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-slate-200">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                        {peerCount > 0 ? 'Connected to room' : 'Waiting for join'}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-slate-200">
                        Room {roomId || roomInput || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                {remotePresent ? 'Volunteer Live' : 'Volunteer Waiting'}
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div className="rounded-2xl bg-black/45 px-3 py-2 backdrop-blur">
                  <p className="text-xs text-white/50">Connected with</p>
                  <p className="text-sm font-semibold text-white">{volunteerName}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs font-semibold text-white/80">
                  {remotePresent ? 'Live video' : 'Waiting'}
                </div>
              </div>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${camOn ? '' : 'hidden'}`}
                style={{ transform: 'scaleX(-1)' }}
              />
              {!camOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white/40">
                  <VideoOff className="w-8 h-8" />
                  <p className="text-sm">
                    {joinMode === 'viewer'
                      ? 'This browser joined without camera. That is normal if another browser is already using the laptop camera.'
                      : 'Camera is off.'}
                  </p>
                </div>
              )}
              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                You
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="rounded-2xl bg-black/45 px-3 py-2 backdrop-blur">
                  <p className="text-xs text-white/50">Participant</p>
                  <p className="text-sm font-semibold text-white">{currentUserName || 'You'}</p>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {camOn ? 'Camera live' : 'Viewer mode'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Socket</p>
              <p className="mt-1 text-sm font-semibold text-white">{socketReady ? 'Connected' : 'Offline'}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Room</p>
              <p className="mt-1 font-mono text-sm text-white">{roomId || roomInput || '-'}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Peers</p>
              <p className="mt-1 text-sm font-semibold text-white">{peerCount}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Mode</p>
              <p className="mt-1 text-sm font-semibold capitalize text-white">{joinMode}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.045] px-4 py-4 md:col-span-2 xl:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Signal</p>
              <p className="mt-2 text-sm font-medium text-white">{lastSignalEvent}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.045] px-4 py-4 md:col-span-2 xl:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Session status</p>
              <p className="mt-2 text-sm font-medium text-white">
                {isWaitingForVolunteer ? `Waiting for ${volunteerName}` : 'Interview in progress'}
              </p>
            </div>
          </div>

          {isWaitingForVolunteer && (
            <div className="mt-4 rounded-[28px] border border-cyan-400/12 bg-slate-950/72 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
              <h4 className="text-base font-semibold text-white">Waiting for {volunteerName}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-300/75">
                Share the room code or invite link. Both interview tiles stay the same size, and this volunteer tile will switch to live video as soon as they join.
              </p>
              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Socket ID</p>
                <p className="mt-2 truncate font-mono text-xs text-white/45">{socketId || '-'}</p>
              </div>
            </div>
          )}

          {!isWaitingForVolunteer && socketId && (
            <p className="mt-4 px-1 text-[11px] font-mono text-white/30">
              Socket ID: {socketId}
            </p>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={retryCamera}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-red-400/40 bg-red-500/20 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/30"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Camera
            </button>
          </div>
        )}

        <div className="px-4 pb-5">
          <div className="mx-auto flex w-fit items-center justify-center gap-3 rounded-full border border-white/10 bg-slate-950/82 px-4 py-3 shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur">
            <button
              type="button"
              onClick={toggleMic}
              className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_10px_30px_rgba(2,6,23,0.35)] transition ${
                micOn
                  ? 'bg-white/12 border-white/18 text-white hover:bg-white/18'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={toggleCam}
              className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_10px_30px_rgba(2,6,23,0.35)] transition ${
                camOn
                  ? 'bg-white/12 border-white/18 text-white hover:bg-white/18'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}
            >
              {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={endCall}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/40 bg-red-500/20 text-red-300 shadow-[0_10px_30px_rgba(127,29,29,0.35)] transition hover:bg-red-500/30"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

