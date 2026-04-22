import React from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Users,
  Sparkles,
  ChevronRight,
  Star,
  TrendingUp,
  CheckCircle2,
  Zap,
  Globe,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

const Home = ({ setCurrentView }) => {

  const stats = [
    { value: "120+", label: "Courses Available", icon: BookOpen },
    { value: "40+", label: "Career Paths", icon: Briefcase },
    { value: "300+", label: "Active Learners", icon: Users },
  ];

  const features = [
    {
      title: "AI Career Recommendation",
      description:
        "Receive personalized career paths based on your skills, interests, and goals.",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "Course Catalog",
      description:
        "Explore industry-relevant courses designed to make you job-ready.",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Learning Dashboard",
      description:
        "Track progress, complete lessons, and achieve milestones effortlessly.",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content:
        "PathPilot helped me transition into tech with confidence. The guidance was incredibly accurate.",
    },
    {
      name: "Michael Chen",
      role: "Data Analyst",
      content:
        "The structured learning path saved me months. Highly recommended!",
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager",
      content:
        "Simple, clean, and powerful. Everything I needed in one platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* 🔷 NAVBAR */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur border-b z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
              P
            </div>
            <span className="font-bold text-xl">PathPilot</span>
          </div>

          <button
            onClick={() => setCurrentView("login")}
            className="text-gray-600 hover:text-black"
          >
            Log In
          </button>
        </div>
      </nav>

      {/* 🔥 HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm">
            AI-Powered Career Guidance
          </span>

          <h1 className="text-5xl font-bold mt-6 leading-tight">
            Achieve your career goals with{" "}
            <span className="text-indigo-600">PathPilot</span>
          </h1>

          <p className="text-gray-600 mt-4 text-lg">
            Discover the right career path, build in-demand skills, and grow with
            personalized recommendations.
          </p>

          <div className="flex gap-4 mt-6">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700">
              Get Started <ArrowRight size={18} />
            </button>

            <button className="border px-6 py-3 rounded-xl flex items-center gap-2">
              Explore <ChevronRight size={18} />
            </button>
          </div>

          {/* 📊 STATS */}
          <div className="grid grid-cols-3 gap-6 mt-10">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <h3 className="font-semibold mb-4">Recommended Paths</h3>

          {["Software Engineering", "Data Science", "UI/UX Design"].map(
            (item, i) => (
              <div
                key={i}
                className="flex justify-between p-3 bg-gray-50 rounded-lg mb-2"
              >
                <span>{item}</span>
                <span className="text-indigo-600 text-sm">90% match</span>
              </div>
            )
          )}
        </motion.div>
      </section>

      {/* 🌟 FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
          <p className="text-gray-500 mb-12">
            Everything you need to build your career
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gray-50 rounded-2xl shadow-sm"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${f.color} text-white flex items-center justify-center rounded-xl mb-4`}>
                  <f.icon size={22} />
                </div>

                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-gray-500 mt-2">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 💎 PREMIUM SECTION */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-4xl font-bold mb-4">PathPilot Plus</h2>
            <p className="text-white/80 mb-6">
              Unlock premium courses and advanced learning paths.
            </p>

            <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-semibold">
              Start Free Trial
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {["Google", "IBM", "Meta", "Microsoft"].map((p, i) => (
              <div key={i} className="bg-white/10 p-4 rounded-xl text-center">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 💬 TESTIMONIALS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold mb-10">What Learners Say</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-600 mb-4">"{t.content}"</p>
                <h4 className="font-semibold">{t.name}</h4>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 CTA */}
      <section className="py-20 text-center bg-gray-100">
        <h2 className="text-3xl font-bold mb-4">
          Start Your Career Journey Today
        </h2>

        <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl">
          Get Started
        </button>
      </section>

      {/* 🔻 FOOTER */}
      <footer className="bg-black text-gray-400 py-10 text-center">
        <p>© 2026 PathPilot. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;