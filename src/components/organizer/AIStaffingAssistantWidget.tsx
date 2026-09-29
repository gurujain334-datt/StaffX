import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { aiService } from '../../services/aiService';
import { Event, StaffingRequirement, Application } from '../../types';

interface AIStaffingAssistantWidgetProps {
  events: Event[];
  requirements: StaffingRequirement[];
  applications: Application[];
}

export const AIStaffingAssistantWidget: React.FC<AIStaffingAssistantWidgetProps> = ({
  events,
  requirements,
  applications,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am your StaffX AI Staffing Assistant. Ask me anything about headcount planning, unfilled roles, or candidate evaluations.',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Which staffing positions are still unfilled?',
    'How many staff for a 500-guest wedding?',
    'Give me a summary of active events.',
  ];

  const handleSend = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || loading) return;

    const userMsg = text.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    if (!promptToSend) setInputPrompt('');
    setLoading(true);

    try {
      const res = await aiService.askAssistant(userMsg, { events, requirements, applications });
      setMessages(prev => [...prev, { sender: 'assistant', text: res.answer }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "I don't have enough information to answer that right now or the AI service is temporarily offline.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer ring-4 ring-indigo-200 dark:ring-indigo-950"
          title="Open AI Staffing Assistant"
        >
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="text-xs font-bold pr-1">✨ AI Assistant</span>
        </button>
      )}

      {/* Assistant Modal Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  AI Staffing Advisor
                  <span className="text-[9px] font-extrabold uppercase bg-slate-900/20 px-1.5 py-0.2 rounded-full">
                    Gemini 3.8
                  </span>
                </h3>
                <p className="text-[10px] text-indigo-100">Database Context Grounded</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-900/20 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 text-[10px] font-semibold bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full whitespace-nowrap hover:bg-indigo-50 dark:hover:bg-indigo-950 cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-900/40 dark:bg-slate-900/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-900 dark:bg-slate-800 text-white border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-2.5 bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span className="text-[11px]">Analyzing event database...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask AI about headcount, unfilled roles..."
              className="flex-1 px-3 py-1.5 text-xs bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputPrompt.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
