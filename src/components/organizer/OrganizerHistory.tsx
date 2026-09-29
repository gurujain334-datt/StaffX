import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import { Star, Building2, Users } from 'lucide-react';

export const OrganizerHistory: React.FC = () => {
  const { events, organizerProfile, reviews, assignments, payments, attendance } = useApp();
  const orgId = organizerProfile?.id;
  const myCompletedEvents = events.filter(e => orgId && e.organizerId === orgId && e.status === 'COMPLETED');

  if (myCompletedEvents.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Building2 className="w-5 h-5 text-indigo-400" />
        Verified Event History
      </h3>
      <div className="space-y-3">
        {myCompletedEvents.map(ev => {
          const evAssignments = assignments.filter(a => a.eventId === ev.id);
          const evAttendance = attendance.filter(a => a.eventId === ev.id);
          const checkedIn = evAttendance.filter(a => a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;
          
          const evPayments = payments.filter(p => p.eventId === ev.id);
          const totalCost = evPayments.reduce((acc, p) => acc + p.amount, 0);

          const evReviews = reviews.filter(r => r.reviewerRole === 'PROFESSIONAL' && evAssignments.some(a => a.id === r.assignmentId));
          const avgRating = evReviews.length > 0 ? evReviews.reduce((acc, r) => acc + r.rating, 0) / evReviews.length : null;

          return (
            <Card key={ev.id} padding="md" className="border-slate-800 bg-slate-900/50">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white">{ev.name}</h4>
                  <div className="text-xs text-slate-500 mt-1">{ev.startDate} • {ev.venue}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {checkedIn}/{evAssignments.length} Attended</span>
                    <span>Total Cost: ₹{totalCost.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2">
                  <StatusBadge status={ev.status} />
                  {avgRating && (
                    <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                      {avgRating.toFixed(1)} <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
