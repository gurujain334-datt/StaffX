import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import { Badge } from '../ui/Badge';
import { CreateEventModal } from './CreateEventModal';
import { AddRequirementModal } from './AddRequirementModal';
import { AIStaffingPlanModal } from './AIStaffingPlanModal';
import { AIRecommendedProfessionals } from './AIRecommendedProfessionals';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  ArrowRight,
  QrCode,
  Sparkles,
  PlusCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { staffingService } from '../../services/staffingService';
import { GeneratedRolePlan } from '../../services/aiService';

export const EventsListView: React.FC = () => {
  const { events, requirements, setSelectedEventId, setCurrentRoute, addToast, refreshData, allProfessionals } = useApp();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addReqEventId, setAddReqEventId] = useState<string | null>(null);
  const [aiPlanEvent, setAiPlanEvent] = useState<{ id: string; name: string; location: string } | null>(null);
  const [activeReqForMatches, setActiveReqForMatches] = useState<string | null>(null);

  const handleApplyAIPlan = async (eventId: string, planRoles: GeneratedRolePlan[]) => {
    try {
      for (const rolePlan of planRoles) {
        await staffingService.createRequirement({
          eventId,
          role: rolePlan.role,
          requiredQuantity: rolePlan.workers_required,
          payAmount: rolePlan.suggested_payment,
          requiredSkills: rolePlan.skills || ['Event Operations'],
          shiftStart: rolePlan.shift_start || '17:00',
          shiftEnd: rolePlan.shift_end || '23:00',
          description: rolePlan.notes || rolePlan.responsibilities?.join('. ') || '',
          status: 'PUBLISHED',
        });
      }
      addToast(`Successfully created ${planRoles.length} AI staffing requirement(s)!`, 'success', 'AI Plan Applied');
      if (refreshData) refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to apply AI plan', 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Events & Staffing Requirements</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create events, manage staff headcounts, and monitor fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
            onClick={() => {
              if (events.length > 0) {
                setAiPlanEvent({ id: events[0].id, name: events[0].name, location: events[0].location });
              } else {
                addToast('Please create an event first to generate an AI staffing plan', 'info', 'Event Needed');
              }
            }}
            className="border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300"
          >
            ✨ AI Staffing Generator
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
            className="shadow-md shadow-indigo-600/20"
          >
            Post New Event
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {events.map(event => {
          const eventReqs = requirements.filter(r => r.eventId === event.id);
          const totalStaffNeeded = eventReqs.reduce((acc, r) => acc + r.requiredQuantity, 0);
          const totalStaffHired = eventReqs.reduce((acc, r) => acc + r.filledQuantity, 0);
          const progressPct = totalStaffNeeded > 0 ? Math.round((totalStaffHired / totalStaffNeeded) * 100) : 0;

          return (
            <Card key={event.id} padding="lg" className="border-slate-200/90 dark:border-slate-800 bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row gap-6 justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={event.status} />
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                      {event.eventType}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono-num">Token: {event.qrCodeToken.substring(0, 16)}...</span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{event.name}</h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{event.venue}, {event.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{event.startDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                  </div>
                </div>

                {/* Right side Staffing summary & Actions */}
                <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 lg:pl-6 pt-4 lg:pt-0 min-w-56 space-y-4">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Staffing Quota</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono-num">{progressPct}%</span>
                    </div>
                    <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1 font-mono-num">
                      {totalStaffHired} / {totalStaffNeeded}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                      {totalStaffNeeded - totalStaffHired} positions left to fill
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={<Users className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setCurrentRoute('workforce');
                      }}
                    >
                      Command Center
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      icon={<PlusCircle className="w-3.5 h-3.5" />}
                      onClick={() => setAddReqEventId(event.id)}
                    >
                      Add Staff Need
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sub-breakdown of roles for this event */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Role Breakdown ({eventReqs.length} Positions):
                  </span>
                  <button
                    onClick={() => setAddReqEventId(event.id)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Role Requirement
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {eventReqs.map(req => {
                    const showMatches = activeReqForMatches === req.id;
                    return (
                      <div key={req.id} className="space-y-2">
                        <div className="p-3 bg-slate-900 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block">{req.role}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono-num">₹{req.payAmount} / shift</span>
                            <button
                              onClick={() => setActiveReqForMatches(showMatches ? null : req.id)}
                              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              {showMatches ? 'Hide AI Matches' : '✨ Recommended Candidates'}
                            </button>
                          </div>
                          <Badge variant={req.filledQuantity >= req.requiredQuantity ? 'green' : 'yellow'}>
                            {req.filledQuantity} / {req.requiredQuantity}
                          </Badge>
                        </div>

                        {showMatches && (
                          <div className="col-span-full mt-2">
                            <AIRecommendedProfessionals
                              requirement={req}
                              eventLocation={event.location}
                              allProfessionals={allProfessionals}
                              onInvite={(prof) => {
                                addToast(`Sent AI match invitation to ${prof.name}`, 'success', 'Invitation Sent');
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <AddRequirementModal
        isOpen={!!addReqEventId}
        onClose={() => setAddReqEventId(null)}
        defaultEventId={addReqEventId || undefined}
      />

      {aiPlanEvent && (
        <AIStaffingPlanModal
          isOpen={!!aiPlanEvent}
          onClose={() => setAiPlanEvent(null)}
          eventId={aiPlanEvent.id}
          eventName={aiPlanEvent.name}
          location={aiPlanEvent.location}
          onApplyPlan={(plan) => handleApplyAIPlan(aiPlanEvent.id, plan)}
        />
      )}
    </div>
  );
};
