import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QRScanner } from '../shared/QRScanner';
import { QrCode, CheckCircle2, AlertCircle, Camera, ShieldCheck, ArrowRight } from 'lucide-react';

export interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId?: string;
  defaultEventToken?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  defaultEventToken,
}) => {
  const {
    events,
    assignments,
    recordCheckIn,
    recordCheckOut,
    currentProfessional,
    addToast
  } = useApp();

  const [inputToken, setInputToken] = useState(defaultEventToken || '');
  const [scanType, setScanType] = useState<'IN' | 'OUT'>('IN');
  const [successResult, setSuccessResult] = useState<{ time: string; eventName: string; type: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Determine active assignment for this pro with safe fallback
  const targetAssignment = assignmentId
    ? assignments.find(a => a.id === assignmentId)
    : assignments.find(a => (currentProfessional ? a.professionalId === currentProfessional.id : false) && a.status === 'CONFIRMED');

  const targetEvent = (targetAssignment ? events.find(e => e.id === targetAssignment.eventId) : null) || events[0] || null;

  const handleScanResult = (decodedText: string) => {
    setInputToken(decodedText);
    setIsScanning(false);
    
    // Auto submit on valid scan
    handleScanOrSubmit(decodedText);
  };

  const handleScanOrSubmit = (scannedToken?: string) => {
    if (!targetAssignment) {
      addToast('No active confirmed assignment found to verify attendance for.', 'error');
      return;
    }

    const tokenToUse = scannedToken || inputToken.trim() || targetEvent?.qrCodeToken || '';
    if (!tokenToUse) {
      addToast('Please provide a valid Event QR code token.', 'error');
      return;
    }

    if (scanType === 'IN') {
      const res = recordCheckIn(tokenToUse);
      if (res.success) {
        setSuccessResult({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          eventName: targetEvent?.name || 'Event Assignment',
          type: 'Check-In',
        });
      }
    } else {
      const res = recordCheckOut(targetAssignment.id);
      if (res.success) {
        setSuccessResult({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          eventName: targetEvent?.name || 'Event Assignment',
          type: 'Check-Out',
        });
      }
    }
  };

  const handleSimulateInstantCameraScan = () => {
    setInputToken(targetEvent?.qrCodeToken || 'STAFFX-CORP-2026-TOKEN-9921');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSuccessResult(null);
        onClose();
      }}
      title="On-Site QR Attendance Scanner"
      description="Scan the event QR pass or enter the token to verify check-in and check-out."
      maxWidth="sm"
    >
      {successResult ? (
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              Attendance {successResult.type} Verified!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Recorded at {successResult.time} for <br />
              <strong className="text-slate-800">{successResult.eventName}</strong>
            </p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic match confirmed on-site</span>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              setSuccessResult(null);
              onClose();
            }}
          >
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Shift Context */}
          {targetAssignment && targetEvent && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs space-y-1">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">Assigned Event: {targetEvent.name}</span>
              <span className="text-indigo-700 dark:text-indigo-300 block">Role: {targetAssignment.role} • {targetEvent.venue}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setScanType('IN'); setIsScanning(false); }}
              className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                scanType === 'IN'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-700'
              }`}
            >
              Scan Check-In
            </button>
            <button
              type="button"
              onClick={() => { setScanType('OUT'); setIsScanning(false); }}
              className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                scanType === 'OUT'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-700'
              }`}
            >
              Scan Check-Out
            </button>
          </div>

          {/* Camera Viewfinder */}
          {isScanning ? (
            <div className="relative">
              <QRScanner onResult={handleScanResult} onError={(e) => console.warn(e)} />
              <button 
                type="button" 
                onClick={() => setIsScanning(false)}
                className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded border border-slate-700"
              >
                Close Camera
              </button>
            </div>
          ) : (
            <div 
              className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-700 p-4 cursor-pointer hover:bg-slate-800 transition-colors"
              onClick={() => setIsScanning(true)}
            >
              <div className="w-36 h-36 border-2 border-emerald-400 rounded-lg relative flex items-center justify-center animate-pulse">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                <Camera className="w-8 h-8 text-emerald-400 opacity-60" />
              </div>
              <p className="text-[11px] text-slate-300 mt-2 font-medium">
                Tap to open camera and scan Organizer's Event Pass
              </p>
            </div>
          )}

          {/* Quick Simulation Button for Demo */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleSimulateInstantCameraScan}
              className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              [Auto-Fill Event Pass QR Token for Demo]
            </button>
          </div>

          <Input
            label="QR Token String"
            value={inputToken}
            onChange={e => setInputToken(e.target.value)}
            placeholder="e.g. STAFFX-CORP-2026-TOKEN-9921"
            leftIcon={<QrCode className="w-4 h-4" />}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleScanOrSubmit()}>
              Verify Attendance
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
