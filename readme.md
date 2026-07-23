# <img src="https://img.icons8.com/3d-fluency/94/graduation-cap.png" width="35" align="center" /> Edu-Smart-Pro: The EdTech SaaS That Actually Cures Headaches (No Cap)

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=5A0FC8&center=true&vCenter=true&random=false&width=435&lines=Ditch+Excel.;Automate+the+boring+stuff.;Scale+your+coaching+empire." alt="Typing SVG" />
</div>

<br/>

[![Next.js](https://img.shields.io/badge/Built_with-Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Powered_by-Bun-fbf0df?style=for-the-badge&logo=bun&logoColor=black)](https://bun.sh/)
[![Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Optimized-5A0FC8?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

Let's be real. The Indian coaching market is massive, yet 90% of institute owners are still running their business on pure vibes, dusty Excel sheets, and chaotic WhatsApp groups. <img src="https://img.icons8.com/3d-fluency/94/bear-market.png" width="20" align="center" />

**Edu-Smart-Pro** is the cure. It’s a highly scalable, serverless B2B2C SaaS built to automate the boring stuff—attendance, fee collection, and student engagement. It’s a Progressive Web App (PWA), meaning users get a native app experience without the friction of app store downloads. Low friction = High adoption. <img src="https://img.icons8.com/3d-fluency/94/combo-chart.png" width="20" align="center" />

---

## <img src="https://img.icons8.com/3d-fluency/94/macbook.png" width="28" align="center" /> The Brains Behind the Operation

**Hi, I'm Shani.** 
I don't just write boilerplate code; I build actual businesses. I engineered Edu-Smart-Pro from scratch to solve real-world data bottlenecks in the education sector. I literally optimized this beast to run flawlessly even while compiling on a 10th Gen i3 IdeaPad with 8GB of RAM—if it runs this fast for me locally, imagine it ripping on production servers. <img src="https://img.icons8.com/3d-fluency/94/rocket.png" width="24" align="center" />

<img src="https://img.icons8.com/3d-fluency/94/brain.png" width="24" align="center" /> **Investor Psychology Check (Why you should care):**
You aren't just looking at a codebase. You're looking at a product built by a dev who understands *distribution, Monthly Recurring Revenue (MRR), and unit economics*. 
* **Enterprise Architecture:** I built a bulletproof Role-Based Access Control (RBAC) system (Super Admin > Admin > Student) because I know how B2B hierarchies actually function.
* **Modern State Management:** I dropped legacy bloat and used Zustand + React Context. Re-renders are minimal, the app is snappy, and the UX keeps churn rates low.
* **Zero-Cost Scaling:** Serverless Firebase architecture means you pay pennies for database reads until you are scaling to the moon. 

---

## <img src="https://img.icons8.com/3d-fluency/94/iphone.png" width="28" align="center" /> LET'S TALK BUSINESS (Hire Me / Build Your App)

Stop ghosting talent and let's make some money together. <img src="https://img.icons8.com/3d-fluency/94/money-bag.png" width="24" align="center" />

<img src="https://img.icons8.com/3d-fluency/94/briefcase.png" width="20" align="center" /> **For VCs, Tech Recruiters & Angel Investors:** 
Need a hungry, product-minded dev on your team? Or want to fund this project before it eats the local coaching market? Let's talk ROI, equity, or a fat paycheck. 

<img src="https://img.icons8.com/3d-fluency/94/hammer.png" width="20" align="center" /> **For Normal Folks (Got an Idea?):** 
You have a killer app idea but no tech skills? Stop relying on drag-and-drop builders. I build scalable, custom MVPs that actually work. Hire me to build your app.

<a href="https://wa.me/917388739691">
  <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp +917388739691" />
</a>
<br/>
*(Don't overthink it, just text me at **+91 7388739691**. I reply faster than a Bun hot reload).*

---

## <img src="https://img.icons8.com/3d-fluency/94/link.png" width="28" align="center" /> How It Works: The Architecture

Edu-Smart-Pro doesn't do spaghetti code. Depending on your auth level, the app dynamically locks you into your specific workspace:

1. **Authentication:** Bulletproof Firebase Auth flow. You log in, `AuthContext` grabs your session, and checks your VIP status.
2. **Role-Based Routing (The Real Magic):** 
   * **Super Admin (`/super-admin`):** The God Mode. Oversees the entire SaaS ecosystem and manages client onboarding.
   * **Institute Admin (`/dashboard/admin`):** The Coaching Owner. Manages day-to-day chaos for their specific center.
   * **Student (`/student`):** The End User. A personalized, distraction-free portal to check their own stats.
3. **Global State & UI:** `useAppStore` keeps the data flowing smoothly, while the `ThemeContext` keeps the UI looking aesthetic AF (Dark mode included, because we aren't psychopaths).

---

## <img src="https://img.icons8.com/3d-fluency/94/lightning-bolt.png" width="28" align="center" /> The Features (Why users will actually pay for this)

### <img src="https://img.icons8.com/3d-fluency/94/company.png" width="24" align="center" /> Admin Dashboard (Securing the Bag)
* **Fee Management:** Automated tracking of payments and dues. Because chasing students for money is an L.
* **Attendance Tracking:** Real-time logging. No more proxy attendance BS.
* **Homework & Notices:** Digital portal for assignments and instant broadcasts to specific batches.
* **Dynamic Scheduling:** Timetable management that actually makes sense.

### <img src="https://img.icons8.com/3d-fluency/94/books.png" width="24" align="center" /> Student Portal (Zero Distractions)
* **Clean UI:** A personalized dashboard to view performance, pending dues, and classes without getting distracted by a messy interface.
* **Real-time Sync:** Instant updates from the Admin's notice board straight to the student's screen.

### <img src="https://img.icons8.com/3d-fluency/94/fire-element.png" width="24" align="center" /> Tech Highlights
* **PWA Ready:** Installable directly to the home screen. Parents won't need to clear storage just to download it.
* **Framer Motion:** Silky smooth animations. It feels premium, which means you can charge premium.
* **Edge-Ready:** Next.js App Router + Firebase = enterprise-grade security and literal zero latency.

---

## <img src="https://img.icons8.com/3d-fluency/94/source-code.png" width="28" align="center" /> The Tech Stack (Only the Good Stuff)

* **Runtime:** Bun (Because Node is for boomers)
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript (Strict mode, obviously)
* **Backend:** Google Firebase
* **State:** Zustand (`useAppStore`)
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion

---

## <img src="https://img.icons8.com/3d-fluency/94/gear.png" width="28" align="center" /> Getting Started (For the Devs)

Want to run it locally? It takes like 60 seconds.

### Prerequisites
* Bun (Seriously, install Bun)
* A Firebase Project (Auth + Firestore enabled)

### Installation

1. **Clone it:**
```bash
git clone [https://github.com/lyric9901/edu-smart-pro.git]
cd edu-smart-pro
