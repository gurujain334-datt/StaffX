import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onResult, onError }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        scannerRef.current = new Html5Qrcode("reader");
        scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
          },
          (decodedText) => {
            onResult(decodedText);
          },
          (errorMessage) => {
            // ignore scan errors, these happen when no QR code is in view
          }
        ).catch((err) => {
          setError("Failed to start camera. Please ensure permissions are granted.");
          setHasCamera(false);
          if (onError) onError(err.message);
        });
      } else {
        setError("No camera found on this device.");
        setHasCamera(false);
        if (onError) onError("No camera found");
      }
    }).catch(err => {
      setError("Failed to get cameras. Please ensure permissions are granted.");
      setHasCamera(false);
      if (onError) onError(err.message);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
        scannerRef.current.clear();
      }
    };
  }, []); // Only run once on mount

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-700 p-2">
      {error ? (
        <div className="flex flex-col items-center text-center p-4">
          <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-xs text-slate-300 font-medium">{error}</p>
          <p className="text-[10px] text-slate-500 mt-2">You can use the manual token entry below instead.</p>
        </div>
      ) : (
        <div id="reader" className="w-full h-full rounded-lg overflow-hidden [&>video]:object-cover" />
      )}
      
      {!error && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <div className="w-48 h-48 border-2 border-emerald-400/50 rounded-lg relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
           </div>
        </div>
      )}
    </div>
  );
};
