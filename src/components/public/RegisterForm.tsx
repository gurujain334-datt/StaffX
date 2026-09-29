import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Select';
import {
  Briefcase,
  Users,
  Building,
  UserCheck,
  CheckCircle2,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const { registerUser, switchRole, setCurrentRoute, addToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Organizer specific
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('Corporate Events');
  const [location, setLocation] = useState('Bhopal');

  // Professional specific
  const [primarySkill, setPrimarySkill] = useState('Security Guard');
  const [experienceYears, setExperienceYears] = useState('3');
  const [hourlyRate, setHourlyRate] = useState('250');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setRegError(null);
    setIsSubmitting(true);

    try {
      const extraMeta: Record<string, unknown> = { phone };
      if (selectedRole === 'ORGANIZER') {
        extraMeta.organization_name = orgName;
        extraMeta.organization_type = orgType;
        extraMeta.location = location;
      } else if (selectedRole === 'PROFESSIONAL') {
        extraMeta.primary_category = primarySkill;
        extraMeta.experience_years = Number(experienceYears) || 2;
        extraMeta.hourly_rate = Number(hourlyRate) || 250;
      }

      const res = await registerUser(email, password, fullName, selectedRole, extraMeta);
      if (!res.success && res.error) {
        setRegError(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-900 dark:bg-transparent">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Create your StaffX Account</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {step === 1 ? 'Select your primary role to begin' : `Complete your ${(selectedRole || 'Account').toLowerCase()} profile`}
          </p>
          {step > 1 && (
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
              Step {step} of 2
            </div>
          )}
        </div>

        <Card padding="lg" className="border-slate-200 dark:border-slate-800 bg-slate-900/90 shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          {step === 1 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 text-center mb-2">
                What are you looking for?
              </h3>

              {/* Organizer Option Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('ORGANIZER')}
                className="w-full p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">👔 I'm an Organizer</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hire verified event staff, security, waiters & ushers</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Professional Option Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('PROFESSIONAL')}
                className="w-full p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/40 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">🧑‍💼 I'm a Professional</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Find event gigs, get verified, track earnings & reputation</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleFinish} className="space-y-4">
              {regError && (
                <div className="p-3 text-xs bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg">
                  {regError}
                </div>
              )}
              <Input
                label="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={selectedRole === 'ORGANIZER' ? 'e.g. Rajesh Malhotra' : 'e.g. Rahul Sharma'}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  leftIcon={<Phone className="w-4 h-4" />}
                  required
                />
              </div>

              <Input
                label="Create Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              {selectedRole === 'ORGANIZER' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                    Organization Details
                  </div>
                  <Input
                    label="Organization / Agency Name"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. Royal Horizon Weddings"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Event Focus"
                      value={orgType}
                      onChange={e => setOrgType(e.target.value)}
                      options={[
                        { label: 'Corporate Conferences', value: 'Corporate Conferences' },
                        { label: 'Weddings & Banquets', value: 'Weddings & Banquets' },
                        { label: 'Exhibitions & Expos', value: 'Exhibitions & Expos' },
                        { label: 'Concerts & Festivals', value: 'Concerts & Festivals' },
                      ]}
                    />
                    <Input
                      label="City / Base Location"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Bhopal"
                      required
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'PROFESSIONAL' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Skills & Professional Details
                  </div>
                  <Select
                    label="Primary Category"
                    value={primarySkill}
                    onChange={e => setPrimarySkill(e.target.value)}
                    options={[
                      { label: 'Security Guard', value: 'Security Guard' },
                      { label: 'Waiter & Hospitality', value: 'Waiter' },
                      { label: 'Usher & Guest Coordinator', value: 'Usher' },
                      { label: 'Bartender & Mixologist', value: 'Bartender' },
                      { label: 'Event Coordinator / Supervisor', value: 'Event Coordinator' },
                      { label: 'Sound & AV Technician', value: 'Technician' },
                      { label: 'Cleaner & Venue Maintenance', value: 'Cleaner' },
                      { label: 'Driver & Logistics Chauffeur', value: 'Driver' },
                      { label: 'Other Event Professional', value: 'Other' },
                    ]}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Years Experience"
                      type="number"
                      value={experienceYears}
                      onChange={e => setExperienceYears(e.target.value)}
                      min="0"
                      required
                    />
                    <Input
                      label="Expected Rate (₹/hr)"
                      type="number"
                      value={hourlyRate}
                      onChange={e => setHourlyRate(e.target.value)}
                      min="50"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex-1 shadow-lg shadow-indigo-600/20"
                >
                  {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => setCurrentRoute('login')}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
          >
            Log in here
          </button>
        </p>
      </div>
    </div>
  );
};
