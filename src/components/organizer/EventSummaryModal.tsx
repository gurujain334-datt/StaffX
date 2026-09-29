import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CheckCircle2, TrendingUp, Users, CreditCard, Clock, Star } from 'lucide-react';

export interface EventSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
}

export const EventSummaryModal: React.FC<EventSummaryModalProps> = ({
  isOpen,
  onClose,
  eventId,
}) => {
  const { events, requirements, assignments, attendance, payments, reviews } = useApp();

  const event = eventId ? events.find(e => e.id === eventId) : null;

  const stats = useMemo(() => {
    if (!eventId) return null;

    const eventReqs = requirements.filter(r => r.eventId === eventId);
    const eventAsgs = assignments.filter(a => a.eventId === eventId);
    const eventAtts = attendance.filter(a => a.eventId === eventId);
    const eventPays = payments.filter(p => p.eventId === eventId);
    
    // Professionals/Reviews where assignment is for this event
    const eventReviews = reviews.filter(r => r.reviewerRole === 'ORGANIZER' && eventAsgs.some(a => a.id === r.assignmentId));

    const totalNeeded = eventReqs.reduce((sum, r) => sum + r.requiredQuantity, 0);
    const totalHired = eventAsgs.length;
    
    const checkedInCount = eventAtts.filter(a => a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;
    const completedCount = eventAtts.filter(a => a.status === 'CHECKED_OUT').length;
    const absentCount = eventAtts.filter(a => a.status === 'ABSENT').length;

    const totalCost = eventPays.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = eventPays.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    
    const avgRating = eventReviews.length > 0 
      ? (eventReviews.reduce((sum, r) => sum + r.rating, 0) / eventReviews.length).toFixed(1)
      : 'N/A';

    return {
      totalNeeded,
      totalHired,
      checkedInCount,
      completedCount,
      absentCount,
      totalCost,
      totalPaid,
      avgRating,
      attendanceRate: totalHired > 0 ? Math.round((checkedInCount / totalHired) * 100) : 0,
    };
  }, [eventId, requirements, assignments, attendance, payments, reviews]);

  if (!event || !stats) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Performance Summary"
      description={`Final report for ${event.name}`}
      maxWidth="md"
    >
      <div className="space-y-6 pt-2">
        {/* Banner */}
        <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-400">Event Successfully Completed</h4>
            <p className="text-xs text-slate-400 mt-1">All staffing shifts have been finalized. The event is now marked as completed in your history.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Workforce</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-2xl font-black text-white">{stats.totalHired}</span>
                <span className="text-xs text-slate-500 ml-1">/ {stats.totalNeeded} Hired</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 space-y-1">
              <div className="flex justify-between"><span>Checked In:</span> <span className="font-bold text-slate-300">{stats.checkedInCount}</span></div>
              <div className="flex justify-between"><span>Completed:</span> <span className="font-bold text-slate-300">{stats.completedCount}</span></div>
              <div className="flex justify-between"><span>Absent:</span> <span className="font-bold text-red-400">{stats.absentCount}</span></div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Payments</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-2xl font-black text-indigo-400">₹{stats.totalCost.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Total Staff Cost</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 space-y-1">
              <div className="flex justify-between"><span>Paid:</span> <span className="font-bold text-emerald-400">₹{stats.totalPaid.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Pending:</span> <span className="font-bold text-amber-400">₹{(stats.totalCost - stats.totalPaid).toLocaleString()}</span></div>
            </div>
          </div>

          <div className="col-span-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
             <div>
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Performance</span>
                </div>
                <div className="text-[11px] text-slate-400">Average Staff Rating</div>
             </div>
             <div className="text-2xl font-black text-amber-400 flex items-center gap-1.5">
               {stats.avgRating} <Star className="w-5 h-5 fill-amber-400" />
             </div>
          </div>
          
          <div className="col-span-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
             <div>
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Attendance</span>
                </div>
                <div className="text-[11px] text-slate-400">Show-up Rate</div>
             </div>
             <div className="text-2xl font-black text-emerald-400">
               {stats.attendanceRate}%
             </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="primary" onClick={onClose}>
            Close Report
          </Button>
        </div>
      </div>
    </Modal>
  );
};
