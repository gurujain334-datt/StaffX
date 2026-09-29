import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select, Textarea } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { AIBioGenerator } from './AIBioGenerator';
import { ProfessionalHistory } from './ProfessionalHistory';
import {
  User,
  ShieldCheck,
  Star,
  Award,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Check,
  Plus,
  X,
  Clock,
  Sparkles
} from 'lucide-react';

export const ProfessionalProfileView: React.FC = () => {
  const { currentProfessional, updateProfessionalProfile, addToast, setCurrentRoute, reviews, attendance, assignments } = useApp();

  const myReviews = reviews.filter(r => currentProfessional ? r.reviewedUserId === currentProfessional.id : false);
  const myCompletedAssignments = assignments.filter(a => currentProfessional ? a.professionalId === currentProfessional.id && a.status === 'COMPLETED' : false);
  const myAttendance = attendance.filter(a => currentProfessional ? a.professionalId === currentProfessional.id && a.status !== 'NOT_CHECKED_IN' : false);
  
  const realRating = myReviews.length > 0 
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : (currentProfessional?.rating ?? '4.9');
    
  const realCompletedCount = myCompletedAssignments.length > 0 ? myCompletedAssignments.length : (currentProfessional?.completedJobsCount ?? 0);
  
  const totalAssigned = assignments.filter(a => currentProfessional ? a.professionalId === currentProfessional.id : false).length;
  const attendanceRate = totalAssigned > 0 ? Math.round((myAttendance.length / totalAssigned) * 100) : 100;

  const [name, setName] = useState(currentProfessional?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(currentProfessional?.phone || '+91 98765 43210');
  const [location, setLocation] = useState(currentProfessional?.location || 'Bhopal');
  const [primaryCategory, setPrimaryCategory] = useState(currentProfessional?.primaryCategory || 'Security Guard');
  const [experienceYears, setExperienceYears] = useState(String(currentProfessional?.experienceYears || 3));
  const [hourlyRate, setHourlyRate] = useState(String(currentProfessional?.hourlyRate || 250));
  const [availability, setAvailability] = useState<'Available' | 'Busy' | 'Weekends Only'>(currentProfessional?.availability || 'Available');
  const [bio, setBio] = useState(currentProfessional?.bio || 'Experienced event security specialist with extensive crowd management and VIP escort experience.');
  const [skills, setSkills] = useState<string[]>(currentProfessional?.skills || ['Security', 'Crowd Control', 'Event Safety']);
  const [newSkill, setNewSkill] = useState('');
  const [profileImage, setProfileImage] = useState(currentProfessional?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(prev => prev.filter(item => item !== s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateProfessionalProfile({
        name,
        phone,
        location,
        primaryCategory,
        experienceYears: Number(experienceYears) || 2,
        hourlyRate: Number(hourlyRate) || 250,
        availability,
        bio,
        skills,
        profileImage,
      });
      addToast('Professional profile and digital credentials updated.', 'success', 'Profile Saved');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Professional Profile & Digital CV
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your verified event workforce credential, skill badges, and hourly compensation rate
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentRoute('onboarding')}
        >
          Run Onboarding Wizard
        </Button>
      </div>

      <Card padding="lg" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/80 shadow-2xs">
        {/* Profile Header Visual */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={profileImage}
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
              />
              {currentProfessional?.verificationStatus === 'VERIFIED' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900" title="Verified Professional">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">{name}</h3>
                {currentProfessional?.verificationStatus === 'VERIFIED' && (
                  <Badge variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                    Verified Pro
                  </Badge>
                )}
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{primaryCategory}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono-num">
                <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {realRating} Client Rating ({myReviews.length} Reviews)
                </span>
                <span>•</span>
                <span>{realCompletedCount} Shifts Completed</span>
                <span>•</span>
                <span>{attendanceRate}% Attendance</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block font-mono-num">Expected Pay</span>
            <span className="text-2xl font-black text-white font-mono-num">₹{hourlyRate}</span>
            <span className="text-[10px] text-slate-400 block">/ hour</span>
          </div>
        </div>

        {/* AI Bio Generator Assistant */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <AIBioGenerator
            currentRole={primaryCategory}
            onApply={(generatedBio, generatedSkills) => {
              setBio(generatedBio);
              setSkills(prev => Array.from(new Set([...prev, ...generatedSkills])));
              addToast('AI bio and skill tags applied to profile form!', 'success', 'AI Applied');
            }}
          />
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Base City / Territory"
              value={location}
              onChange={e => setLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
            <Select
              label="Primary Role Category"
              value={primaryCategory}
              onChange={e => setPrimaryCategory(e.target.value)}
              options={[
                { label: 'Security Guard & Bouncer', value: 'Security Guard' },
                { label: 'Waiter & Hospitality', value: 'Waiter' },
                { label: 'Usher & Guest Coordinator', value: 'Usher' },
                { label: 'Bartender & Mixologist', value: 'Bartender' },
                { label: 'Event Coordinator', value: 'Event Coordinator' },
                { label: 'Sound & AV Technician', value: 'Technician' },
                { label: 'Cleaner & Maintenance', value: 'Cleaner' },
                { label: 'VIP Driver', value: 'Driver' },
                { label: 'Other Event Professional', value: 'Other' },
              ]}
            />
            <Select
              label="Availability Status"
              value={availability}
              onChange={e => setAvailability(e.target.value as 'Available' | 'Busy' | 'Weekends Only')}
              options={[
                { label: 'Available (Immediate)', value: 'Available' },
                { label: 'Weekends Only', value: 'Weekends Only' },
                { label: 'Busy / Booked', value: 'Busy' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Years of Experience"
              type="number"
              min="0"
              value={experienceYears}
              onChange={e => setExperienceYears(e.target.value)}
              required
            />
            <Input
              label="Target Hourly Rate (₹/hr)"
              type="number"
              min="50"
              value={hourlyRate}
              onChange={e => setHourlyRate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Profile Image URL"
            value={profileImage}
            onChange={e => setProfileImage(e.target.value)}
            placeholder="https://..."
          />

          <Textarea
            label="Professional Bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            required
          />

          {/* Skills Management */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Verified Skills & Specializations
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add custom skill (e.g. VIP Protocol, Fire Safety)"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              icon={<Check className="w-4 h-4" />}
              className="shadow-md shadow-indigo-600/20"
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </Card>
      
      <ProfessionalHistory />
    </div>
  );
};
