# 🎓 Edu-Smart-Pro: Next-Generation EdTech Management SaaS

[![Next.js](https://img.shields.io/badge/Built_with-Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Powered_by-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Optimized-5A0FC8?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen?style=for-the-badge)]()

**Edu-Smart-Pro** is a comprehensive, highly scalable SaaS platform designed to streamline operations for coaching institutes and educational organizations. Built with a modern, serverless architecture, it unifies administration, student engagement, and financial tracking into a single, intuitive Progressive Web App (PWA).

---

## 👨‍💻 The Developer Behind the Code

**Hi, I'm Shani.** 
I am a full-stack web developer and SaaS product builder specializing in scalable, high-performance web applications. I built Edu-Smart-Pro from the ground up to solve complex data-management problems in the education sector. 

**Why this project matters to a technical recruiter:**
* **Architectural Complexity:** Demonstrates mastery over role-based access control (RBAC), managing completely distinct workflows for Super Admins, Admins, and Students securely.
* **Modern State Management:** Combines React Context API (`AuthContext`, `ThemeContext`) with a robust global store (`useAppStore`) for optimal re-rendering and data flow.
* **Performance & UX:** Implements Framer Motion for fluid transitions, fully responsive layouts, dark/light mode toggling, and offline-capable PWA standards.
* **Production-Ready Mindset:** Follows strict project structuring, utilizing Next.js App Router, secure Firebase integration, and reusable component paradigms.

📫 **Looking for a dedicated, product-minded developer to join your team?** [Let's connect.](mailto:shahnawaz23120@gmail.com)

---

## 🚀 How It Works: The Architecture

Edu-Smart-Pro operates on a multi-tier dashboard system. Depending on the authenticated user's role, the application dynamically routes them to their specific workspace. 

1. **Authentication & Session:** The user logs in via the secure Firebase Auth flow (`/login` or `/register`). The `AuthContext` verifies the session and fetches the user's role.
2. **Role-Based Routing:** 
   * **Super Admin (`/super-admin`):** Oversees the entire SaaS ecosystem, managing different institutes/clients.
   * **Institute Admin (`/dashboard/admin`):** Manages day-to-day operations for a specific coaching center or school.
   * **Student (`/student`):** Accesses a personalized portal for learning and updates.
3. **Global State & UI:** The `useAppStore` keeps track of active modules, while the `ThemeContext` ensures a consistent UI across light and dark modes.

---

## ✨ Core Features

### 🏢 Administrative Powerhouse (`/dashboard`)
* **Attendance Tracking:** Real-time logging and historical data visualization for student attendance.
* **Fee Management:** Secure tracking of payments, dues, and transaction histories.
* **Homework Assignment:** Digital portal for assigning, receiving, and grading student coursework.
* **Notice Board:** Broadcast announcements instantly to specific batches or the entire institute.
* **Timing & Scheduling:** Dynamic timetable management for classes and faculty.

### 🎒 Student Portal (`/student`)
* **Personalized Dashboard:** A distraction-free environment for students to view their performance, pending dues, and upcoming classes.
* **Instant Updates:** Real-time syncing with the Admin's Notice Board and Homework modules.

### ⚡ Technical Highlights
* **PWA Integration:** Users can install Edu-Smart-Pro directly to their device home screens via the `PWAManager`, offering a native app-like experience.
* **Fluid Animations:** Powered by `framer-motion` for a premium, interactive user experience.
* **Secure Backend:** Firebase powers the real-time database, authentication, and hosting, ensuring enterprise-grade security and low latency.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Backend & Auth:** Google Firebase
* **State Management:** Zustand (`useAppStore`) + React Context
* **Styling:** Tailwind CSS (configured via PostCSS)
* **Animations:** Framer Motion
* **Deployment:** Vercel (Recommended)

---

## 💻 Getting Started

To run this project locally, follow these steps:

### Prerequisites
* Node.js (v18 or higher)
* NPM or Yarn
* A Firebase Project with Authentication and Firestore enabled.

### Installation

1. **Clone the repository:**
```bash
   git clone [https://github.com/lyric9901/edu-smart-pro.git](https://github.com/lyric9901/edu-smart-pro.git)
   cd edu-smart-pro