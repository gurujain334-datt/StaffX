import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Select';
import { Plus, Trash2, Sparkles, Calendar, MapPin, Clock } from 'lucide-react';

export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { createEvent, addToast } = useApp();

  // Basic event fields
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Corporate Conference');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('Bhopal');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [description, setDescription] = useState('');

  // Initial staffing requirements
  const [requirements, setRequirements] = useState<
    { role: string; quantity: number; pay: number; experience: string }[]
  >([
    { role: 'Security Guard', quantity: 10, pay: 1500, experience: '1+ year' },
    { role: 'Waiter', quantity: 15, pay: 1200, experience: 'Banquet experience' },
  ]);

  const handleAddRoleRow = () => {
    setRequirements(prev => [
      ...prev,
      { role: 'Event Assistant', quantity: 5, pay: 1000, experience: 'Any' },
    ]);
  };

  const handleRemoveRoleRow = (idx: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRole = (idx: number, field: string, val: any) => {
    setRequirements(prev =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      addToast('Event name is required.', 'error');
      return;
    }
    if (!venue.trim()) {
      addToast('Venue is required.', 'error');
      return;
    }

    // Validate staffing requirements
    if (requirements.length === 0) {
      addToast('Please specify at least one staffing role requirement.', 'error');
      return;
    }

    for (let i = 0; i < requirements.length; i++) {
      const r = requirements[i];
      if (!r.role.trim()) {
        addToast(`Role name in requirement row #${i + 1} cannot be empty.`, 'error');
        return;
      }
      const qty = Number(r.quantity);
      if (isNaN(qty) || qty <= 0) {
        addToast(`Required staff count for "${r.role}" must be at least 1.`, 'error', 'Invalid Staff Count');
        return;
      }
      const payAmt = Number(r.pay);
      if (isNaN(payAmt) || payAmt <= 0) {
        addToast(`Suggested payment for "${r.role}" must be greater than 0.`, 'error', 'Invalid Pay');
        return;
      }
    }

    const initialReqs = requirements.map(r => ({
      role: r.role,
      requiredQuantity: Number(r.quantity),
      payAmount: Number(r.pay),
      experienceRequired: r.experience,
      requiredSkills: [r.role, 'Event Coordination'],
      shiftStart: startTime,
      shiftEnd: endTime,
    }));

    createEvent(
      {
        name: eventName,
        eventType,
        venue,
        location,
        startDate,
        endDate: startDate,
        startTime,
        endTime,
        description,
      },
      initialReqs
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event & Post Staffing Needs"
      description="Fill in event details and specify your required staff numbers."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            1. Event Information
          </h4>

          <Input
            label="Event Name"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            placeholder="e.g. Grand Wedding Reception, Tech Conclave 2026"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Event Type"
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              options={[
                { label: 'Corporate Conference', value: 'Corporate Conference' },
                { label: 'Wedding & Reception', value: 'Wedding' },
                { label: 'Exhibition & Trade Fair', value: 'Exhibition' },
                { label: 'Concert & Festival', value: 'Concert' },
                { label: 'Private Banquet', value: 'Banquet' },
              ]}
            />
            <Input
              label="City / Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Bhopal, Indore"
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
          </div>

          <Input
            label="Venue Address"
            value={venue}
            onChange={e => setVenue(e.target.value)}
            placeholder="e.g. Taj Lakefront Convention Center, Hall B"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Description & Instructions"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Special event details, dress code (e.g. all-black formal), VIP protocols..."
          />
        </div>

        {/* Staffing Requirements Builder */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                2. Staffing Roles & Quotas
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add positions, quantities and daily shift pay</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddRoleRow}
            >
              Add Another Role
            </Button>
          </div>

          <div className="space-y-3">
            {requirements.map((req, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-4">
                  <Select
                    label="Role / Skill"
                    value={req.role}
                    onChange={e => handleUpdateRole(idx, 'role', e.target.value)}
                    options={[
                      { label: 'Security Guard', value: 'Security Guard' },
                      { label: 'Waiter / Hospitality', value: 'Waiter' },
                      { label: 'Usher / Reception', value: 'Usher' },
                      { label: 'Event Assistant', value: 'Event Assistant' },
                      { label: 'Sound / AV Technician', value: 'Technician' },
                      { label: 'Cleaner / Venue Maintenance', value: 'Cleaner' },
                    ]}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={req.quantity}
                    onChange={e => handleUpdateRole(idx, 'quantity', e.target.value)}
                    className="text-center"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Input
                    label="Pay (₹/shift)"
                    type="number"
                    min="500"
                    step="50"
                    value={req.pay}
                    onChange={e => handleUpdateRole(idx, 'pay', e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Experience"
                    type="text"
                    value={req.experience}
                    onChange={e => handleUpdateRole(idx, 'experience', e.target.value)}
                    placeholder="e.g. 1+ yr"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-center pb-1">
                  <button
                    type="button"
                    disabled={requirements.length === 1}
                    onClick={() => handleRemoveRoleRow(idx)}
                    className="text-slate-400 hover:text-red-600 disabled:opacity-30 p-1.5 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-xs text-indigo-800 dark:text-indigo-200 flex items-center justify-between">
            <span>
              Total Workers Requested: <strong className="font-bold">{requirements.reduce((acc, r) => acc + Number(r.quantity || 0), 0)}</strong>
            </span>
            <span>
              Estimated Workforce Budget: <strong className="font-bold">₹{requirements.reduce((acc, r) => acc + (Number(r.quantity || 0) * Number(r.pay || 0)), 0).toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="lg">
            Publish Event & Staffing
          </Button>
        </div>
      </form>
    </Modal>
  );
};
