import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import PWAManager from "@/components/PWAManager";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// --- SEO + META ---
export const metadata = {
  manifest: "/manifest.json", 
  metadataBase: new URL("https://edusmartpro.in"),

  title: {
    default: "EduSmart Pro | #1 Coaching Management App",
    template: "%s | EduSmart Pro",
  },

  description:
    "Automate attendance, fees, and student management. The smartest app for coaching centers in India.",

  keywords: [
    "Coaching App",
    "Attendance Tracker",
    "Fee Manager",
    "Tuition App India",
    "EduSmart Pro",
    "Godhra Coaching",
  ],

  authors: [{ name: "Neel" }],
  creator: "Neel",

  openGraph: {
    title: "EduSmart Pro - Digital Coaching Management",
    description: "Manage fees & attendance in seconds. Try it now!",
    url: "https://edusmartpro.in",
    siteName: "EduSmart Pro",
    images: [
      {
        url: "/icons/icon-512x512.png", 
        width: 512,
        height: 512,
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "EduSmart Pro | Smart Coaching App",
    description: "Automate your coaching center today.",
    images: ["/icons/icon-512x512.png"],
  },

  // 🔥 Proper favicon setup (PATHS FIXED)
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
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
            <Toaster position="bottom-right" reverseOrder={false} />
            {/* 🔥 PWA handler */}
            <PWAManager />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}