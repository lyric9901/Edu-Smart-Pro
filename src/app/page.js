"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  ArrowRight, 
  BarChart3, 
  Users, 
  Shield, 
  Zap, 
  Menu, 
  X,
  Star
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const reviews = [
    {
      name: "Rahul Sharma",
      role: "Director, Sharma Classes",
      text: "EduSmart Pro completely transformed how we manage attendance and fees. Parents love the instant updates!",
      rating: 5
    },
    {
      name: "Priya Verma",
      role: "Tutor, Excel Academy",
      text: "The interface is so clean and easy to use. I can manage my entire coaching from my phone now.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Institute Owner",
      text: "Best decision for my business. It looks professional and my students find the app really cool.",
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900">EduSmart<span className="text-blue-600">Pro</span></span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Features</a>
              <a href="#reviews" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Reviews</a>
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition">
                  Institute Login
                </Link>
                <Link href="/register" className="px-5 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-full hover:bg-black transition shadow-lg shadow-slate-200">
                  Register Free
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4">
            <Link href="/login" className="block w-full text-center py-3 font-bold text-slate-700 border border-slate-200 rounded-xl">
              Login
            </Link>
            <Link href="/register" className="block w-full text-center py-3 font-bold bg-blue-600 text-white rounded-xl">
              Register Now
            </Link>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-100 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6">
              <Zap size={14} fill="currentColor" /> New: Automated WhatsApp Notices
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">
              Manage your Coaching <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Like a Pro.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Attendance, Fees, Notices, and Student Tracking—all in one beautiful app. 
              Give your institute the digital upgrade it deserves.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                Get Started for Free <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Existing User Login
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-400 font-medium uppercase tracking-wider">
              Trusted by 100+ Institutes in India
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Everything you need to run your class</h2>
            <p className="text-slate-500">Stop using WhatsApp groups and Excel sheets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="text-blue-600" size={32} />}
              title="Student Management"
              desc="Add students, assign batches, and track their entire academic journey in one click."
              delay={0.1}
            />
            <FeatureCard 
              icon={<BarChart3 className="text-purple-600" size={32} />}
              title="Smart Attendance"
              desc="Mark attendance in seconds. Parents get instant alerts if their child is absent."
              delay={0.2}
            />
            <FeatureCard 
              icon={<CheckCircle2 className="text-green-600" size={32} />}
              title="Fee Tracking"
              desc="Never miss a payment. Send automated fee reminders and generate digital receipts."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* --- REVIEWS SECTION --- */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900">Loved by Tutors & Owners</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{review.name}</h4>
                    <p className="text-xs text-slate-500">{review.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-black text-xl mb-4">EduSmart Pro</h3>
            <p className="text-sm leading-relaxed max-w-xs">
              The #1 Management Platform for Coaching Institutes, Tuition Centers, and Schools in India.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/legal/term" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/legal/refund" className="hover:text-white transition">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          © {new Date().getFullYear()} EduSmart Pro. All rights reserved. Made with ❤️ in India.
        </div>
      </footer>
    </div>
  );
}

// Helper Component for Features
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group"
    >
      <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-blue-50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
