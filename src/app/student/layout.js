import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Student Portal | EduSmart",
  description: "Student Dashboard and Management",
};

export default function StudentLayout({ children }) {
  return (
    <>
      {children}
      <SpeedInsights />
      <Analytics />
    </>
  );
}