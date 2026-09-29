import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select, Textarea } from '../ui/Select';
import { Badge } from '../ui/Badge';
import {
  Briefcase,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  Plus,
  X,
  Star,
  Award
} from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const {
    currentUser,
    activeRole,
    organizerProfile,
    currentProfessional,
    updateOrganizerProfile,
    updateProfessionalProfile,
    setCurrentRoute,
    addToast
  } = useApp();

  const isOrganizer = activeRole === 'ORGANIZER';

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Professional Form State
  const [proName, setProName] = useState(currentProfessional?.name || currentUser?.fullName || '');
  const [proPhone, setProPhone] = useState(currentProfessional?.phone || currentUser?.phone || '');
  const [proBio, setProBio] = useState(currentProfessional?.bio || 'Dedicated event professional committed to punctual, high-quality event operations.');
  const [proCategory, setProCategory] = useState(currentProfessional?.primaryCategory || 'Security Guard');
  const [proSkills, setProSkills] = useState<string[]>(currentProfessional?.skills || ['Crowd Control', 'Event Safety', 'Access Control']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [proExpYears, setProExpYears] = useState(String(currentProfessional?.experienceYears || 3));
  const [proHourlyRate, setProHourlyRate] = useState(String(currentProfessional?.hourlyRate || 250));
  const [proLocation, setProLocation] = useState(currentProfessional?.location || 'Bhopal');
  const [proAvailability, setProAvailability] = useState<'Available' | 'Busy' | 'Weekends Only'>(currentProfessional?.availability || 'Available');

  // Organizer Form State
  const [orgName, setOrgName] = useState(organizerProfile?.organizationName || '');
  const [orgContact, setOrgContact] = useState(organizerProfile?.contactPerson || currentUser?.fullName || '');
  const [orgPhone, setOrgPhone] = useState(organizerProfile?.phone || currentUser?.phone || '');
  const [orgEmail, setOrgEmail] = useState(organizerProfile?.email || currentUser?.email || '');
  const [orgType, setOrgType] = useState(organizerProfile?.organizationType || 'Corporate Conferences');
  const [orgWebsite, setOrgWebsite] = useState(organizerProfile?.website || 'https://');
  const [orgDescription, setOrgDescription] = useState(organizerProfile?.description || 'Premier event planning and production firm.');
  const [orgLocation, setOrgLocation] = useState(organizerProfile?.location || 'Bhopal');
  const [typicalStaffCount, setTypicalStaffCount] = useState('15');

  const completionPercent = Math.round((currentStep / totalSteps) * 100);

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !proSkills.includes(newSkillInput.trim())) {
      setProSkills(prev => [...prev, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProSkills(prev => prev.filter(s => s !== skill));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (isOrganizer) {
      updateOrganizerProfile({
        organizationName: orgName || 'Premier Events Group',
        contactPerson: orgContact || 'Rajesh Malhotra',
        phone: orgPhone,
        email: orgEmail,
        organizationType: orgType,
        website: orgWebsite,
        description: orgDescription,
        location: orgLocation,
      });
      addToast('Organizer profile completed! Welcome to your Command Center.', 'success', 'Onboarding Complete');
      setCurrentRoute('dashboard');
    } else {
      updateProfessionalProfile({
        name: proName || 'Rahul Sharma',
        phone: proPhone,
        bio: proBio,
        primaryCategory: proCategory,
        skills: proSkills,
        experienceYears: Number(proExpYears) || 2,
        hourlyRate: Number(proHourlyRate) || 250,
        location: proLocation,
        availability: proAvailability,
      });
      addToast('Professional profile completed! You are ready to accept event jobs.', 'success', 'Onboarding Complete');
      setCurrentRoute('dashboard');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider font-mono-num">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Profile Onboarding Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {isOrganizer ? 'Setup Your Event Management Agency' : 'Setup Your Event Professional Digital CV'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {isOrganizer
            ? 'Configure your organization profile to post verified shifts, hire matched staff, and manage automated payroll.'
            : 'Complete your profile to unlock instant event job applications, smart matching scores, and verified QR attendance.'}
        </p>

        {/* Progress Bar & Steps Indicator */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-mono-num">{completionPercent}% Completed</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      <Card padding="lg" className="border-slate-200/80 dark:border-slate-800 bg-slate-900/90 shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        {/* ==================== ORGANIZER WIZARD STEPS ==================== */}
        {isOrganizer && (
          <div>
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-white">Agency & Contact Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Primary business contact information visible on job postings</p>
                </div>

                <Input
                  label="Organization / Company Name"
                  placeholder="e.g. Royal Horizon Events Pvt Ltd"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Contact Person"
                    placeholder="e.g. Rajesh Malhotra"
                    value={orgContact}
                    onChange={e => setOrgContact(e.target.value)}
                    required
                  />
                  <Input
                    label="Contact Phone"
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={orgPhone}
                    onChange={e => setOrgPhone(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Official Email Address"
                  type="email"
                  placeholder="contact@royalhorizon.com"
                  value={orgEmail}
                  onChange={e => setOrgEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-white">Organization Specialization</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Specify your event categories and portfolio</p>
                </div>

                <Select
                  label="Primary Event Focus"
                  value={orgType}
                  onChange={e => setOrgType(e.target.value)}
                  options={[
                    { label: 'Corporate Conferences & Summits', value: 'Corporate Conferences' },
                    { label: 'Weddings & Banquets', value: 'Weddings & Banquets' },
                    { label: 'Exhibitions, Expos & Trade Fairs', value: 'Exhibitions & Expos' },
                    { label: 'Concerts, Galas & Festivals', value: 'Concerts & Festivals' },
                    { label: 'Sports Tournaments & Marathons', value: 'Sports Tournaments' },
                  ]}
                />

                <Input
                  label="Company Website / Portfolio Link"
                  type="url"
                  placeholder="https://www.example.com"
                  value={orgWebsite}
                  onChange={e => setOrgWebsite(e.target.value)}
                />

                <Textarea
                  label="Agency Description"
                  placeholder="Briefly describe your production experience, annual event volume, and client expectations."
                  value={orgDescription}
                  onChange={e => setOrgDescription(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-white">Operational Coverage</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Where you organize events and typical staff required</p>
                </div>

                <Input
                  label="Base City / Headquarters"
                  placeholder="e.g. Bhopal, Madhya Pradesh"
                  value={orgLocation}
                  onChange={e => setOrgLocation(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Average Crew Needed Per Event"
                  type="number"
                  placeholder="15"
                  value={typicalStaffCount}
                  onChange={e => setTypicalStaffCount(e.target.value)}
                  min="1"
                />

                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Tier 1 Verification Eligibility
                  </div>
                  <span>Completing this onboarding enables rapid verification review, letting your events appear with verified badges to top candidates.</span>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">You're All Set!</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Your agency profile for <strong className="text-white">{orgName || 'Royal Horizon Events'}</strong> is ready. You can now post new events, review applications, and manage shifts.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/60 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Organization:</span>
                    <span className="font-bold text-white">{orgName || 'Premier Events'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Category:</span>
                    <span className="font-bold text-white">{orgType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Headquarters:</span>
                    <span className="font-bold text-white">{orgLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Live Events
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PROFESSIONAL WIZARD STEPS ==================== */}
        {!isOrganizer && (
          <div>
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-white">Personal Identity & Bio</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Information presented to event organizers on hiring shortlists</p>
                </div>

                <Input
                  label="Full Name"
                  placeholder="e.g. Rahul Sharma"
                  value={proName}
                  onChange={e => setProName(e.target.value)}
                  required
                />

                <Input
                  label="Contact Phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={proPhone}
                  onChange={e => setProPhone(e.target.value)}
                  required
                />

                <Textarea
                  label="Professional Bio"
                  placeholder="Summarize your past event experience, punctuality record, and specialized capabilities."
                  value={proBio}
                  onChange={e => setProBio(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-white">Role Category & Skills</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Define the exact positions you want to be matched for</p>
                </div>

                <Select
                  label="Primary Event Role"
                  value={proCategory}
                  onChange={e => setProCategory(e.target.value)}
                  options={[
                    { label: 'Security Guard & Bouncer', value: 'Security Guard' },
                    { label: 'Waiter & Hospitality Service', value: 'Waiter' },
                    { label: 'Usher & Guest Coordinator', value: 'Usher' },
                    { label: 'Bartender & Mixologist', value: 'Bartender' },
                    { label: 'Event Coordinator & Floor Supervisor', value: 'Event Coordinator' },
                    { label: 'Sound & AV Stage Technician', value: 'Technician' },
                    { label: 'Venue Maintenance & Cleaner', value: 'Cleaner' },
                    { label: 'VIP Driver & Chauffeur', value: 'Driver' },
                    { label: 'Other Event Professional', value: 'Other' },
                  ]}
                />

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Skills & Certifications
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {proSkills.map(s => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add another skill (e.g. First Aid, Mixology)"
                      value={newSkillInput}
                      onChange={e => setNewSkillInput(e.target.value)}
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
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-white">Experience, Rates & Location</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Set your expected compensation and operational territory</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Years of Experience"
                    type="number"
                    min="0"
                    value={proExpYears}
                    onChange={e => setProExpYears(e.target.value)}
                    required
                  />
                  <Input
                    label="Expected Pay Rate (₹ / hour)"
                    type="number"
                    min="50"
                    value={proHourlyRate}
                    onChange={e => setProHourlyRate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Base City / Territory"
                    placeholder="e.g. Bhopal"
                    value={proLocation}
                    onChange={e => setProLocation(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                    required
                  />
                  <Select
                    label="Work Availability"
                    value={proAvailability}
                    onChange={e => setProAvailability(e.target.value as 'Available' | 'Busy' | 'Weekends Only')}
                    options={[
                      { label: 'Available (Immediate)', value: 'Available' },
                      { label: 'Weekends Only', value: 'Weekends Only' },
                      { label: 'Busy / Booked', value: 'Busy' },
                    ]}
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Professional Profile Activated</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Your digital CV for <strong className="text-white">{proName || 'Rahul Sharma'}</strong> is 100% complete and ready to receive match notifications.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/60 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Primary Role:</span>
                    <span className="font-bold text-white">{proCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Experience:</span>
                    <span className="font-bold text-white">{proExpYears} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Target Rate:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono-num">₹{proHourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Location:</span>
                    <span className="font-bold text-white">{proLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Badge Status:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Ready for Verification
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Save & Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleComplete}
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {isOrganizer ? 'Enter Command Hub' : 'Browse Available Gigs'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
