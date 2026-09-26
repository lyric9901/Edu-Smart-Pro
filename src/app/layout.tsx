import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import JsonLd from "@/context/JsonLd"; // JSON is so small it doesn't need lazy loading
import type { Metadata, Viewport } from "next";
import "./globals.css";


// 🚀 Performance tweak: display swap is mandatory for text performance
const inter = Inter({ subsets: ["latin"], display: "swap" });

// 🚀 VERCEL FIX: Removed `ssr: false`. Next.js will still code-split these for performance!
const Toaster = dynamic(() => import("react-hot-toast").then((mod) => mod.Toaster));
const PWAManager = dynamic(() => import("@/components/PWAManager"));

// --- SEO + META (Comprehensive configuration for maximum ranking, AI discovery & Google visibility) ---
export const metadata: Metadata = {
  manifest: "/manifest.json", 
  metadataBase: new URL("https://edusmartpro.in"),

  title: {
    default: "EduSmart Pro - Digital Coaching & Tuition Management Platform for Student Enrollment, Batch Attendance, Fee Tracking, and Parent Updates.",
    template: "%s | EduSmart Pro ERP",
  },

  description:
    "EduSmart Pro - Digital Coaching & Tuition Management Platform for Student Enrollment, Batch Attendance, Fee Tracking, and Parent Updates. 7 days free trial, no hidden charges, cancel subscription anytime, easy CSV/Excel data import & export.",

  keywords: [
    "coaching management system",
    "tuition attendance tracker",
    "student fee logs",
    "batch timetable management",
    "School Management ERP Software",
    "Coaching Institute Management App",
    "Coaching Management Software India",
    "School ERP Software India",
    "Tuition Management App",
    "Student Attendance Tracker App",
    "Coaching Fee Management System with Receipts",
    "Institute Management ERP",
    "EduSmart Pro",
    "Edu Smart Pro",
    "Tuition Classes Management Software",
    "Coaching ERP India",
    "Best School ERP App India",
    "Dedicated Indian Institute ERP Software",
    "Coaching Software Free Trial 7 Days",
    "Easy Data Import Export School Software"
  ],

  authors: [{ name: "Shah Nawaz Ali", url: "https://edusmartpro.in" }],
  creator: "Shah Nawaz Ali",
  publisher: "EduSmart Pro",

  alternates: {
    canonical: "https://edusmartpro.in",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "EduSmart Pro - School & Coaching Management App and ERP Software",
    description: "Modern ERP software for schools & coaching centers. 7 days free trial, zero hidden charges, cancel anytime, easy data import/export, and automated WhatsApp notices. Built for Indian educational institutes.",
    url: "https://edusmartpro.in",
    siteName: "EduSmart Pro ERP",
    images: [
      {
        url: "/icons/icon-512x512.png", 
        width: 512,
        height: 512,
        alt: "EduSmart Pro - School & Coaching Management App and ERP Software",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "EduSmart Pro | #1 School & Coaching ERP Software",
    description: "7-day free trial, no hidden charges, cancel anytime, easy data import/export. Automated WhatsApp fees, attendance, and receipts.",
    images: ["/icons/icon-512x512.png"],
    creator: "@edusmartpro",
  },

  icons: {
    icon: [
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F19" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mitigates Dark Mode FOUC (Flash of Unstyled Content)
  const themeScript = `
    try {
      var preference = localStorage.getItem("eduSmartTheme") || "system";
      var dark = preference === "dark" || (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    } catch (_) {}
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            
            {children}

            {/* These will load without crashing Vercel */}
            <PWAManager />
            <Toaster position="bottom-right" reverseOrder={false} />
            <JsonLd />
            
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}