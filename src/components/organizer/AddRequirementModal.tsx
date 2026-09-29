import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select, Textarea } from '../ui/Select';
import { Button } from '../ui/Button';
import { Plus, Users, DollarSign, Clock, Award } from 'lucide-react';

interface AddRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventId?: string;
}

export const AddRequirementModal: React.FC<AddRequirementModalProps> = ({
  isOpen,
  onClose,
  defaultEventId,
}) => {
  const { events, addStaffRequirement, selectedEventId, addToast } = useApp();

  const targetEventId = defaultEventId || selectedEventId || events[0]?.id || '';

  const [role, setRole] = useState('Security Guard');
  const [requiredQuantity, setRequiredQuantity] = useState('3');
  const [payAmount, setPayAmount] = useState('1500');
  const [experienceRequired, setExperienceRequired] = useState('1+ year');
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [skillsStr, setSkillsStr] = useState('Event Safety, Crowd Control, VIP Escort');
  const [description, setDescription] = useState('Manage assigned event position with high professionalism and punctual attendance.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseInt(requiredQuantity);
    if (isNaN(qty) || qty <= 0) {
      addToast('Required staff count must be at least 1.', 'error', 'Invalid Count');
      return;
    }

    const pay = parseInt(payAmount);
    if (isNaN(pay) || pay <= 0) {
      addToast('Suggested pay amount must be greater than 0.', 'error', 'Invalid Pay');
      return;
    }

    const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(Boolean);

    addStaffRequirement({
      eventId: targetEventId,
      role,
      requiredQuantity: qty,
      payAmount: pay,
      experienceRequired,
      shiftStart,
      shiftEnd,
      requiredSkills: skillsArray.length > 0 ? skillsArray : ['Event Management'],
      description,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Staffing Requirement"
      description="Specify headcount, pay rates, required skills, and shift times"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Event
          </label>
          <select
            value={targetEventId}
            disabled
            className="w-full h-10 px-3 bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-200"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name} ({ev.location})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Staff Role"
            value={role}
            onChange={e => setRole(e.target.value)}
            options={[
              { label: 'Security Guard', value: 'Security Guard' },
              { label: 'Waiter / Catering Staff', value: 'Waiter' },
              { label: 'Usher / Host', value: 'Usher' },
              { label: 'Event Assistant / Coordinator', value: 'Event Assistant' },
              { label: 'Registration Desk Agent', value: 'Registration Desk Agent' },
              { label: 'VIP Protocol Manager', value: 'VIP Protocol Manager' },
            ]}
          />

          <Input
            label="Headcount Needed (Workers)"
            type="number"
            min="1"
            max="100"
            value={requiredQuantity}
            onChange={e => setRequiredQuantity(e.target.value)}
            leftIcon={<Users className="w-4 h-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Shift Wage / Daily Rate (₹)"
            type="number"
            min="100"
            step="50"
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            required
          />

          <Select
            label="Min Experience Required"
            value={experienceRequired}
            onChange={e => setExperienceRequired(e.target.value)}
            options={[
              { label: 'Entry Level / Any', value: 'Any' },
              { label: '1+ year experience', value: '1+ year' },
              { label: '2+ years experience', value: '2+ years' },
              { label: '3+ years experience', value: '3+ years' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Shift Start Time"
            type="time"
            value={shiftStart}
            onChange={e => setShiftStart(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
            required
          />

          <Input
            label="Shift End Time"
            type="time"
            value={shiftEnd}
            onChange={e => setShiftEnd(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
            required
          />
        </div>

        <Input
          label="Required Skills (Comma separated)"
          value={skillsStr}
          onChange={e => setSkillsStr(e.target.value)}
          placeholder="e.g. Crowd Control, Event Safety, Guest Greeting"
          leftIcon={<Award className="w-4 h-4" />}
        />

        <Textarea
          label="Role Responsibilities & Instructions"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<Plus className="w-4 h-4" />}>
            Publish Staffing Requirement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
