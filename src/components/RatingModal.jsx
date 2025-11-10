// Rating Modal component - allows users to rate their interview experience
// Handles star ratings, feedback submission, and coin rewards based on rating

import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Star, Sparkles } from 'lucide-react';

// Rating details mapping stars to labels, coins, and descriptions
const RATING_DETAILS = {
  1: { label: 'Poor', coins: 0, color: 'text-red-500', description: 'Interview needs significant improvement' },
  2: { label: 'Below Average', coins: 0, color: 'text-orange-500', description: 'Some areas need work' },
  3: { label: 'Good', coins: 25, color: 'text-yellow-500', description: 'Decent interview with room for improvement' },
  4: { label: 'Very Good', coins: 40, color: 'text-blue-500', description: 'Great interview experience' },
  5: { label: 'Excellent', coins: 50, color: 'text-green-500', description: 'Outstanding interview experience' },
};

export function RatingModal({ open, onClose, interviewerName, onSubmit, isVolunteer = false }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Submit rating and feedback, then close modal
  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback);
      setRating(0);
      setFeedback('');
      onClose();
    }
  };

  const currentRating = hoveredRating || rating;
  const ratingInfo = RATING_DETAILS[currentRating];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Rate Your Interview Experience</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-white/70 mb-2">How was your interview with</p>
            <h3 className="text-white mb-6">{interviewerName}</h3>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= currentRating
                        ? `${ratingInfo?.color} fill-current`
                        : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Rating Info */}
            {ratingInfo && (
              <div className="bg-white/5 p-4 rounded-lg animate-pulse-slow">
                <div className={`text-xl mb-1 ${ratingInfo.color}`}>
                  {ratingInfo.label}
                </div>
                <p className="text-sm text-white/70 mb-3">
                  {ratingInfo.description}
                </p>
                {isVolunteer && (
                  <div className="flex items-center justify-center gap-2 bg-amber-500/20 px-4 py-2 rounded-lg">
                    <span className="text-2xl">🪙</span>
                    <span className="text-white">
                      {ratingInfo.coins > 0 ? (
                        <>Earn <strong>{ratingInfo.coins} coins</strong></>
                      ) : (
                        <span className="text-red-400">No coins earned</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feedback */}
          <div>
            <label className="block mb-2 text-white">
              Share Your Feedback {rating > 0 && <span className="text-green-400">(+5 bonus coins)</span>}
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience... (Optional but earns bonus coins)"
              className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Coin Breakdown for Candidates */}
          {!isVolunteer && rating > 0 && (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-white">Your Reward:</span>
              </div>
              <div className="space-y-1 text-sm text-white/80">
                <div className="flex justify-between">
                  <span>Completing interview:</span>
                  <span className="text-white">+10 coins</span>
                </div>
                {feedback.trim() && (
                  <div className="flex justify-between">
                    <span>Providing feedback:</span>
                    <span className="text-white">+5 coins</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-white/20">
                  <span className="text-white">Total:</span>
                  <span className="text-amber-400 font-semibold">
                    +{feedback.trim() ? 15 : 10} coins
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            size="lg"
          >
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}