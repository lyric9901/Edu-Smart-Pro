"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
  MessageSquare,
  Clock,
  FileSpreadsheet,
  BookOpen,
  Check,
  HelpCircle,
  HeartHandshake,
  LayoutDashboard,
  CreditCard
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import GradientWaves from "@/components/GradientWaves";

/* ---------------------------------- */
/* Motion presets                     */
/* ---------------------------------- */
const scrollReveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

/* Smooth, organic floating for the hero dashboard mockup */
const floatingAnimation = {
  animate: { y: [0, -14, 0] },
  transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const }
};

/* Horizontal carousel helpers */
const CAROUSEL_GAP = 20; // matches gap-5 (1.25rem)

const hideScrollbar =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

/* ---------------------------------- */
/* Static data                        */
/* ---------------------------------- */
const dashboardNav = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Students", icon: Users, active: false },
  { label: "Attendance", icon: CheckCircle2, active: false },
  { label: "Fee Ledger", icon: CreditCard, active: false },
  { label: "Notices", icon: MessageSquare, active: false }
];

const features = [
  {
    icon: Users,
    iconClass:
      "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    title: "Student & Batch Management",
    description:
      "Manage hundreds of students across multiple batches, courses, and classes with student IDs, parent contact info, and academic history."
  },
  {
    icon: BarChart3,
    iconClass:
      "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    title: "1-Click Batch Attendance",
    description:
      "Mark attendance in seconds with quick filters and send WhatsApp updates to parents in a single click."
  },
  {
    icon: CreditCard,
    iconClass:
      "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
    title: "Fee Tracking & Digital Receipts",
    description:
      "Track fee installments, pending dues, and send WhatsApp payment reminders. Instantly generate official digital receipts with one tap."
  },
  {
    icon: Clock,
    iconClass:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    title: "Real-Time Parent Portal & Notice Board",
    description:
      "Parents view attendance records, fee payment history, homework, and institute notices directly on their mobile portal."
  },
  {
    icon: BookOpen,
    iconClass: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
    title: "Digital Assignment Manager",
    description:
      "Post homework tasks, share syllabus notes, and manage class assignments without clunky paper sheets."
  },
  {
    icon: FileSpreadsheet,
    iconClass:
      "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400",
    title: "Easy CSV Import & Export (Zero Lock-in)",
    description:
      "Full data freedom. Import your entire student directory from Excel in seconds and export reports anytime with zero vendor lock-in."
  }
];

const reviews = [
  {
    name: "Streamlined Administration",
    role: "Core Institute Advantage",
    text: "Eliminate manual paperwork with automated attendance tracking, instant digital fee receipts, and structured batch organization in one place.",
    rating: 5
  },
  {
    name: "Zero Lock-In & Easy Migration",
    role: "Full Data Ownership",
    text: "Import your existing student lists from Excel/CSV in minutes and export your complete records anytime with zero vendor lock-in.",
    rating: 5
  },
  {
    name: "Affordable & Transparent",
    role: "Flexible Monthly Plans",
    text: "Built specifically for Indian coaching centers and schools with straightforward monthly pricing, 7-day free trial, and no hidden contracts.",
    rating: 5
  },
  {
    name: "Seamless Parent Communication",
    role: "Student & Parent Portals",
    text: "Keep parents informed with 1-click WhatsApp alerts, digital fee receipts, homework updates, and dedicated mobile access.",
    rating: 5
  }
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeReview, setActiveReview] = useState(0);
  const [activeFaq, setActiveFaq] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isContactOpen || isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isContactOpen, isMenuOpen]);

  /* Subtle auto-advance cue for mobile carousels (features + reviews) */
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;

    const featureTimer = setInterval(() => {
      if (!featuresRef.current) return;
      const el = featuresRef.current;
      const nextIndex = (activeFeature + 1) % features.length;
      const scrollWidth = el.scrollWidth - el.clientWidth;
      if (scrollWidth > 0) {
        const itemWidth = el.children[0]?.clientWidth || 300;
        const targetLeft = nextIndex * (itemWidth + CAROUSEL_GAP);
        el.scrollTo({
          left: targetLeft > scrollWidth ? 0 : targetLeft,
          behavior: "smooth"
        });
        setActiveFeature(nextIndex);
      }
    }, 4500);

    const reviewTimer = setInterval(() => {
      if (!reviewsRef.current) return;
      const el = reviewsRef.current;
      const nextIndex = (activeReview + 1) % reviews.length;
      const scrollWidth = el.scrollWidth - el.clientWidth;
      if (scrollWidth > 0) {
        const itemWidth = el.children[0]?.clientWidth || 300;
        const targetLeft = nextIndex * (itemWidth + CAROUSEL_GAP);
        el.scrollTo({
          left: targetLeft > scrollWidth ? 0 : targetLeft,
          behavior: "smooth"
        });
        setActiveReview(nextIndex);
      }
    }, 5000);

    return () => {
      clearInterval(featureTimer);
      clearInterval(reviewTimer);
    };
  }, [activeFeature, activeReview]);

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    setIndex: (i: number) => void
  ) => {
    if (!ref.current) return;
    const el = ref.current;
    const itemWidth = el.children[0]?.clientWidth || 300;
    const index = Math.round(el.scrollLeft / (itemWidth + CAROUSEL_GAP));
    setIndex(Math.max(0, Math.min(index, el.children.length - 1)));
  };

  const scrollToIndex = (
    ref: React.RefObject<HTMLDivElement | null>,
    index: number,
    setIndex: (i: number) => void
  ) => {
    if (!ref.current) return;
    const el = ref.current;
    const itemWidth = el.children[0]?.clientWidth || 300;
    el.scrollTo({
      left: index * (itemWidth + CAROUSEL_GAP),
      behavior: "smooth"
    });
    setIndex(index);
  };

  const erpComparison = [
    {
      feature: "Pricing & Contracts",
      legacy: "₹30,000 – ₹80,000 upfront with locked yearly contracts",
      edusmart: "Starting at ₹299/mo, cancel subscription anytime"
    },
    {
      feature: "Free Trial",
      legacy: "No trial, only scripted sales demos",
      edusmart:
        "Full 7 Days Free Trial, zero hidden charges, no card required"
    },
    {
      feature: "Data Ownership & Portability",
      legacy: "Vendor lock-in; hard or costly to export database",
      edusmart: "100% data ownership; 1-click CSV/Excel import & export"
    },
    {
      feature: "Batch Attendance & Notices",
      legacy: "Requires costly third-party SMS/WhatsApp gateway APIs",
      edusmart: "Built-in 1-click batch attendance & digital parent updates"
    },
    {
      feature: "App Experience",
      legacy: "Heavy, sluggish desktop software from the 2010s",
      edusmart:
        "Ultra-fast modern Web & Mobile PWA for Admin, Students & Parents"
    }
  ];

  const faqs = [
    {
      q: "What makes EduSmart Pro better than other School & Coaching ERP software?",
      a: "EduSmart Pro delivers an enterprise-grade ERP without the enterprise price tag or vendor lock-in. You get full student management, 1-click batch attendance, digital fee receipts, homework, notices, and timetable management. Plus, our flexible monthly plans start at just ₹299/month with zero setup fees."
    },
    {
      q: "How does the 7-day free trial work? Are there any hidden charges?",
      a: "Our 7-day trial gives you 100% access to all core features with zero hidden charges. No credit card is required to register. You can test it with your actual batches and cancel anytime without paying a single rupee."
    },
    {
      q: "Can I easily import my existing students from Excel or CSV?",
      a: "Yes! You can import your entire student list from Excel/CSV in seconds. We also offer free one-on-one migration assistance over WhatsApp (+91 7388739691) to help you switch smoothly from your old software."
    },
    {
      q: "How is EduSmart Pro designed specifically for Indian institutes?",
      a: "EduSmart Pro is built specifically for Indian coaching centers, tuition classes, and schools. It provides localized workflows like 1-click WhatsApp attendance, instant fee receipts, and simple CSV/Excel import to give institutes world-class digital tools without high enterprise costs."
    },
    {
      q: "How do I get customer support if I have a question?",
      a: "We offer dedicated phone and WhatsApp support directly from our core team at +91 7388739691 and email support at shanibrooo@gmail.com."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200 dark:bg-[#0B0F19] dark:text-slate-100 dark:selection:bg-blue-500/30 overflow-x-hidden">
      {/* Smooth anchor scrolling */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            "html{scroll-behavior:smooth}@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}"
        }}
      />

      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz48L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent_85%)]"></div>
      </div>

      {/* --- TOP BANNER --- */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs py-2 px-4 text-center font-bold relative z-50">
        <span>🇮🇳 Built for Indian Institutes — Modern Coaching & School ERP</span>
        <span className="mx-2 hidden sm:inline">•</span>
        <span className="hidden sm:inline">
          7 Days Free Trial • No Hidden Charges • Cancel Subscription Anytime •
          Easy CSV/Excel Data Import & Export
        </span>
      </div>

      {/* --- HEADER & NAVBAR --- */}
      <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 dark:bg-[#0B0F19]/80 dark:border-slate-800/80 transition-colors">
        <nav
          className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8"
          aria-label="Main Navigation"
        >
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 z-50 relative">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                <Shield className="text-white w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                EduSmart
                <span className="text-blue-600 dark:text-blue-400">Pro</span>
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full ml-1">
                ERP Software
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-7">
              <a
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white"
              >
                Features
              </a>
              <a
                href="#comparison"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white"
              >
                Why EduSmart
              </a>
              <a
                href="#reviews"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white"
              >
                Institute Highlights
              </a>
              <a
                href="#faq"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white"
              >
                FAQ
              </a>
              <Link
                href="/pricing"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white"
              >
                Pricing
              </Link>
              <button
                onClick={() => setIsContactOpen(true)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white"
              >
                Contact
              </button>
              <ThemeToggle compact />
              <div className="flex items-center gap-3 ml-2 border-l pl-5 border-slate-200 dark:border-slate-800">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white"
                >
                  Institute Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Start 7-Day Free Trial
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="lg:hidden p-2 -mr-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors z-50 relative dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "100vh", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden absolute w-full top-16 left-0 bg-white border-b border-slate-200 shadow-2xl dark:bg-[#0B0F19] dark:border-slate-800 flex flex-col"
            >
              <div className="p-5 flex flex-col gap-2">
                <a
                  href="#features"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"
                >
                  Features
                </a>
                <a
                  href="#comparison"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"
                >
                  Why EduSmart
                </a>
                <a
                  href="#reviews"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"
                >
                  Institute Highlights
                </a>
                <a
                  href="#faq"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"
                >
                  FAQ
                </a>
                <Link
                  href="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"
                >
                  Pricing
                </Link>
                <button
                  onClick={() => {
                    setIsContactOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 text-left"
                >
                  Contact Support (+91 7388739691)
                </button>
                <div className="px-4 mt-2 mb-4">
                  <ThemeToggle className="w-full justify-start" />
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-3.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 text-center dark:border-slate-700 dark:text-white"
                  >
                    Institute Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-3.5 rounded-xl bg-blue-600 font-bold text-white text-center shadow-lg shadow-blue-500/25"
                  >
                    Start 7-Day Free Trial
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 pt-16 lg:pt-24">
        {/* --- HERO SECTION --- */}
        <section
          className="relative px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16"
          aria-labelledby="hero-heading"
        >
          {/* Animated Gradient Waves Background */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen max-w-none h-[750px] -z-10 overflow-hidden pointer-events-auto opacity-90 dark:opacity-80">
            <GradientWaves
              horizonColor="#5227FF"
              waveColor="#FF9FFC"
              crestColor="#FFFFFF"
              speed={0.3}
              amplitude={2.0}
              waveScale={0.6}
              waveRatio={0.9}
              swell={25}
              turbulence={15}
              tilt={1.11}
              zoom={1.0}
              height={5.5}
              fogDepth={15}
              detail="low"
              brightness={1.0}
              opacity={0.9}
              mouseInteraction={true}
              parallaxStrength={0.4}
              grain={false}
              grainIntensity={0.0}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent 60% to-slate-50 dark:to-[#0B0F19] pointer-events-none" />
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
            <motion.div
              className="flex-1 text-left w-full pt-2 lg:pt-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold mb-5 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300 shadow-sm">
                <Zap size={14} className="fill-current" aria-hidden="true" />
                School & Coaching Management App and ERP Software
              </div>

              <h1
                id="hero-heading"
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4 dark:text-white leading-[1.15]"
              >
                Smart Institute ERP. <br />
                <span className="text-blue-600 dark:text-blue-400">
                  Built for Indian Institutes.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mb-6 max-w-xl leading-relaxed dark:text-slate-300">
                Replace bulky legacy software with India&apos;s fastest School &
                Coaching Management ERP. 1-Click batch attendance, fee tracking
                with digital receipts, homework & timetable management.
              </p>

              {/* CORE TRUST HIGHLIGHTS */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 mb-7 max-w-lg text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                  <Check size={16} className="text-green-600 shrink-0" />
                  <span>7 Days Free Trial</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                  <Check size={16} className="text-green-600 shrink-0" />
                  <span>No Hidden Charges</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                  <Check size={16} className="text-green-600 shrink-0" />
                  <span>Cancel Anytime</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                  <FileSpreadsheet
                    size={16}
                    className="text-blue-600 shrink-0"
                  />
                  <span>Easy Excel Import/Export</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-7 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Start 7-Day Free Trial{" "}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-7 py-4 bg-white text-slate-800 font-bold border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-center dark:bg-[#111827] dark:text-slate-200 dark:border-slate-700"
                >
                  Institute Login
                </Link>
              </div>

              <div className="mt-7 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0B0F19] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-sm"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                  Built for Coaching Centers & Schools across India •
                  Dedicated Institute ERP
                </p>
              </div>
            </motion.div>

            {/* HERO MOCKUP — smooth floating skeleton dashboard */}
            <motion.div
              className="hidden lg:block flex-1 w-full relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div {...floatingAnimation} className="relative z-10">
                <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden dark:bg-[#111827] dark:border-slate-800">
                  {/* Browser chrome */}
                  <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2 dark:bg-[#1A2235] dark:border-slate-800">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      EduSmart Pro ERP - Live Dashboard
                    </span>
                  </div>

                  <div className="flex h-[380px]">
                    {/* Sidebar */}
                    <div className="w-56 border-r border-slate-100 bg-slate-50/50 p-4 space-y-2 dark:border-slate-800 dark:bg-[#111827]">
                      {dashboardNav.map((item, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-bold ${
                            item.active
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <item.icon size={16} />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Skeleton body — no numbers, pure shimmer placeholders */}
                    <div className="flex-1 p-6 bg-white dark:bg-[#0B0F19]">
                      {/* Stat card skeletons */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                          "bg-blue-50/40 dark:bg-blue-900/10",
                          "bg-green-50/40 dark:bg-green-900/10",
                          "bg-purple-50/40 dark:bg-purple-900/10"
                        ].map((tint, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border border-slate-100 dark:border-slate-800 ${tint}`}
                          >
                            <div
                              className="h-2 w-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                            <div
                              className="mt-3 h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"
                              style={{ animationDelay: `${i * 0.15 + 0.1}s` }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Table skeletons */}
                      <div className="border border-slate-100 rounded-xl p-4 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                          <div className="h-3 w-40 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                          <div
                            className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="py-2.5 border-b border-slate-50 last:border-0 flex justify-between gap-4 dark:border-slate-800/40"
                          >
                            <div
                              className="h-3 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
                              style={{ animationDelay: `${i * 0.12}s` }}
                            />
                            <div
                              className="h-3 w-20 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
                              style={{ animationDelay: `${i * 0.12 + 0.08}s` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Smooth pulsing glow */}
              <motion.div
                animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.06, 1] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/20 rounded-full blur-[80px] -z-10"
              />
            </motion.div>
          </div>
        </section>

        {/* --- ALL ERP FEATURES SECTION --- */}
        <section
          id="features"
          className="scroll-mt-24 py-16 lg:py-24 bg-white border-y border-slate-200 dark:bg-[#111827] dark:border-slate-800"
          aria-labelledby="features-heading"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div
              {...scrollReveal}
              className="text-left md:text-center mb-10 md:mb-14 max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                All Features Included
              </div>
              <h2
                id="features-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3"
              >
                Everything Your School & Coaching Needs
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
                A single unified ERP application. Zero clunky Excel spreadsheets
                or manual paper registers.
              </p>
            </motion.div>

            <motion.div
              ref={featuresRef}
              onScroll={() => handleScroll(featuresRef, setActiveFeature)}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-20px" }}
              className={`flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 -mx-5 px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible ${hideScrollbar}`}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="w-[78%] sm:w-[46%] lg:w-auto shrink-0 snap-center bg-slate-50 dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.iconClass}`}
                  >
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Feature carousel dots (mobile / tablet) */}
            <div className="flex justify-center gap-2 mt-1 lg:hidden">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    scrollToIndex(featuresRef, i, setActiveFeature)
                  }
                  aria-label={`Go to feature ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeFeature === i
                      ? "w-6 bg-blue-600"
                      : "w-1.5 bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* --- COMPARISON: WHY EDUSMART BEATS OTHER ERPS --- */}
        <section
          id="comparison"
          className="scroll-mt-24 py-16 lg:py-24"
          aria-labelledby="comparison-heading"
        >
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                Transparent Comparison
              </div>
              <h2
                id="comparison-heading"
                className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white"
              >
                Why Educators Choose EduSmart Pro Over Legacy ERPs
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto">
                Compare what traditional ERP vendors charge versus what you get
                with EduSmart Pro.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="hidden md:grid grid-cols-3 bg-slate-100 dark:bg-[#1A2235] p-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <div>Comparison Aspect</div>
                <div className="text-red-500">Traditional Legacy ERPs</div>
                <div className="text-blue-600 dark:text-blue-400">
                  EduSmart Pro ERP
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {erpComparison.map((item, idx) => (
                  <div key={idx} className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.feature}
                      </div>

                      <div className="flex items-start gap-2">
                        <X
                          size={16}
                          className="text-red-500 shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="md:hidden block text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">
                            Legacy ERP
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {item.legacy}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Check
                          size={16}
                          className="text-green-600 shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="md:hidden block text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                            EduSmart Pro
                          </span>
                          <span className="text-slate-900 dark:text-slate-200 font-medium">
                            {item.edusmart}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- REVIEWS / TESTIMONIALS SECTION --- */}
        <section
          id="reviews"
          className="scroll-mt-24 py-16 lg:py-24 bg-white border-y border-slate-200 dark:bg-[#111827] dark:border-slate-800"
          aria-labelledby="reviews-heading"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div
              {...scrollReveal}
              className="text-left md:text-center mb-10 md:mb-14"
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                Built For Institutes
              </div>
              <h2
                id="reviews-heading"
                className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white"
              >
                Engineered for Indian Coaching Centers & Schools
              </h2>
            </motion.div>

            <div
              ref={reviewsRef}
              onScroll={() => handleScroll(reviewsRef, setActiveReview)}
              className={`flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 -mx-5 px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible ${hideScrollbar}`}
            >
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="w-[80%] sm:w-[46%] lg:w-auto shrink-0 snap-center bg-slate-50 dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {review.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {review.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Review carousel dots (mobile / tablet) */}
            <div className="flex justify-center gap-2 mt-1 lg:hidden">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(reviewsRef, i, setActiveReview)}
                  aria-label={`Go to review ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeReview === i
                      ? "w-6 bg-blue-600"
                      : "w-1.5 bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION (swipeable on mobile) --- */}
        <section
          id="faq"
          className="scroll-mt-24 py-16 lg:py-24"
          aria-labelledby="faq-heading"
        >
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                Got Questions?
              </div>
              <h2
                id="faq-heading"
                className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white"
              >
                Frequently Asked Questions
              </h2>
            </div>

            <div
              ref={faqRef}
              onScroll={() => handleScroll(faqRef, setActiveFaq)}
              className={`flex items-start gap-5 overflow-x-auto snap-x snap-mandatory pb-6 -mx-5 px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:pb-0 lg:block lg:space-y-4 lg:overflow-visible ${hideScrollbar}`}
            >
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="w-[85%] sm:w-[70%] lg:w-auto shrink-0 snap-center bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-start gap-3">
                    <HelpCircle
                      size={20}
                      className="text-blue-600 shrink-0 mt-0.5"
                    />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            {/* FAQ carousel dots (mobile / tablet) */}
            <div className="flex justify-center gap-2 mt-1 lg:hidden">
              {faqs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(faqRef, i, setActiveFaq)}
                  aria-label={`Go to FAQ ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeFaq === i
                      ? "w-6 bg-blue-600"
                      : "w-1.5 bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* --- INSTITUTE EMPOWERMENT CTA BANNER --- */}
        <section className="py-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
          <div className="max-w-5xl mx-auto px-5 text-center">
            <HeartHandshake size={36} className="mx-auto mb-3 text-blue-200" />
            <h2 className="text-2xl sm:text-4xl font-black mb-3">
              Digitally Empower Your Institute with EduSmart Pro
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto mb-6 leading-relaxed">
              Designed for ambitious Indian educators upgrading their institute
              management. 7 days full free trial, no hidden charges, cancel
              subscription anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition"
              >
                Start Your 7-Day Free Trial
              </Link>
              <a
                href="https://wa.me/917388739691?text=Hello%20Shah,%20I%20want%20support%20for%20EduSmart%20Pro%20ERP"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-800/80 text-white font-bold rounded-xl border border-blue-400/40 hover:bg-blue-800 transition flex items-center justify-center gap-2"
              >
                <Phone size={16} /> WhatsApp: +91 73887-39691
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer
        className="bg-white border-t border-slate-200 pt-16 pb-8 dark:bg-[#0B0F19] dark:border-slate-800"
        aria-label="Site Footer"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-slate-900 p-1.5 rounded-lg dark:bg-white">
                <Shield
                  className="text-white w-5 h-5 dark:text-slate-900"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-slate-900 font-bold text-xl dark:text-white">
                EduSmart Pro
              </h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm dark:text-slate-400 mb-4">
              India&apos;s #1 School & Coaching Management App and ERP Software.
              7 days free trial, zero hidden charges, cancel subscription
              anytime, and easy CSV/Excel data import & export.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div>
                📞 Phone/WhatsApp:{" "}
                <a
                  href="tel:+917388739691"
                  className="text-blue-600 font-bold hover:underline"
                >
                  +91 73887-39691
                </a>
              </div>
              <div>
                ✉️ Official Email:{" "}
                <a
                  href="mailto:shanibrooo@gmail.com"
                  className="text-blue-600 font-bold hover:underline"
                >
                  shanibrooo@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 font-bold mb-2 text-sm dark:text-white uppercase tracking-wider">
              Product & Plans
            </h4>
            <ul className="flex flex-col text-sm text-slate-500 dark:text-slate-400 font-medium space-y-1">
              <li>
                <Link
                  href="/login"
                  className="hover:text-slate-900 dark:hover:text-white transition"
                >
                  Institute Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-slate-900 dark:hover:text-white transition"
                >
                  Register (7-Day Trial)
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-slate-900 dark:hover:text-white transition"
                >
                  Pricing (From ₹299/mo)
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="text-left hover:text-slate-900 dark:hover:text-white transition"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 font-bold mb-2 text-sm dark:text-white uppercase tracking-wider">
              Legal & Trust
            </h4>
            <ul className="flex flex-col text-sm text-slate-500 dark:text-slate-400 font-medium space-y-1">
              <li>
                <Link
                  href="/legal/privacy"
                  className="hover:text-slate-900 dark:hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/term"
                  className="hover:text-slate-900 dark:hover:text-white transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/refund"
                  className="hover:text-slate-900 dark:hover:text-white transition"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/super-admin"
                  className="text-xs text-gray-500 hover:text-gray-700 transition"
                >
                  Platform Master Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-500">
          <div>
            © {new Date().getFullYear()} EduSmart Pro ERP. All rights reserved.
          </div>
          <div>
            🇮🇳 Dedicated to Indian Institutes & Educators
          </div>
        </div>
      </footer>

      {/* --- CONTACT US MODAL --- */}
      <AnimatePresence>
        {isContactOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsContactOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/70"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 mt-20"
            >
              <div className="p-6 sm:p-8 flex flex-col max-h-[85vh] overflow-y-auto no-scrollbar">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>

                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div>
                    <h3
                      id="modal-title"
                      className="text-2xl font-black text-slate-900 dark:text-white"
                    >
                      Contact Founder & Support
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      We respond within minutes on WhatsApp and phone
                    </p>
                  </div>
                  <button
                    onClick={() => setIsContactOpen(false)}
                    aria-label="Close contact modal"
                    className="p-2 -mr-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <X size={24} aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <a
                    href="https://wa.me/917388739691?text=Hello%20Shah,%20I%20need%20assistance%20with%20EduSmart%20Pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-between group hover:bg-green-100 dark:hover:bg-green-900/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center">
                        <Phone size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          Call / WhatsApp Support
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 font-mono font-semibold">
                          +91 73887-39691
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-green-600 group-hover:translate-x-1 transition-transform"
                    />
                  </a>

                  <a
                    href="mailto:shanibrooo@gmail.com"
                    className="w-full p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between group hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <Mail size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          Email Us
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 font-mono font-semibold">
                          shanibrooo@gmail.com
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-blue-600 group-hover:translate-x-1 transition-transform"
                    />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Switching from an existing ERP or Excel sheet?
                  </p>
                  <p className="mt-1">
                    Call us directly at <strong>+91 73887-39691</strong> for free
                    1-on-1 migration assistance.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}