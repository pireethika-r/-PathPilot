import React from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  Briefcase, 
  Users, 
  Sparkles,
  ChevronRight,
  Star,
  Award,
  TrendingUp,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
  Clock
} from 'lucide-react';

const LandingPage = ({ setCurrentView }) => {
  // Stats data
  const stats = [
    { value: '120+', label: 'Courses Available', icon: BookOpen },
    { value: '40+', label: 'Career Paths', icon: Briefcase },
    { value: '300+', label: 'Active Learners', icon: Users },
  ];

  // Features data
  const features = [
    {
      title: 'Career Recommendation',
      description: 'Get personalized career suggestions based on your skills, interests, and goals.',
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Course Catalog',
      description: 'Browse our extensive library of courses designed by industry experts.',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'My Learning',
      description: 'Track your progress, earn certificates, and manage your learning journey.',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  // Partner universities data
  const partners = [
    { name: 'ILLINOIS', logo: '🎓', bgColor: 'bg-orange-50' },
    { name: 'Duke University', logo: '🦈', bgColor: 'bg-blue-50' },
    { name: 'Google', logo: 'G', bgColor: 'bg-red-50' },
    { name: 'IBM', logo: 'IBM', bgColor: 'bg-gray-50' },
    { name: 'VANDERBILT', logo: 'V', bgColor: 'bg-gold-50' },
    { name: 'JOHNS HOPKINS', logo: 'JH', bgColor: 'bg-blue-50' },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer at TechCorp',
      content: 'PathPilo helped me transition from retail to tech. The career recommendations were spot-on, and the courses are incredibly practical.',
      rating: 5,
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Data Analyst',
      content: 'The personalized learning paths saved me months of guesswork. I landed my dream job in data science within 6 months!',
      rating: 5,
      avatar: 'MC',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      content: 'Best investment in my career. The platform is intuitive, and the community is incredibly supportive.',
      rating: 5,
      avatar: 'ER',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-xl text-gray-900">PathPilot</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition">Explore</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition">Degrees</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition">For Business</a>
            </div>

            {/* Auth Buttons */}
            <button
              onClick={() => setCurrentView("login")}
              className="text-gray-600 hover:text-gray-900 transition"
            >
            Log In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-purple-100/50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-1" />
                Smart Career Guidance
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Achieve your career goals with{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  PathPilo
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Discover the right career path, learn new skills, and build your future with our smart recommendation system.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 font-medium">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 font-medium">
                  Explore Courses
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-6 border-t border-gray-200">
                {stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className="w-5 h-5 text-indigo-500" />
                      <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-30" />
              <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Smart Recommendation</p>
                    <p className="text-xs text-gray-500">Based on your profile</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {['Data Science', 'Product Management', 'UX Design'].map((path, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium text-gray-700">{path}</span>
                      </div>
                      <span className="text-xs text-gray-400">92% match</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Learning path recommended for you</span>
                    <span className="text-indigo-600 font-medium">View all →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by learners from world-class institutions</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {partners.map((partner, idx) => (
              <div key={idx} className={`${partner.bgColor} rounded-xl p-4 flex items-center justify-center hover:shadow-md transition`}>
                <span className="font-semibold text-gray-600">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to accelerate your career journey in one intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                <button className="mt-5 text-indigo-600 font-medium flex items-center gap-1 group-hover:gap-2 transition">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coursera Plus Style Promo */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-sm mb-4">
                <Zap className="w-4 h-4 mr-1" />
                Premium Access
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                PathPilo Plus
              </h2>
              <p className="text-lg text-white/80 mb-6">
                Achieve your career goals with PathPilo Plus. Subscribe to build job-ready skills from world-class institutions.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-2xl font-bold">$24<span className="text-sm font-normal">/month</span></p>
                  <p className="text-sm text-white/70">cancel anytime</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-2xl font-bold">$160<span className="text-sm font-normal">/year</span></p>
                  <p className="text-sm text-white/70">14-day money-back guarantee</p>
                </div>
              </div>
              <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg">
                Start 7-day Free Trial
              </button>
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>350+ partners</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Globe className="w-4 h-4" />
                  <span>Self-paced learning</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Award className="w-4 h-4" />
                  <span>Shareable certificates</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['ILLINOIS', 'Duke', 'Google', 'IBM'].map((uni, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <p className="font-semibold">{uni}</p>
                  <p className="text-xs text-white/60">Partner University</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Learners Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals who transformed their careers with PathPilot
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-100 to-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join PathPilo today and get personalized career guidance tailored just for you.
          </p>
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto">
            Get Started for Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="font-bold text-white text-lg">PathPilot</span>
              </div>
              <p className="text-sm">Smart career guidance for the modern professional.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 PathPilo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;