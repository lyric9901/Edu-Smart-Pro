import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// --- SEO CONFIGURATION ---
export const metadata = {
  metadataBase: new URL('https://edusmartpro.in'), // Your actual domain
  title: {
    default: "EduSmart Pro | #1 Coaching Management App",
    template: "%s | EduSmart Pro" 
  },
  description: "Automate attendance, fees, and student management. The smartest app for coaching centers in India.",
  keywords: ["Coaching App", "Attendance Tracker", "Fee Manager", "Tuition App India", "EduSmart Pro", "Lucknow Coaching"],
  authors: [{ name: "Shah Nawaz Ali" }],
  creator: "Shah Nawaz",
  
  // Open Graph (WhatsApp/Facebook previews)
  openGraph: {
    title: "EduSmart Pro - Digital Coaching Management",
    description: "Manage fees & attendance in seconds. Try it now!",
    url: 'https://edusmartpro.in',
    siteName: 'EduSmart Pro',
    images: [
      {
        url: '/favicon.ico', // Using the file you requested
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: "EduSmart Pro | Smart Coaching App",
    description: "Automate your coaching center today.",
    images: ['/favicon.ico'], 
  },

  // Icons - The specific request for favicon.ico
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport = {
  themeColor: '#000000', 
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
