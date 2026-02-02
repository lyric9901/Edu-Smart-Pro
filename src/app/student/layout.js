// app/student/layout.js
export default function StudentLayout({ children }) {
  return (
    // Removed flex-col items-center justify-center to allow full-screen dashboard
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {children}
    </div>
  );
}