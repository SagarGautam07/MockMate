// VolunteerBookingModal.jsx
// Modal for booking a volunteer interview session

import { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Coins,
  CheckCircle,
  User,
  Star,
} from 'lucide-react';
import { getApiErrorMessage } from '../utils/errorMessage';

/**
 * @param {{
 *   volunteer: any,
 *   userCoins: number,
 *   onConfirm: (bookingData: any) => Promise<void>,
 *   onClose: () => void,
 * }} props
 */
export default function VolunteerBookingModal({ volunteer, userCoins, onConfirm, onClose }) {
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const availabilityText = Array.isArray(volunteer.availability)
    ? volunteer.availability
      .map((entry) => {
        if (!entry?.day) return null;
        const slots = Array.isArray(entry.slots) && entry.slots.length
          ? ` (${entry.slots.join(', ')})`
          : '';
        return `${entry.day}${slots}`;
      })
      .filter(Boolean)
      .join(', ')
    : (volunteer.availability || 'Availability not provided');
  const cost = volunteer.coinsCharged || 0;
  const canAfford = userCoins >= cost;

  // Simple preset slots for now
  const timeSlots = ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];

  const dayToIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const getScheduledAtIso = () => {
    const targetDay = dayToIndex[selectedDay];
    const match = selectedSlot.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
    if (targetDay == null || !match) return new Date().toISOString();

    const [, hh, mm, ap] = match;
    let hours = Number(hh) % 12;
    if (ap === 'PM') hours += 12;
    const minutes = Number(mm);

    const now = new Date();
    const next = new Date(now);
    const diff = (targetDay - now.getDay() + 7) % 7;
    next.setDate(now.getDate() + diff);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 7);
    return next.toISOString();
  };

  const handleConfirm = async () => {
    if (!selectedDay) {
      setError('Please select a day');
      return;
    }
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    if (!canAfford) {
      setError('Insufficient coins');
      return;
    }

    setError('');
    setConfirming(true);
    try {
      await onConfirm({
        volunteerId: volunteer.id || volunteer._id,
        slot: selectedSlot,
        scheduledAt: getScheduledAtIso(),
        day: selectedDay,
      });
      setConfirmed(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Booking failed. Please try again.'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">Book a Session</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success state */}
        {confirmed ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-1">Session Booked!</h3>
              <p className="text-white/60 text-sm">
                Your session with {volunteer.name} is confirmed for {selectedDay} at{' '}
                {selectedSlot}.
              </p>
              <p className="text-cyan-400 text-sm mt-2">
                {cost} coins deducted from your balance.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold
                         px-6 py-2.5 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Volunteer info */}
            <div
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5
                            border border-white/10"
            >
              <div
                className="w-12 h-12 rounded-full bg-cyan-500/20
                              flex items-center justify-center shrink-0"
              >
                <User className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{volunteer.name}</p>
                <p className="text-white/60 text-sm truncate">{volunteer.role}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 text-xs font-medium">
                    {volunteer.rating}
                  </span>
                  <span className="text-white/40 text-xs">
                    ({volunteer.totalReviews} reviews)
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-cyan-400 font-bold">
                  <Coins className="w-4 h-4" />
                  <span>{cost}</span>
                </div>
                <p className="text-white/40 text-xs">per session</p>
              </div>
            </div>

            {/* Availability info */}
            <div className="flex items-start gap-2 text-sm text-white/60">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-white/40" />
              <span>Availability: {availabilityText}</span>
            </div>

            {/* Day selector */}
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">
                Select Day
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedDay === day
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slot selector */}
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">
                Select Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-all
                                flex items-center justify-center gap-1.5 ${
                                  selectedSlot === slot
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                                }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {slot} IST
                  </button>
                ))}
              </div>
            </div>

            {/* Coin balance warning */}
            {!canAfford && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg
                              bg-red-500/10 border border-red-500/30 text-sm"
              >
                <Coins className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-red-300">
                  You need {cost} coins. You have {userCoins}. Complete more interviews to
                  earn coins.
                </span>
              </div>
            )}

            {/* Error */}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirming || !canAfford}
              className="w-full bg-cyan-500 hover:bg-cyan-400
                         disabled:bg-cyan-500/30 disabled:cursor-not-allowed
                         text-white font-semibold py-3 rounded-xl
                         transition-all flex items-center justify-center gap-2"
            >
              {confirming ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-white/30 border-t-white
                                  rounded-full animate-spin"
                  />
                  Confirming...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  Confirm ({cost} coins)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
