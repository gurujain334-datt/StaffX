import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Star, MessageSquare } from 'lucide-react';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  targetUserId: string;
  targetUserName: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  targetUserId,
  targetUserName
}) => {
  const { submitReview, addToast } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(assignmentId, targetUserId, rating, comment);
    addToast('Review submitted successfully.', 'success', 'Review Added');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review ${targetUserName}`}
      description="Leave a rating and comment based on your experience."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-hidden cursor-pointer"
              >
                <Star
                  className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-700'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Comment</label>
          <textarea
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
            rows={4}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Describe their performance, punctuality, etc."
            required
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Submit Review</Button>
        </div>
      </form>
    </Modal>
  );
};
