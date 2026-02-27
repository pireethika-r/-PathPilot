import React, { useState } from 'react';
import { ClockIcon, TagIcon, CheckCircleIcon, CreditCardIcon, ShieldCheckIcon } from 'lucide-react';
// Mock Courses
const MOCK_COURSES = [
    {
        id: 'CRS-01',
        title: 'Advanced React Patterns',
        duration: '4 Weeks',
        skills: ['React', 'Hooks', 'Performance'],
        price: 149,
        image: 'bg-blue-500'
    },
    {
        id: 'CRS-02',
        title: 'Full-Stack Next.js',
        duration: '6 Weeks',
        skills: ['Next.js', 'API Routes', 'Prisma'],
        price: 199,
        image: 'bg-slate-800'
    },
    {
        id: 'CRS-03',
        title: 'UI/UX Design Fundamentals',
        duration: '3 Weeks',
        skills: ['Figma', 'Prototyping', 'Wireframing'],
        price: 99,
        image: 'bg-purple-500'
    },
    {
        id: 'CRS-04',
        title: 'Python for Data Science',
        duration: '8 Weeks',
        skills: ['Python', 'Pandas', 'Machine Learning'],
        price: 249,
        image: 'bg-green-600'
    }
];
export function CourseCatalog() {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const toggleCourse = (id) => {
        setSelectedCourses((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
    };
    const selectedCourseDetails = MOCK_COURSES.filter((c) => selectedCourses.includes(c.id));
    const subtotal = selectedCourseDetails.reduce((sum, course) => sum + course.price, 0);
    const discount = selectedCourses.length > 1 ? subtotal * 0.15 : 0; // 15% discount for multiple courses
    const total = subtotal - discount;
    const handlePayment = (e) => {
        e.preventDefault();
        setIsPaid(true);
    };
    if (isPaid) {
        return (<div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600"/>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Payment Successful!
          </h2>
          <p className="text-slate-600 mb-8 text-lg">
            You have successfully enrolled in {selectedCourses.length} course
            {selectedCourses.length > 1 ? 's' : ''}. Your learning journey
            begins now.
          </p>
          <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">
              Order Summary
            </h3>
            {selectedCourseDetails.map((course) => <div key={course.id} className="flex justify-between text-sm mb-2">

                <span className="text-slate-600">{course.title}</span>
                <span className="font-medium text-slate-900">
                  ${course.price}
                </span>
              </div>)}
            <div className="flex justify-between text-sm font-bold mt-4 pt-4 border-t border-slate-200">
              <span>Total Paid</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => {
                setIsPaid(false);
                setSelectedCourses([]);
                setIsCheckingOut(false);
            }} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">

            Go to Learning Dashboard
          </button>
        </div>
      </div>);
    }
    if (isCheckingOut) {
        return (<div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button onClick={() => setIsCheckingOut(false)} className="text-blue-600 hover:text-blue-800 mb-6 font-medium text-sm">

          &larr; Back to Courses
        </button>
        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          Secure Checkout
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6 text-slate-800">
              <CreditCardIcon className="w-6 h-6 mr-2 text-blue-600"/>
              <h3 className="text-xl font-semibold">Payment Details</h3>
            </div>
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="John Doe"/>

              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Card Number
                </label>
                <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0000 0000 0000 0000"/>

              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="MM/YY"/>

                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CVC
                  </label>
                  <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="123"/>

                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">

                <ShieldCheckIcon className="w-5 h-5 mr-2"/> Pay $
                {total.toFixed(2)} Securely
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 h-fit">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-4 mb-6">
              {selectedCourseDetails.map((course) => <div key={course.id} className="flex justify-between items-start">

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {course.title}
                    </p>
                    <p className="text-xs text-slate-500">{course.duration}</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    ${course.price}
                  </span>
                </div>)}
            </div>
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 &&
                <div className="flex justify-between text-sm text-green-600">
                  <span>Bundle Discount (15%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>}
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>);
    }
    return (<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Recommended Courses
          </h2>
          <p className="text-slate-600">
            Enhance your profile with industry-recognized certifications.
          </p>
        </div>
        {selectedCourses.length > 0 &&
            <button onClick={() => setIsCheckingOut(true)} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center">

            Proceed to Checkout ({selectedCourses.length})
          </button>}
      </div>

      {selectedCourses.length > 1 &&
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
          <TagIcon className="w-5 h-5 mr-3 text-green-600"/>
          <span>
            <strong>Bundle Offer Applied:</strong> You've selected multiple
            courses. A 15% discount will be applied at checkout!
          </span>
        </div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_COURSES.map((course) => {
            const isSelected = selectedCourses.includes(course.id);
            return (<div key={course.id} className={`bg-white rounded-xl overflow-hidden transition-all border-2 ${isSelected ? 'border-blue-500 shadow-md transform -translate-y-1' : 'border-slate-200 shadow-sm hover:border-blue-300'}`}>

              <div className={`h-32 ${course.image} relative`}>
                {isSelected &&
                    <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-sm">
                    <CheckCircleIcon className="w-6 h-6 text-blue-600"/>
                  </div>}
              </div>
              <div className="p-5 flex flex-col h-[calc(100%-8rem)]">
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                  {course.title}
                </h3>
                <div className="flex items-center text-sm text-slate-500 mb-4">
                  <ClockIcon className="w-4 h-4 mr-1.5"/> {course.duration}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-6 flex-1">
                  {course.skills.map((skill) => <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">

                      {skill}
                    </span>)}
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-xl font-bold text-slate-900">
                    ${course.price}
                  </span>
                  <button onClick={() => toggleCourse(course.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>

                    {isSelected ? 'Selected' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            </div>);
        })}
      </div>
    </div>);
}
