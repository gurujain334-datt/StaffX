import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QrCode, Copy, Check, Download, ShieldCheck } from 'lucide-react';

export interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  qrToken: string;
  venue: string;
  date: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  eventName,
  qrToken,
  venue,
  date,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Attendance QR Pass"
      description="Display this QR code at the entrance or registration desk for assigned staff to check in."
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center space-y-4 py-2">
        {/* Event details header */}
        <div className="w-full p-3 bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-left">
          <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Authorized Event Token</div>
          <h4 className="text-sm font-bold text-white mt-0.5">{eventName}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{venue} • {date}</p>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 bg-slate-900 dark:bg-slate-950 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl shadow-inner flex flex-col items-center justify-center">
          {/* Stylized high-contrast SVG QR matrix */}
          <div className="w-52 h-52 p-3 bg-slate-900 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Corner position markers */}
              <rect x="5" y="5" width="26" height="26" rx="4" fill="#1E1B4B" />
              <rect x="9" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="13" y="13" width="10" height="10" rx="1" fill="#4F46E5" />

              <rect x="69" y="5" width="26" height="26" rx="4" fill="#1E1B4B" />
              <rect x="73" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="77" y="13" width="10" height="10" rx="1" fill="#4F46E5" />

              <rect x="5" y="69" width="26" height="26" rx="4" fill="#1E1B4B" />
              <rect x="9" y="73" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="13" y="77" width="10" height="10" rx="1" fill="#4F46E5" />

              {/* Matrix blocks */}
              <rect x="36" y="8" width="5" height="5" fill="#1E1B4B" />
              <rect x="46" y="8" width="5" height="5" fill="#1E1B4B" />
              <rect x="56" y="8" width="5" height="5" fill="#1E1B4B" />
              <rect x="36" y="18" width="5" height="5" fill="#4F46E5" />
              <rect x="46" y="24" width="8" height="8" fill="#1E1B4B" />
              <rect x="58" y="18" width="5" height="5" fill="#1E1B4B" />

              <rect x="8" y="38" width="6" height="6" fill="#1E1B4B" />
              <rect x="20" y="44" width="6" height="6" fill="#4F46E5" />
              <rect x="36" y="38" width="28" height="28" rx="3" fill="#EEF2FF" />
              <text x="50" y="55" fontSize="10" textAnchor="middle" fontWeight="bold" fill="#4F46E5">
                STAFFX
              </text>

              <rect x="74" y="38" width="6" height="6" fill="#1E1B4B" />
              <rect x="86" y="44" width="6" height="6" fill="#4F46E5" />

              <rect x="36" y="72" width="6" height="6" fill="#1E1B4B" />
              <rect x="48" y="78" width="8" height="8" fill="#4F46E5" />
              <rect x="62" y="72" width="6" height="6" fill="#1E1B4B" />
              <rect x="74" y="78" width="8" height="8" fill="#1E1B4B" />
              <rect x="86" y="86" width="6" height="6" fill="#4F46E5" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="sr-only">Event QR Code</span>
            </div>
          </div>

          <p className="text-[11px] font-mono-num text-slate-500 dark:text-slate-400 mt-3 font-semibold">
            {qrToken}
          </p>
        </div>

        {/* Copy Token Helper */}
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            onClick={handleCopy}
          >
            {copied ? 'Copied Token' : 'Copy QR Token'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
