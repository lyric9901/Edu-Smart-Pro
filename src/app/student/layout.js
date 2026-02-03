import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

// --- SEO CONFIGURATION ---
export const metadata = {
  metadataBase: new URL('https://github.com/lyric9901'),
  title: {
    default: "EduSmart | Lucknow's #1 Coaching Management App",
    template: "%s | EduSmart" 
  },
  description: "Manage attendance, fees, and students with ease. The smartest app for Indian coaching centers. Paisa Vasool Guaranteed.",
  keywords: ["Coaching App", "Attendance Tracker", "Fee Manager", "Tuition App India", "EduSmart"],
  authors: [{ name: "Shah Nawaz Ali" }],
  creator: "Shah Nawaz",
  
  openGraph: {
    title: "EduSmart - Digital Coaching Management",
    description: "Ab Coaching Chalegi Digital. Manage fees & attendance in seconds.",
    url: 'https://edusmart.in',
    siteName: 'EduSmart',
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: "EduSmart | Smart Coaching App",
    description: "Automate your coaching center today.",
    images: ['/og-image.png'], 
  },

  icons: {
    icon: '/logo.png',
    apple: '/logo.png', 
  },
};

export const viewport = {
  themeColor: '#000000', // Changed to black for dark mode mobile bars
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    // Added className="dark" here for instant dark mode
    <html lang="en" className="dark">
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
