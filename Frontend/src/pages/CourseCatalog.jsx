import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TagIcon
} from 'lucide-react';

const formatCurrency = (amount) =>
  `Rs. ${Number(amount || 0).toFixed(2)}`;

const PAYMENT_METHODS = ['Stripe'];

export function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const loadCourses = async () => {
      setIsLoading(true);
      setApiError('');
      try {
        const response = await fetch('/api/learning/courses', { headers: getAuthHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load courses');
        setCourses(data.courses || []);
      } catch (error) {
        setApiError(error.message || 'Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    const confirmStripeSession = async () => {
      if (payment !== 'success' || !sessionId) return;
      setApiError('');
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/learning/stripe/confirm-session', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ sessionId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to confirm Stripe payment');
        setPaymentResult(data);
        setIsPaid(true);
        setIsCheckingOut(false);
        setSummary(null);
        setSelectedCourses([]);
      } catch (error) {
        setApiError(error.message || 'Failed to confirm Stripe payment');
      } finally {
        setIsSubmitting(false);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    };

    if (payment === 'cancelled') {
      setApiError('Stripe checkout was cancelled. You can try again.');
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      return;
    }

    confirmStripeSession();
  }, []);

  const toggleCourse = (id) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((courseId) => courseId !== id) : [...prev, id]
    );
  };

  const selectedCourseDetails = useMemo(
    () => courses.filter((course) => selectedCourses.includes(course.id)),
    [courses, selectedCourses]
  );

  const subtotal = selectedCourseDetails.reduce((sum, course) => sum + course.price, 0);
  const discount = selectedCourses.length > 1 ? subtotal * 0.15 : 0;
  const total = subtotal - discount;
  const bundleDiscountRate = selectedCourses.length > 1 ? 15 : 0;

  const handleStartCheckout = async () => {
    setApiError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/learning/checkout-summary', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ courseIds: selectedCourses })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to prepare checkout');
      setSummary(data);
      setIsCheckingOut(true);
    } catch (error) {
      setApiError(error.message || 'Failed to prepare checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsSubmitting(true);
    try {
      if (paymentMethod === 'Stripe') {
        const stripeResponse = await fetch('/api/learning/stripe/checkout-session', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            courseIds: selectedCourses
          })
        });
        const stripeData = await stripeResponse.json();
        if (!stripeResponse.ok) throw new Error(stripeData.message || 'Failed to start Stripe checkout');
        if (!stripeData.checkoutUrl) throw new Error('Stripe checkout URL is missing.');
        window.location.href = stripeData.checkoutUrl;
        return;
      }

      const response = await fetch('/api/learning/enroll', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          courseIds: selectedCourses,
          paymentMethod
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payment failed');
      setPaymentResult(data);
      setIsPaid(true);
    } catch (error) {
      setApiError(error.message || 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPaid && paymentResult) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h2>
          <p className="text-slate-600 mb-8 text-lg">
            Enrollment completed for {paymentResult.summary.selectedCourses.length} course
            {paymentResult.summary.selectedCourses.length > 1 ? 's' : ''}.
          </p>
          <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">Receipt</h3>
            <p className="text-sm text-slate-600 mb-1">Receipt: {paymentResult.payment.receiptNumber}</p>
            <p className="text-sm text-slate-600 mb-1">Transaction: {paymentResult.payment.transactionId}</p>
            <p className="text-sm text-slate-600 mb-4">Method: {paymentResult.payment.paymentMethod}</p>
            <div className="space-y-3 mb-4">
              {paymentResult.summary.selectedCourses.map((course) => (
                <div key={course.id} className="flex justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{course.title}</p>
                    <p className="text-xs text-slate-500">
                      ${course.price.toFixed(2)}
                      {course.discount > 0 ? ` - Discount $${course.discount.toFixed(2)}` : ''}
                    </p>
                  </div>
                  <span className="font-medium text-slate-900">${course.finalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>${paymentResult.summary.subtotal.toFixed(2)}</span>
              </div>
              {paymentResult.summary.totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Bundle Discount ({Math.round(paymentResult.summary.discountRate * 100)}%)</span>
                  <span>-${paymentResult.summary.totalDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-sm font-bold pt-4 border-t border-slate-200">
              <span>Total Paid</span>
              <span>${paymentResult.summary.finalTotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPaid(false);
              setPaymentResult(null);
              setSelectedCourses([]);
              setSummary(null);
              setIsCheckingOut(false);
            }}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (isCheckingOut && summary) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setIsCheckingOut(false)}
          className="text-blue-600 hover:text-blue-800 mb-6 font-medium text-sm"
        >
          &larr; Back to Courses
        </button>
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Secure Checkout</h2>

        {apiError && (
          <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6 text-slate-800">
              <CreditCardIcon className="w-6 h-6 mr-2 text-blue-600" />
              <h3 className="text-xl font-semibold">Payment Details</h3>
            </div>
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                {isSubmitting
                  ? 'Processing...'
                  : paymentMethod === 'Stripe'
                    ? `Continue to Stripe ($${summary.finalTotal.toFixed(2)})`
                    : `Pay $${summary.finalTotal.toFixed(2)} Securely`}
              </button>
            </form>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 h-fit">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {summary.selectedCourses.map((course) => (
                <div key={course.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{course.title}</p>
                    <p className="text-xs text-slate-500">{course.duration}</p>
                    {course.discount > 0 && (
                      <p className="text-xs text-green-600">
                        ${course.price.toFixed(2)} - Save ${course.discount.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-900">${course.finalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">${summary.subtotal.toFixed(2)}</span>
              </div>
              {summary.totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Bundle Discount ({Math.round(summary.discountRate * 100)}%)</span>
                  <span>-${summary.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200 mt-2">
                <span>Total</span>
                <span>${summary.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Recommended Courses</h2>
          <p className="text-slate-600">Select courses and proceed to secure checkout.</p>
        </div>
        {selectedCourses.length > 0 && (
          <button
            onClick={handleStartCheckout}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? 'Preparing...' : `Proceed to Checkout (${selectedCourses.length})`}
          </button>
        )}
      </div>

      {apiError && (
        <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {apiError}
        </div>
      )}

      {selectedCourses.length > 1 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
          <TagIcon className="w-5 h-5 mr-3 text-green-600" />
          <span>
            <strong>Bundle Offer Applied:</strong> A 15% discount will be applied at checkout.
          </span>
        </div>
      )}

      {selectedCourses.length > 0 && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>Subtotal: <strong>${subtotal.toFixed(2)}</strong></span>
            {discount > 0 && <span className="text-green-700">Discount: <strong>-${discount.toFixed(2)}</strong></span>}
            <span>Total: <strong>${total.toFixed(2)}</strong></span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-slate-600">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-slate-600">
          No active courses available right now. Please check again later or contact admin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => {
            const isSelected = selectedCourses.includes(course.id);
            return (
              <div
                key={course.id}
                className={`bg-white rounded-xl overflow-hidden transition-all border-2 ${
                  isSelected
                    ? 'border-blue-500 shadow-md transform -translate-y-1'
                    : 'border-slate-200 shadow-sm hover:border-blue-300'
                }`}
              >
                <div className={`h-32 ${course.image} relative`}>
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-sm">
                      <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col h-[calc(100%-8rem)]">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{course.title}</h3>
                  <p className="text-xs text-slate-600 mb-3">{course.description}</p>
                  <div className="flex items-center text-sm text-slate-500 mb-4">
                    <ClockIcon className="w-4 h-4 mr-1.5" /> {course.duration}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-6 flex-1">
                    {course.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {bundleDiscountRate > 0 && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                      <p className="text-xs font-medium text-green-700">
                        Bundle price: ${(course.price * (1 - bundleDiscountRate / 100)).toFixed(2)}
                      </p>
                      <p className="text-[11px] text-green-600">
                        Save ${(course.price * (bundleDiscountRate / 100)).toFixed(2)} with the current {bundleDiscountRate}% offer
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div>
                      <span className={`text-xl font-bold ${bundleDiscountRate > 0 ? 'text-slate-500 line-through text-base mr-2' : 'text-slate-900'}`}>${course.price.toFixed(2)}</span>
                      {bundleDiscountRate > 0 && (
                        <span className="text-xl font-bold text-green-700">
                          ${(course.price * (1 - bundleDiscountRate / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleCourse(course.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
