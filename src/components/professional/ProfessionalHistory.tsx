import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import { Star, Briefcase } from 'lucide-react';

export const ProfessionalHistory: React.FC = () => {
  const { assignments, events, currentProfessional, reviews, payments } = useApp();
  const proId = currentProfessional?.id;
  const myCompletedAssignments = assignments.filter(a => proId && a.professionalId === proId && a.status === 'COMPLETED');

  if (myCompletedAssignments.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-indigo-400" />
        Verified Work History
      </h3>
      <div className="space-y-3">
        {myCompletedAssignments.map(asg => {
          const ev = events.find(e => e.id === asg.eventId);
          const asgReview = reviews.find(r => r.assignmentId === asg.id && r.reviewerRole === 'ORGANIZER');
          const asgPayment = payments.find(p => p.assignmentId === asg.id);

          return (
            <Card key={asg.id} padding="md" className="border-slate-800 bg-slate-900/50">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white">{ev?.name || 'Completed Event'}</h4>
                  <div className="text-sm text-indigo-400 font-semibold">{asg.role}</div>
                  <div className="text-xs text-slate-500 mt-1">{ev?.startDate} • {ev?.venue}</div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2">
                  <div className="text-lg font-black text-white">₹{asgPayment?.amount || asg.agreedRate}</div>
                  {asgReview && (
                    <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                      {asgReview.rating.toFixed(1)} <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                  )}
                  {!asgReview && <StatusBadge status={asg.status} />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
