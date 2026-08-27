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

// --- SEO + META (Comprehensive configuration for maximum ranking and visibility) ---
export const metadata: Metadata = {
  manifest: "/manifest.json", 
  metadataBase: new URL("https://edusmartpro.in"),

  title: {
    default: "EduSmart Pro | #1 Coaching Institute Management Software & App",
    template: "%s | EduSmart Pro",
  },

  description:
    "Empower your coaching institute with EduSmart Pro. Automate student attendance, fee tracking, instant WhatsApp notices, digital receipts, and parent communication across India.",

  keywords: [
    "Coaching Institute Management Software",
    "Coaching App India",
    "Tuition Management App",
    "Student Attendance Tracker",
    "Coaching Fee Management System",
    "WhatsApp Attendance Notices",
    "Institute Management ERP",
    "EduSmart Pro",
    "Edu Smart Pro",
    "Tuition Classes App",
    "Coaching ERP India",
    "Godhra Coaching Classes",
    "Lucknow Tuition Software",
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
    title: "EduSmart Pro - Smart Coaching Institute Management Platform",
    description: "Automate attendance, fees, and instant WhatsApp notices in seconds. Loved by 100+ institutes across India.",
    url: "https://edusmartpro.in",
    siteName: "EduSmart Pro",
    images: [
      {
        url: "/icons/icon-512x512.png", 
        width: 512,
        height: 512,
        alt: "EduSmart Pro - Coaching Management Platform Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "EduSmart Pro | #1 Smart Coaching App",
    description: "Automate your coaching center, fee collection & WhatsApp notices.",
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
            
            {/* W wrapped right here 👇 */}
            <main>
              {children}
            </main>

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