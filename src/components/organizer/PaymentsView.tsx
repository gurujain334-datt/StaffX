import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  Search,
  Filter
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { payments, updatePaymentStatus } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  const totalCost = payments.reduce((acc, p) => acc + p.amount, 0);
  const paidTotal = payments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0);
  const pendingTotal = payments.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + p.amount, 0);

  const filteredPayments = payments.filter(p => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payments & Financial Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Transparent event workforce payroll and payment settlement tracking
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl">
          {(['ALL', 'PENDING', 'PAID'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === f
                  ? 'bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-100 dark:hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'All Records' : f.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Metric Cards per Section 27 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Total Workforce Cost</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono-num">
            ₹{totalCost.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Contracted event staff wages</span>
        </Card>

        <Card padding="md" className="border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Settled / Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono-num">
            ₹{paidTotal.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
            {totalCost > 0 ? Math.round((paidTotal / totalCost) * 100) : 0}% completed
          </span>
        </Card>

        <Card padding="md" className="border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Pending Release</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono-num">
            ₹{pendingTotal.toLocaleString()}
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 block">Awaiting organizer payout approval</span>
        </Card>
      </div>

      {/* Payments Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Workforce Compensation Records</h3>
          <span className="text-xs text-slate-400">{filteredPayments.length} entries</span>
        </div>

        {filteredPayments.length === 0 ? (
          <EmptyState
            title="No payment records found"
            description="Payment entries appear automatically when professionals are assigned or complete shifts."
          />
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredPayments.map(p => (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{p.professionalName}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-indigo-400">{p.role}</span>
                    <span>•</span>
                    <span>{p.eventName}</span>
                    {p.transactionReference && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-500">{p.transactionReference}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-white block">₹{p.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500">Fixed rate</span>
                  </div>

                  {p.status === 'PENDING' ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => updatePaymentStatus(p.id, 'PAID')}
                    >
                      Mark as Paid
                    </Button>
                  ) : (
                    <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Paid via {p.paymentMethod || 'UPI'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
