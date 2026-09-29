import React, { useState } from 'react';
import { Sparkles, Check, Edit2, Plus, Trash2, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { aiService, GeneratedRolePlan } from '../../services/aiService';

interface AIStaffingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  location?: string;
  onApplyPlan: (roles: GeneratedRolePlan[]) => Promise<void> | void;
}

export const AIStaffingPlanModal: React.FC<AIStaffingPlanModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  location,
  onApplyPlan,
}) => {
  const [descriptionPrompt, setDescriptionPrompt] = useState(
    `I need staff for ${eventName || 'a corporate reception'} with 500 guests in ${location || 'Bhopal'} from 5 PM to 11 PM.`
  );
  const [guestCount, setGuestCount] = useState<number>(500);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedRolePlan[] | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await aiService.generateStaffingPlan({
        eventName,
        description: descriptionPrompt,
        guestCount,
        location,
        shiftStart: '17:00',
        shiftEnd: '23:00',
      });
      setGeneratedPlan(res.plan);
      setIsFallback(res.isFallback);
    } catch (err) {
      console.error('Failed to generate staffing plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (index: number, key: keyof GeneratedRolePlan, value: any) => {
    if (!generatedPlan) return;
    const updated = [...generatedPlan];
    updated[index] = { ...updated[index], [key]: value };
    setGeneratedPlan(updated);
  };

  const handleRemoveRole = (index: number) => {
    if (!generatedPlan) return;
    setGeneratedPlan(generatedPlan.filter((_, i) => i !== index));
  };

  const handleAddRole = () => {
    if (!generatedPlan) setGeneratedPlan([]);
    const newRole: GeneratedRolePlan = {
      role: 'Support Staff',
      workers_required: 2,
      skills: ['Event Operations', 'Guest Service'],
      responsibilities: ['General event support', 'Hall management'],
      suggested_payment: 1500,
      shift_start: '17:00',
      shift_end: '23:00',
      notes: 'General support crew',
    };
    setGeneratedPlan(prev => (prev ? [...prev, newRole] : [newRole]));
  };

  const handleApprove = async () => {
    if (!generatedPlan || generatedPlan.length === 0) return;
    setApplying(true);
    try {
      await onApplyPlan(generatedPlan);
      onClose();
    } catch (err) {
      console.error('Error applying plan:', err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Staffing Requirement Generator
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Gemini AI
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Describe your event needs and AI will formulate headcount, roles, skills & wages.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Prompt Form */}
          <div className="space-y-4 bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Event Description & Requirements
            </label>
            <textarea
              value={descriptionPrompt}
              onChange={e => setDescriptionPrompt(e.target.value)}
              placeholder="e.g. Need staff for a wedding with 500 guests from 5 PM to 11 PM..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Estimated Guest Count:</span>
                <input
                  type="number"
                  value={guestCount}
                  onChange={e => setGuestCount(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-sm font-semibold bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-white"
                  min={10}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !descriptionPrompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating Staffing Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    ✨ Generate Staffing Plan
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Fallback Notice if applicable */}
          {isFallback && generatedPlan && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>AI live service generated structured algorithmic fallback positions. You can edit any details below.</span>
            </div>
          )}

          {/* Generated Results */}
          {generatedPlan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  Suggested Staffing Breakdown ({generatedPlan.length} Roles)
                </h3>
                <Button variant="outline" size="sm" onClick={handleAddRole} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Custom Role
                </Button>
              </div>

              <div className="space-y-3">
                {generatedPlan.map((planItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Role Name</label>
                          <Input
                            value={planItem.role}
                            onChange={e => handleRoleChange(idx, 'role', e.target.value)}
                            className="text-sm font-bold text-white"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Workers Needed</label>
                          <Input
                            type="number"
                            value={planItem.workers_required}
                            onChange={e => handleRoleChange(idx, 'workers_required', Number(e.target.value))}
                            min={1}
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Daily Pay (₹)</label>
                          <Input
                            type="number"
                            value={planItem.suggested_payment}
                            onChange={e => handleRoleChange(idx, 'suggested_payment', Number(e.target.value))}
                            step={100}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveRole(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                        title="Remove Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Skills & Duties */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Required Skills</span>
                        <div className="flex flex-wrap gap-1.5">
                          {planItem.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium rounded-md border border-indigo-100 dark:border-indigo-900"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Key Duties</span>
                        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                          {planItem.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-900/80 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Note: Review requirements before saving. AI suggestions will create requirement postings for organizer approval.
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={applying}>
              Cancel
            </Button>
            {generatedPlan && generatedPlan.length > 0 && (
              <Button
                onClick={handleApprove}
                disabled={applying}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
              >
                {applying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Postings...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Approve & Create {generatedPlan.length} Requirement(s)
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
