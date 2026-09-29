import React, { useState } from 'react';
import { Sparkles, Check, Edit2, Loader2, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { aiService, AIBioResult } from '../../services/aiService';

interface AIBioGeneratorProps {
  currentRole: string;
  onApply: (bio: string, skills: string[]) => void;
}

export const AIBioGenerator: React.FC<AIBioGeneratorProps> = ({ currentRole, onApply }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<AIBioResult | null>(null);
  const [editedBio, setEditedBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await aiService.generateBio(inputText, currentRole);
      setGenerated(res.result);
      setEditedBio(res.result.bio);
      setSelectedSkills(res.result.suggestedSkills);
    } catch (err) {
      console.error('Bio generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleApplyToProfile = () => {
    if (!editedBio) return;
    onApply(editedBio, selectedSkills);
    setGenerated(null);
    setInputText('');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
          <Wand2 className="w-4 h-4 animate-bounce" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            AI Profile & Skill Assistant
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Gemini AI
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Type your background experience notes below to auto-generate a polished bio and skill tags.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="e.g. Worked 3 years as event security and waiter for 15+ high profile wedding receptions and corporate expos..."
          rows={2}
          className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
        />

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={loading || !inputText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Generating Bio & Skills...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                ✨ Generate Profile Bio & Skills
              </>
            )}
          </Button>
        </div>
      </div>

      {generated && (
        <div className="mt-4 p-4 bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Generated Professional Bio (Editable)
            </label>
            <textarea
              value={editedBio}
              onChange={e => setEditedBio(e.target.value)}
              rows={3}
              className="w-full p-2.5 text-xs bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-white font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Extracted Skills (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map((skill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors bg-indigo-600 text-white flex items-center gap-1 shadow-2xs"
                >
                  <Check className="w-3 h-3" />
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 font-medium">Review and confirm before applying to your public profile.</span>
            <Button size="sm" onClick={handleApplyToProfile} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              <Check className="w-3.5 h-3.5 mr-1" />
              Apply to My Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
