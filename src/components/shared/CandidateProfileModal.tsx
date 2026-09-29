import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProfessionalProfile } from '../../types';
import {
  ShieldCheck,
  Star,
  Briefcase,
  MapPin,
  Phone,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: ProfessionalProfile | null;
  onHire?: () => void;
  canHire?: boolean;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onHire,
  canHire = false,
}) => {
  if (!candidate) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Professional Profile Overview"
      description="Detailed profile, verified credentials, and event history"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Header Profile Summary */}
        <div className="flex items-start gap-4 p-4 bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <img
            src={candidate.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'}
            alt={candidate.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-xs shrink-0"
          />

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white">{candidate.name}</h3>
              {candidate.verificationStatus === 'VERIFIED' && (
                <Badge variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Verified Staff
                </Badge>
              )}
            </div>

            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
              {candidate.primaryCategory} • {candidate.experienceYears} Years Industry Experience
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {candidate.rating} Rating
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {candidate.completedJobsCount} Gigs Completed
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {candidate.location}
              </span>
            </div>
          </div>
        </div>

        {/* Bio / Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Professional Bio</h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            {candidate.bio || 'Verified event staffing specialist committed to delivering exceptional customer service, security, and crowd protocol.'}
          </p>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Verified Skills & Competencies</h4>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills?.map(s => (
              <span
                key={s}
                className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-md"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* StaffX Trust Profile (Step 5) */}
        <div className="space-y-2.5 p-3.5 bg-gradient-to-r from-emerald-950/20 to-teal-950/25 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>StaffX Trust Profile</span>
            </h4>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
              Score: Strong
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>Identity Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>{candidate.completedJobsCount} Gigs Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>98% Attendance Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>0 No-Show Flags</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Standard Hourly Rate</span>
            <span className="text-base font-black text-white mt-0.5 block font-mono-num">₹{candidate.hourlyRate}/hr</span>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Availability</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{candidate.availability}</span>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Phone / Contact</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 block font-mono-num">{candidate.phone || 'Verified'}</span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          {canHire && onHire && (
            <Button
              variant="primary"
              icon={<UserCheck className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onHire();
              }}
            >
              Hire Candidate Now
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
