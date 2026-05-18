// src/app/student/layout.js

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Student Portal | EduSmart",
  description: "Student Dashboard and Management",
};

export const viewport = {
  themeColor: "#06080f",
};

export default function StudentLayout({ children }) {
  return (
    <div className="app-shell min-h-screen text-slate-900 selection:bg-blue-500/20 dark:text-zinc-100 dark:selection:bg-indigo-500/30">
      {children}
      <SpeedInsights />
      <Analytics />
    </div>
  );
}
