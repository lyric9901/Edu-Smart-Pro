import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

// --- SEO CONFIGURATION ---
export const metadata = {
  metadataBase: new URL('https://github.com/lyric9901'),
  title: {
    default: "EduSmart | Lucknow's #1 Coaching Management App",
    template: "%s | EduSmart" // e.g., "Login | EduSmart"
  },
  description: "Manage attendance, fees, and students with ease. The smartest app for Indian coaching centers. Paisa Vasool Guaranteed.",
  keywords: ["Coaching App", "Attendance Tracker", "Fee Manager", "Tuition App India", "EduSmart"],
  authors: [{ name: "Shah Nawaz Ali" }],
  creator: "Shah Nawaz",
  
  // Open Graph (For WhatsApp, Facebook, LinkedIn previews)
  openGraph: {
    title: "EduSmart - Digital Coaching Management",
    description: "Ab Coaching Chalegi Digital. Manage fees & attendance in seconds.",
    url: 'https://edusmart.in',
    siteName: 'EduSmart',
    images: [
      {
        url: '/og-image.png', // Add an image to your public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },

  // Twitter Card (For Twitter previews)
  twitter: {
    card: 'summary_large_image',
    title: "EduSmart | Smart Coaching App",
    description: "Automate your coaching center today.",
    images: ['/og-image.png'], // Same image
  },

  // Icons (Explicit definition if file-based doesn't update immediately)
  icons: {
    icon: '/logo.png',
    apple: '/logo.png', // Add this to public folder if you have it
  },
};

export const viewport = {
  themeColor: '#2563eb', // Matches your blue-600 theme
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}