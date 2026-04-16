"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  ArrowRight, 
  BarChart3, 
  Users, 
  Shield, 
  Zap, 
  Menu, 
  X,
  Star,
  Mail,
  Phone
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isContactOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isContactOpen]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
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
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 z-50 relative">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900">EduSmart<span className="text-blue-600">Pro</span></span>
            </div>

            {/* Desktop Links (Hidden on mobile and smaller tablets) */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Features</a>
              <a href="#reviews" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Reviews</a>
              <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Pricing</Link>
              <button 
                onClick={() => setIsContactOpen(true)} 
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
              >
                Contact Us
              </button>
              
              <div className="flex items-center gap-3 ml-2 border-l pl-6 border-slate-200">
                <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition">
                  Institute Login
                </Link>
                <Link href="/register" className="px-5 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-full hover:bg-black transition shadow-lg shadow-slate-200">
                  Register Free
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition z-50 relative" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 shadow-2xl overflow-hidden absolute w-full top-16 left-0"
            >
              <div className="p-4 flex flex-col space-y-2">
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 font-medium text-slate-700 rounded-xl hover:bg-slate-50">Features</a>
                <a href="#reviews" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 font-medium text-slate-700 rounded-xl hover:bg-slate-50">Reviews</a>
                <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 font-medium text-slate-700 rounded-xl hover:bg-slate-50">Pricing</Link>
                <button 
                  onClick={() => { setIsContactOpen(true); setIsMenuOpen(false); }} 
                  className="text-left px-4 py-3 font-medium text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Contact Us
                </button>
                
                <div className="h-px bg-slate-100 my-2"></div>
                
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-3 font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  Institute Login
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-3 font-bold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition">
                  Register Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6 sm:mb-8">
              <Zap size={14} fill="currentColor" /> New: Automated WhatsApp Notices
            </div>
            {/* Optimized heading for mobile devices */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Manage your Coaching <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Like a Pro.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              Attendance, Fees, Notices, and Student Tracking—all in one beautiful app. 
              Give your institute the digital upgrade it deserves.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                Get Started for Free <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition text-center">
                Existing User Login
              </Link>
            </div>

            <p className="mt-8 text-xs text-slate-400 font-medium uppercase tracking-wider">
              Trusted by 100+ Institutes in India
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">Everything you need to run your class</h2>
            <p className="text-slate-500">Stop using WhatsApp groups and Excel sheets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Loved by Tutors & Owners</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic text-sm sm:text-base">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
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
              <li><button onClick={() => setIsContactOpen(true)} className="hover:text-white transition text-left w-full">Contact Us</button></li>
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

      {/* --- CONTACT US MODAL --- */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContactOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-slate-900">Get in touch</h3>
                  <button 
                    onClick={() => setIsContactOpen(false)}
                    className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsContactOpen(false); }}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none" placeholder="How can we help you?"></textarea>
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex justify-center items-center gap-2">
                    Send Message <ArrowRight size={18} />
                  </button>
                </form>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                    <Mail size={16} className="text-blue-600" /> support@edusmartpro.in
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                    <Phone size={16} className="text-blue-600" /> +91 98765 43210
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group"
    >
      <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-blue-50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm sm:text-base">{desc}</p>
    </motion.div>
  );
}