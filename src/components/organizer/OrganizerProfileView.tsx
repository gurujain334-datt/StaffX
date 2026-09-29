import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select, Textarea } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { OrganizerHistory } from './OrganizerHistory';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Check,
  Globe,
  Calendar,
  Star,
  Users
} from 'lucide-react';

export const OrganizerProfileView: React.FC = () => {
  const { organizerProfile, updateOrganizerProfile, addToast, setCurrentRoute, reviews, events } = useApp();

  const myReviews = reviews.filter(r => r.reviewedUserId === organizerProfile.id);
  const myCompletedEvents = events.filter(e => e.organizerId === organizerProfile.id && e.status === 'COMPLETED');
  
  const realRating = myReviews.length > 0 
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : (organizerProfile.rating || '4.9');
    
  const realCompletedCount = myCompletedEvents.length > 0 ? myCompletedEvents.length : (organizerProfile.completedEventsCount || 0);

  const [orgName, setOrgName] = useState(organizerProfile.organizationName);
  const [contactName, setContactName] = useState(organizerProfile.contactPerson);
  const [email, setEmail] = useState(organizerProfile.email);
  const [phone, setPhone] = useState(organizerProfile.phone);
  const [location, setLocation] = useState(organizerProfile.location);
  const [orgType, setOrgType] = useState(organizerProfile.organizationType || 'Corporate Conferences');
  const [website, setWebsite] = useState(organizerProfile.website || '');
  const [description, setDescription] = useState(organizerProfile.description);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateOrganizerProfile({
        organizationName: orgName,
        contactPerson: contactName,
        email,
        phone,
        location,
        organizationType: orgType,
        website,
        description,
      });
      addToast('Agency profile updated successfully.', 'success', 'Saved');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Organization Profile & Identity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your event company verification, hiring credentials, and public brand
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
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {orgName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">{orgName}</h3>
                {organizerProfile.verificationStatus === 'VERIFIED' && (
                  <Badge variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                    Verified Organizer
                  </Badge>
                )}
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{orgType}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono-num">
                <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {realRating} Agency Rating ({myReviews.length} Reviews)
                </span>
                <span>•</span>
                <span>{realCompletedCount} Events Executed</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-medium block">Headquarters</span>
            <span className="text-base font-bold text-white">{location}</span>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-6">
          <Input
            label="Organization / Company Name"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            leftIcon={<Building className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Contact Person"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              required
            />
            <Input
              label="City / Base Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Event Focus"
              value={orgType}
              onChange={e => setOrgType(e.target.value)}
              options={[
                { label: 'Corporate Conferences & Summits', value: 'Corporate Conferences' },
                { label: 'Weddings & Banquets', value: 'Weddings & Banquets' },
                { label: 'Exhibitions & Trade Expos', value: 'Exhibitions & Expos' },
                { label: 'Concerts & Music Festivals', value: 'Concerts & Festivals' },
                { label: 'Sports Tournaments', value: 'Sports Tournaments' },
              ]}
            />
            <Input
              label="Company Website"
              type="url"
              placeholder="https://..."
              value={website}
              onChange={e => setWebsite(e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>

          <Textarea
            label="Company Description & Portfolio"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            required
          />

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              icon={<Check className="w-4 h-4" />}
              className="shadow-md shadow-indigo-600/20"
            >
              {isSaving ? 'Saving Changes...' : 'Save Organization Details'}
            </Button>
          </div>
        </form>
      </Card>

      <OrganizerHistory />
    </div>
  );
};
