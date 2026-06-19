import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import type { Metadata, Viewport } from "next";
import "./globals.css";

// 🚀 display: "swap" is mandatory for text performance
const inter = Inter({ subsets: ["latin"], display: "swap" });

// 🚀 THE CHEAT CODE: Lazy load non-critical client components
// This stops them from blocking the mobile main thread!
const Toaster = dynamic(() => import("react-hot-toast").then((mod) => mod.Toaster), { ssr: false });
const PWAManager = dynamic(() => import("@/components/PWAManager"), { ssr: false });
const JsonLd = dynamic(() => import("@/context/JsonLd"), { ssr: false });

// --- SEO + META ---
export const metadata: Metadata = {
  manifest: "/manifest.json", 
  metadataBase: new URL("https://edusmartpro.in"),
  title: {
    default: "EduSmart Pro | #1 Coaching Management App",
    template: "%s | EduSmart Pro",
  },
  description: "Automate attendance, fees, and student management. The smartest app for coaching centers in India.",
  keywords: ["Coaching App", "Attendance Tracker", "Fee Manager", "EduSmart Pro"],
  authors: [{ name: "Shah Nawaz Ali" }],
  creator: "Shah Nawaz Ali",
  openGraph: {
    title: "EduSmart Pro - Digital Coaching Management",
    description: "Manage fees & attendance in seconds. Try it now!",
    url: "https://edusmartpro.in",
    siteName: "EduSmart Pro",
    images: [{ url: "/icons/icon-384x384.png", width: 384, height: 384 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduSmart Pro | Smart Coaching App",
    description: "Automate your coaching center today.",
    images: ["/icons/icon-384x384.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            <main>{children}</main>
            
            {/* These will now load in the background without nuking your score */}
            <PWAManager />
            <Toaster position="bottom-right" reverseOrder={false} />
            <JsonLd />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}