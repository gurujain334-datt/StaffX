import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/Badge';
import { QRModal } from '../shared/QRModal';
import { EventSummaryModal } from './EventSummaryModal';
import { ReviewModal } from '../shared/ReviewModal';
import {
  Users,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Calendar,
  MapPin,
  Sparkles,
  XCircle
} from 'lucide-react';

export const WorkforceManagementView: React.FC = () => {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    requirements,
    assignments,
    attendance,
    payments,
    completeEvent,
    cancelEvent,
    updatePaymentStatus,
    addToast
  } = useApp();

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ assignmentId: string; userId: string; userName: string } | null>(null);

  const currentEvent = events.find(e => e.id === selectedEventId) || events[0];
  const eventReqs = requirements.filter(r => r.eventId === currentEvent?.id);
  const totalRequired = eventReqs.reduce((acc, r) => acc + r.requiredQuantity, 0);
  const totalHired = eventReqs.reduce((acc, r) => acc + r.filledQuantity, 0);

  // Assignments for this event
  const eventAssignments = assignments.filter(a => a.eventId === currentEvent?.id);

  // Attendance metrics
  const eventAttendanceRecords = attendance.filter(att => att.eventId === currentEvent?.id);
  const presentCount = eventAttendanceRecords.filter(a => a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;
  const absentCount = Math.max(0, eventAssignments.length - presentCount);

  return (
    <div className="space-y-6">
      {/* Event Selector & Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Workforce Command Center</h1>
            <Badge variant="indigo">Live Operations</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time on-site staff attendance, duty rosters, and payment authorization
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentEvent?.status !== 'COMPLETED' && currentEvent?.status !== 'CANCELLED' && (
            <>
              <Button
                variant="outline"
                size="md"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => {
                  if (currentEvent) {
                    completeEvent(currentEvent.id);
                    setSummaryModalOpen(true);
                  }
                }}
                className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                Complete Event
              </Button>

              <Button
                variant="outline"
                size="md"
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => {
                  if (currentEvent && window.confirm('Are you sure you want to cancel this event? This will halt check-ins and staffing.')) {
                    cancelEvent(currentEvent.id);
                  }
                }}
                className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                Cancel Event
              </Button>
            </>
          )}

          {currentEvent?.status === 'COMPLETED' && (
            <Button
              variant="secondary"
              size="md"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              onClick={() => setSummaryModalOpen(true)}
            >
              View Report
            </Button>
          )}

          <select
            value={currentEvent?.id}
            onChange={e => setSelectedEventId(e.target.value)}
            className="h-10 px-3 bg-slate-900 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-100 cursor-pointer"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id} className="bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100">
                {ev.name}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="md"
            icon={<QrCode className="w-4 h-4" />}
            onClick={() => setQrModalOpen(true)}
            className="shadow-md shadow-indigo-600/20"
          >
            Event QR Pass
          </Button>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="border-slate-200/90 dark:border-slate-800 bg-slate-900/90">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quota Staffing</span>
          <div className="text-2xl font-black text-white mt-2 font-mono-num">
            {totalHired} <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/ {totalRequired}</span>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
            {totalRequired - totalHired === 0 ? 'Fully Staffed' : `${totalRequired - totalHired} slots available`}
          </span>
        </Card>

        <Card padding="md" className="border-slate-200/90 dark:border-slate-800 bg-slate-900/90">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Checked In (Present)</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono-num">{presentCount}</div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Verified via QR scanner</span>
        </Card>

        <Card padding="md" className="border-slate-200/90 dark:border-slate-800 bg-slate-900/90">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Arrival</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono-num">{absentCount}</div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Not yet scanned in</span>
        </Card>

        <Card padding="md" className="border-slate-200/90 dark:border-slate-800 bg-slate-900/90">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Wage Commitment</span>
          <div className="text-2xl font-black text-white mt-2 font-mono-num">
            ₹{eventAssignments.reduce((acc, a) => acc + (a.agreedRate || 0), 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Transparent fixed rates</span>
        </Card>
      </div>

      {/* Roster & Workforce Table (Responsive per Section 49) */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Event Duty Roster</h3>
            <p className="text-xs text-slate-400">{currentEvent?.name} • {currentEvent?.venue}</p>
          </div>
          <Badge variant="gray">{eventAssignments.length} Assigned Professionals</Badge>
        </div>

        {eventAssignments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No professionals assigned to this event yet. Go to "Find Staff" or "Applications" to confirm workers.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/70 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Professional</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Attendance Check</th>
                    <th className="py-3.5 px-4">Shift Duration</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {eventAssignments.map(asg => {
                    const attRecord = attendance.find(a => a.assignmentId === asg.id);
                    const payRecord = payments.find(p => p.assignmentId === asg.id);

                    return (
                      <tr key={asg.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-950/80 text-indigo-300 font-bold flex items-center justify-center text-xs">
                              {asg.professionalName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{asg.professionalName}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono-num">ID: {asg.professionalId}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-200">{asg.role}</td>

                        <td className="py-3 px-4">
                          <StatusBadge status={asg.status} />
                        </td>

                        <td className="py-3 px-4">
                          {attRecord?.status === 'CHECKED_IN' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200 dark:border-emerald-800/60 font-mono-num">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Present ({attRecord.checkInAt})
                            </span>
                          ) : attRecord?.status === 'CHECKED_OUT' ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full text-[11px] font-mono-num">
                              Checked Out ({attRecord.checkOutAt})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full text-[11px] border border-amber-200 dark:border-amber-800/60">
                              <Clock className="w-3 h-3 text-amber-500" /> Not Arrived
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono-num">
                          {attRecord?.durationFormatted || '—'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-mono-num">₹{asg.agreedRate}</span>
                            {payRecord && <StatusBadge status={payRecord.status} />}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right space-y-1">
                          {payRecord && payRecord.status === 'PENDING' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => updatePaymentStatus(payRecord.id, 'PAID')}
                            >
                              Release Pay
                            </Button>
                          )}
                          {payRecord && payRecord.status === 'PAID' && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] block">✓ Settled</span>
                          )}
                          {currentEvent?.status === 'COMPLETED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReviewTarget({ assignmentId: asg.id, userId: asg.professionalId, userName: asg.professionalName })}
                            >
                              Review
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Transformation per Section 49 */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800 p-3 space-y-3">
              {eventAssignments.map(asg => {
                const attRecord = attendance.find(a => a.assignmentId === asg.id);
                const payRecord = payments.find(p => p.assignmentId === asg.id);

                return (
                  <div key={asg.id} className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{asg.professionalName}</span>
                      <StatusBadge status={asg.status} />
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Role: <strong className="text-white">{asg.role}</strong></span>
                      <span>Daily Pay: <strong className="text-white font-mono-num">₹{asg.agreedRate}</strong></span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-[11px]">
                        Attendance:{' '}
                        {attRecord?.status === 'CHECKED_IN' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono-num">Present ({attRecord.checkInAt})</span>
                        ) : attRecord?.status === 'CHECKED_OUT' ? (
                          <span className="text-slate-600 dark:text-slate-400">Checked out</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">Not arrived</span>
                        )}
                      </div>

                      {payRecord && payRecord.status === 'PENDING' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => updatePaymentStatus(payRecord.id, 'PAID')}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {payRecord && payRecord.status === 'PAID' && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">✓ Paid</span>
                      )}
                      {currentEvent?.status === 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewTarget({ assignmentId: asg.id, userId: asg.professionalId, userName: asg.professionalName })}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* QR Code Presentation Modal */}
      {currentEvent && (
        <>
          <QRModal
            isOpen={qrModalOpen}
            onClose={() => setQrModalOpen(false)}
            eventName={currentEvent.name}
            qrToken={currentEvent.qrCodeToken}
            venue={currentEvent.venue}
            date={currentEvent.startDate}
          />
          <EventSummaryModal
            isOpen={summaryModalOpen}
            onClose={() => setSummaryModalOpen(false)}
            eventId={currentEvent.id}
          />
          {reviewTarget && (
            <ReviewModal
              isOpen={!!reviewTarget}
              onClose={() => setReviewTarget(null)}
              assignmentId={reviewTarget.assignmentId}
              targetUserId={reviewTarget.userId}
              targetUserName={reviewTarget.userName}
            />
          )}
        </>
      )}
    </div>
  );
};
