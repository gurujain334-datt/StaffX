import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { CreditCard, CheckCircle2, Clock, ArrowDownLeft, ShieldCheck } from 'lucide-react';

export const ProfessionalEarningsView: React.FC = () => {
  const { payments, currentProfessional } = useApp();

  const proId = currentProfessional?.id;
  const myPayments = payments.filter(p => proId ? p.professionalId === proId : false);
  const totalEarned = myPayments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = myPayments.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">Earnings & Payout Ledger</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete transparent history of event shift payouts and pending releases
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Total Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono-num">
            ₹{totalEarned.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Deposited to bank / UPI</span>
        </Card>

        <Card padding="md" className="border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Pending Payout</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono-num">
            ₹{pendingAmount.toLocaleString()}
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 block">Awaiting organizer release</span>
        </Card>

        <Card padding="md" className="border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Standard Hourly Rate</span>
            <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono-num">
            ₹{currentProfessional?.hourlyRate ?? 250}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Base profile rate</span>
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Shift Payout Breakdown</h3>
          <span className="text-xs text-slate-400">{myPayments.length} transactions</span>
        </div>

        {myPayments.length === 0 ? (
          <EmptyState
            title="No payout history yet"
            description="Complete confirmed event shifts and check in with the QR code to receive daily shift earnings."
          />
        ) : (
          <div className="divide-y divide-slate-800">
            {myPayments.map(p => (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{p.eventName}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-indigo-400">{p.role}</span>
                    {p.transactionReference && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-500">Ref: {p.transactionReference}</span>
                      </>
                    )}
                    {p.paidAt && (
                      <>
                        <span>•</span>
                        <span>Paid on {p.paidAt.split('T')[0]}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-lg font-black text-white block">₹{p.amount.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500">Method: {p.paymentMethod || 'UPI'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
