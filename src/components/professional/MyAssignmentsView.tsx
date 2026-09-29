import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { QRScannerModal } from './QRScannerModal';
import { ReviewModal } from '../shared/ReviewModal';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight
} from 'lucide-react';

export const MyAssignmentsView: React.FC = () => {
  const { assignments, events, attendance, currentProfessional } = useApp();
  const [selectedAsgForScan, setSelectedAsgForScan] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ assignmentId: string; userId: string; userName: string } | null>(null);

  const proId = currentProfessional?.id;
  const myAssignments = assignments.filter(a => proId ? a.professionalId === proId : false);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">My Confirmed Shifts & Assignments</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Active roster assignments, event details, and on-site check-in controls
        </p>
      </div>

      {myAssignments.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-slate-400" />}
          title="No confirmed assignments yet"
          description="Browse available gigs in the feed and submit applications to start working events."
        />
      ) : (
        <div className="space-y-4">
          {myAssignments.map(asg => {
            const ev = events.find(e => e.id === asg.eventId);
            const att = attendance.find(a => a.assignmentId === asg.id);

            return (
              <Card key={asg.id} padding="lg" className="border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={asg.status} />
                      <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800">
                        {asg.role}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{ev?.name || 'Event Assignment'}</h3>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{ev?.venue}, {ev?.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{ev?.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{ev?.startTime} - {ev?.endTime}</span>
                      </div>
                    </div>

                    {/* Attendance Verification state box */}
                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400">Attendance Status:</span>
                        {att?.status === 'CHECKED_IN' ? (
                          <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Present (Checked in at {att.checkInAt})
                          </span>
                        ) : att?.status === 'CHECKED_OUT' ? (
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            Completed Shift (Out at {att.checkOutAt})
                          </span>
                        ) : (
                          <span className="font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Pending On-Site Check-In
                          </span>
                        )}
                      </div>

                      {att?.durationFormatted && (
                        <span className="text-slate-500 dark:text-slate-400">Logged: <strong className="text-white">{att.durationFormatted}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Right Action column */}
                  <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0 shrink-0 space-y-3">
                    <div className="text-right">
                      <span className="text-xl font-black text-white">₹{asg.agreedRate}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Daily Contract</span>
                    </div>

                    {att?.status !== 'CHECKED_OUT' && (
                      <Button
                        variant={att?.status === 'CHECKED_IN' ? 'secondary' : 'primary'}
                        size="sm"
                        icon={<QrCode className="w-4 h-4" />}
                        onClick={() => setSelectedAsgForScan(asg.id)}
                      >
                        {att?.status === 'CHECKED_IN' ? 'Scan Check-Out QR' : 'Scan Check-In QR'}
                      </Button>
                    )}

                    {ev?.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (ev) setReviewTarget({ assignmentId: asg.id, userId: ev.organizerId, userName: ev.organizerName });
                        }}
                      >
                        Review Organizer
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedAsgForScan && (
        <QRScannerModal
          isOpen={true}
          onClose={() => setSelectedAsgForScan(null)}
          assignmentId={selectedAsgForScan}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          assignmentId={reviewTarget.assignmentId}
          targetUserId={reviewTarget.userId}
          targetUserName={reviewTarget.userName}
        />
      )}
    </div>
  );
};
