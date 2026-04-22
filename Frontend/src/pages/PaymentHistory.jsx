import React, { useEffect, useState } from 'react';
import { CreditCardIcon, ReceiptIcon, TagIcon, WalletIcon } from 'lucide-react';

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
     'numeric',
    minute: '2-digit'
  }).format(parsed);
};

export function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) return { 'Content-Type': 'application/json' };
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  useEffect(() => {
    const loadPayments = async () => {
      setIsLoading(true);
      setApiError('');

      try {
        const response = await fetch('/api/learning/payments', {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load payment history');
        setPayments(data.payments || []);
      } catch (error) {
        setApiError(error.message || 'Failed to load payment history');
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, []);

  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0);
  const totalSaved = payments.reduce((sum, payment) => sum + Number(payment.totalDiscount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment History</h2>
        <p className="text-slate-600">Review your receipts, discounts, and completed payments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Payments</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{payments.length}</p>
            </div>
            <ReceiptIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Paid</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalPaid)}</p>
            </div>
            <WalletIcon className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Saved</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalSaved)}</p>
            </div>
            <TagIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {apiError}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-slate-600">Loading payment history...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-slate-600">
          No payment history found yet.
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCardIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">{payment.receiptNumber}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      payment.status === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Transaction: {payment.transactionId}</p>
                  <p className="text-sm text-slate-600">Paid on: {formatDate(payment.paidAt)}</p>
                  <p className="text-sm text-slate-600">Method: {payment.method}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {payment.courseIds.length > 0 ? payment.courseIds.map((courseId) => (
                      <span key={courseId} className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        {courseId}
                      </span>
                    )) : <span className="text-xs text-slate-500">No course IDs</span>}
                  </div>
                </div>

                <div className="w-full lg:w-64 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium text-slate-900">{formatCurrency(payment.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Discount</span>
                    <span className="font-medium text-green-700">-{formatCurrency(payment.totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-3 border-t border-slate-200">
                    <span className="text-slate-900">Amount Paid</span>
                    <span className="text-slate-900">{formatCurrency(payment.amountPaid)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
