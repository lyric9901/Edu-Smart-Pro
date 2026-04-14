"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { Download, Smartphone } from 'lucide-react';

export default function PWAManager() {
  const router = useRouter();
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // -------------------------------------------------------------
    // 1. STANDALONE BLOCKER (Block Landing Page in PWA)
    // If they open the installed app and land on '/', push to '/login'
    // -------------------------------------------------------------
    if (window.matchMedia('(display-mode: standalone)').matches) {
      if (pathname === '/') {
         router.replace('/login');
      }
    }

    // -------------------------------------------------------------
    // 2. INTERCEPT INSTALL PROMPT (Using React Hot Toast)
    // -------------------------------------------------------------
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasDismissed = sessionStorage.getItem('installPromptDismissed');
      if (!hasDismissed) {
        
        // Fire the React Hot Toast popup
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-zinc-900 shadow-2xl rounded-[1.5rem] pointer-events-auto flex p-4 border border-slate-200 dark:border-zinc-800 items-center gap-4`}>
            
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
              <Smartphone size={24} />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Install EduSmart Pro</h3>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">Add to home screen for faster access & offline mode.</p>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  if (e) {
                      e.prompt();
                      const { outcome } = await e.userChoice;
                      if (outcome === 'accepted') setDeferredPrompt(null);
                  }
                }}
                className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-1"
              >
                <Download size={14}/> Install
              </button>
              <button 
                onClick={() => {
                  toast.dismiss(t.id);
                  sessionStorage.setItem('installPromptDismissed', 'true');
                }} 
                className="bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-lg px-3 py-1.5 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
              >
                Not Now
              </button>
            </div>
          </div>
        ), { duration: Infinity, id: 'pwa-install' }); // Infinity keeps it open until they click something
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      toast.dismiss('pwa-install');
      console.log('PWA installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [pathname, router]);

  return null; // This component handles logic & toasts, it renders no standard HTML
}