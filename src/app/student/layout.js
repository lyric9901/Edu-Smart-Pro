// src/app/student/layout.js

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Student Portal | EduSmart",
  description: "Student Dashboard and Management",
  // This matches your mobile browser bar to the sleek dark background?!
  themeColor: "#05050a", 
};

export default function StudentLayout({ children }) {
  return (
    // We wrap the children in your base dark color so there are NEVER any white flashes while loading?!
    <div className="bg-[#05050a] min-h-screen text-zinc-100 selection:bg-indigo-500/30">
      {children}
      <SpeedInsights />
      <Analytics />
    </div>
  );
}