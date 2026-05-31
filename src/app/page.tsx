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
  Phone,
  MessageSquare
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px" },
    transition: { duration: 0.32, ease: "easeInOut" }
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
      text: "EduSmart Pro transformed how we manage fees. Parents love the instant updates!",
      rating: 5
    },
    {
      name: "Priya Verma",
      role: "Tutor, Excel Academy",
      text: "So clean and easy to use. I manage my entire coaching from my phone now.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Institute Owner",
      text: "Best decision for my business. It looks professional and students find it cool.",
      rating: 4
    },
    {
      name: "Sneha Iyer",
      role: "Math Educator",
      text: "The WhatsApp automation saves me hours every week. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="app-shell min-h-screen font-sans text-slate-900 selection:bg-blue-100 dark:text-slate-100 dark:selection:bg-blue-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="glass-panel fixed top-0 w-full z-40 border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 z-50 relative">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">EduSmart<span className="text-blue-600 dark:text-blue-400">Pro</span></span>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition dark:text-slate-300 dark:hover:text-blue-300">Features</a>
              <a href="#reviews" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition dark:text-slate-300 dark:hover:text-blue-300">Reviews</a>
              <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition dark:text-slate-300 dark:hover:text-blue-300">Pricing</Link>
              <button 
                onClick={() => setIsContactOpen(true)} 
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition dark:text-slate-300 dark:hover:text-blue-300"
              >
                Contact Us
              </button>
              <ThemeToggle compact />
              
              <div className="flex items-center gap-3 ml-2 border-l pl-6 border-slate-200 dark:border-white/10">
                <Link href="/login" className="touch-target inline-flex items-center px-4 text-sm font-bold text-slate-700 hover:text-slate-900 transition dark:text-slate-200 dark:hover:text-white">
                  Institute Login
                </Link>
                <Link href="/register" className="touch-target inline-flex items-center px-5 text-sm font-bold bg-slate-900 text-white rounded-2xl hover:bg-black transition shadow-lg shadow-slate-200 dark:bg-white dark:text-slate-950 dark:shadow-black/30">
                  Register Free
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="touch-target lg:hidden text-slate-600 hover:bg-white/60 rounded-xl transition z-50 relative dark:text-slate-200 dark:hover:bg-white/10" 
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
              className="lg:hidden overflow-hidden absolute w-full top-16 left-0 rounded-b-[1.5rem] border-b border-white/50 bg-white/92 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-slate-950/92"
            >
              <div className="p-4 flex flex-col space-y-2">
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="touch-target px-4 py-3 font-medium text-slate-700 rounded-xl hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10">Features</a>
                <a href="#reviews" onClick={() => setIsMenuOpen(false)} className="touch-target px-4 py-3 font-medium text-slate-700 rounded-xl hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10">Reviews</a>
                <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="touch-target px-4 py-3 font-medium text-slate-700 rounded-xl hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10">Pricing</Link>
                <button 
                  onClick={() => { setIsContactOpen(true); setIsMenuOpen(false); }} 
                  className="touch-target text-left px-4 py-3 font-medium text-slate-700 rounded-xl hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  Contact Us
                </button>
                
                <ThemeToggle className="w-full justify-center" />
                <div className="h-px bg-slate-100 my-2 dark:bg-white/10"></div>
                
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="touch-target flex w-full items-center justify-center rounded-xl border border-slate-200 text-center font-bold text-slate-700 transition hover:bg-white/70 dark:border-white/20 dark:text-slate-100 dark:hover:bg-white/10">
                  Institute Login
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="touch-target flex w-full items-center justify-center rounded-xl bg-blue-600 text-center font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700">
                  Register Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 dark:bg-blue-500/20 dark:opacity-30"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-100 rounded-full blur-3xl opacity-50 dark:bg-fuchsia-500/15 dark:opacity-25"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
            className="gpu-animated"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6 sm:mb-8 dark:bg-white/12 dark:border-white/20 dark:text-blue-100">
              <Zap size={14} fill="currentColor" /> New: Automated WhatsApp Notices
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1] dark:text-white">
              Manage your Coaching <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Like a Pro.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed px-2 dark:text-slate-200">
              Attendance, Fees, Notices, and Student Tracking—all in one beautiful app. 
              Give your institute the digital upgrade it deserves.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                Get Started for Free <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition text-center dark:bg-slate-900 dark:text-white dark:border-slate-800 dark:hover:bg-slate-800">
                Existing User Login
              </Link>
            </div>

            <p className="mt-8 text-xs text-slate-500 font-medium uppercase tracking-wider dark:text-slate-400">
              Trusted by 100+ Institutes in India
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES SECTION (2x2 Grid on Mobile) --- */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4">Everything you need</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Stop using WhatsApp groups and Excel sheets.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            <FeatureCard 
              icon={<Users className="text-blue-600 dark:text-blue-400" size={22} />}
              title="Student Management"
              desc="Track academic journeys in one click."
              delay={0.1}
            />
            <FeatureCard 
              icon={<BarChart3 className="text-purple-600 dark:text-purple-400" size={22} />}
              title="Smart Attendance"
              desc="Instant alerts for absent students."
              delay={0.2}
            />
            <FeatureCard 
              icon={<CheckCircle2 className="text-green-600 dark:text-green-400" size={22} />}
              title="Fee Tracking"
              desc="Automated reminders & receipts."
              delay={0.3}
            />
            <FeatureCard 
              icon={<MessageSquare className="text-orange-600 dark:text-orange-400" size={22} />}
              title="Notice Board"
              desc="Broadcast updates to everyone instantly."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* --- REVIEWS SECTION (2x2 Grid on Mobile) --- */}
      <section id="reviews" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Loved by Owners</h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {reviews.map((review, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.26, delay: Math.min(index * 0.05, 0.1), ease: "easeInOut" }}
                viewport={{ once: true, margin: "0px" }}
                className="gpu-animated glass-card p-4 sm:p-8 rounded-2xl flex flex-col h-full dark:bg-white/5 dark:border-white/10"
              >
                <div className="flex gap-0.5 mb-2 sm:mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={12} className="fill-yellow-400 text-yellow-400 sm:w-4 sm:h-4" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-4 italic text-[11px] sm:text-base flex-grow">"{review.text}"</p>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-sm shrink-0">
                    {review.name[0]}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-[12px] sm:text-sm text-slate-900 dark:text-white truncate">{review.name}</h4>
                    <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{review.role}</p>
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60"
            />
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Get in touch</h3>
                  <button 
                    onClick={() => setIsContactOpen(false)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsContactOpen(false); }}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 outline-none transition" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 outline-none transition" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                    <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 outline-none transition resize-none" placeholder="How can we help you?"></textarea>
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex justify-center items-center gap-2">
                    Send Message <ArrowRight size={18} />
                  </button>
                </form>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <Mail size={16} className="text-blue-600 dark:text-blue-400" /> shanibrooo@gmail.com
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <Phone size={16} className="text-blue-600 dark:text-blue-400" /> +91 73887-39691
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

// Adjusted Feature Card for smaller 2-column mobile view with Dark Mode
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: Math.min(delay, 0.1), ease: "easeInOut" }}
      viewport={{ once: true, margin: "0px" }}
      className="gpu-animated glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl hover:shadow-xl transition-all group flex flex-col h-full dark:bg-white/5 dark:border-white/10"
    >
      <div className="mb-3 sm:mb-5 p-2 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl w-fit group-hover:bg-blue-50 dark:group-hover:bg-slate-700 transition-colors">
        {icon}
      </div>
      <h3 className="text-[13px] sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-3 leading-tight">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-snug text-[11px] sm:text-base flex-grow">{desc}</p>
    </motion.div>
  );
}