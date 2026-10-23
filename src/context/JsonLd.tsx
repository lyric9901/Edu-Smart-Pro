export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://edusmartpro.in/#software",
        "name": "EduSmart Pro - School & Coaching Management App and ERP Software",
        "alternateName": ["EduSmart Pro", "Edu Smart Pro", "EduSmart ERP"],
        "url": "https://edusmartpro.in",
        "operatingSystem": "Web, Android (PWA), iOS, Windows, macOS",
        "applicationCategory": "BusinessApplication, EducationalApplication, ERPSoftware",
        "description": "EduSmart Pro is a digital school and coaching management platform built for student enrollment, real-time batch attendance, automated fee tracking, and parent updates. Features a 7-day full access trial, zero hidden charges, cancel anytime subscription, and instant CSV/Excel data import & export.",
        "image": "https://edusmartpro.in/icons/icon-512x512.png",
        "screenshot": "https://edusmartpro.in/icons/icon-512x512.png",
        "softwareVersion": "2.4.0",
        "inLanguage": ["en-IN", "hi-IN"],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "128",
          "bestRating": "5",
          "worstRating": "1"
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "7-Day Free Trial",
            "price": "0",
            "priceCurrency": "INR",
            "description": "Full access 7-day trial, no credit card required, zero hidden charges, cancel anytime.",
            "availability": "https://schema.org/InStock",
            "url": "https://edusmartpro.in/register"
          },
          {
            "@type": "Offer",
            "name": "Basic Plan",
            "price": "299",
            "priceCurrency": "INR",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "299",
              "priceCurrency": "INR",
              "unitText": "MONTH"
            },
            "description": "For up to 40 students. Includes 7-day free trial, student management, smart attendance, fee tracking & receipts, notice board, and student/parent login app.",
            "availability": "https://schema.org/InStock",
            "url": "https://edusmartpro.in/pricing"
          },
          {
            "@type": "Offer",
            "name": "Growth Plan",
            "price": "499",
            "priceCurrency": "INR",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "499",
              "priceCurrency": "INR",
              "unitText": "MONTH"
            },
            "description": "For up to 150 students. Includes all Basic features plus automated WhatsApp notices, fee reminders, homework, and timetable management.",
            "availability": "https://schema.org/InStock",
            "url": "https://edusmartpro.in/pricing"
          },
          {
            "@type": "Offer",
            "name": "Premium Plan",
            "price": "2499",
            "priceCurrency": "INR",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "2499",
              "priceCurrency": "INR",
              "unitText": "MONTH"
            },
            "description": "For up to 400 students. Includes custom institute branding, personal app adaptations, and priority 24/7 dedicated support.",
            "availability": "https://schema.org/InStock",
            "url": "https://edusmartpro.in/pricing"
          }
        ],
        "featureList": [
          "Real-time attendance synchronization without page refresh",
          "7 Days Free Trial on Basic Plan",
          "No Hidden Charges & Cancel Subscription Anytime",
          "Easy Data Import and Export (CSV & Excel, Zero Vendor Lock-in)",
          "School and Coaching ERP Core System",
          "Student Management & Batch Organization",
          "Smart Attendance System with Absentee Alerts",
          "Automated WhatsApp Attendance Notices to Parents",
          "Fee Tracking, Pending Dues & Automated WhatsApp Reminders",
          "Instant Digital Fee Receipts with PDF/Print Support",
          "Digital Notice Board & Instant Institute Broadcasts",
          "Class Timetable & Schedule Management",
          "Daily Homework & Assignment Tracker",
          "Dedicated Student & Parent Portal (Android PWA & Web)",
          "Dark Mode & High-Performance Modern Interface",
          "Dedicated Indian Support via Phone & WhatsApp (+91 7388739691)",
          "Built specifically for Indian Coaching Institutes & Schools"
        ],
        "author": {
          "@id": "https://edusmartpro.in/#founder"
        },
        "creator": {
          "@id": "https://edusmartpro.in/#founder"
        }
      },
      {
        "@type": "Person",
        "@id": "https://edusmartpro.in/#founder",
        "name": "Shah Nawaz Ali",
        "alternateName": "Shah",
        "jobTitle": "Founder & CEO",
        "description": "Founder & CEO of EduSmart Pro, building high-performance coaching and school management ERP software in Lucknow, India.",
        "affiliation": {
          "@type": "EducationalOrganization",
          "name": "Lucknow Public School"
        },
        "email": "shanibrooo@gmail.com",
        "telephone": "+91-73887-39691",
        "sameAs": [
          "https://github.com/lyric9901",
          "https://instagram.com/Not_4_shah"
        ],
        "worksFor": {
          "@id": "https://edusmartpro.in/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://edusmartpro.in/#organization",
        "name": "EduSmart Pro",
        "alternateName": "EduSmart Pro ERP",
        "url": "https://edusmartpro.in",
        "logo": "https://edusmartpro.in/icons/icon-512x512.png",
        "description": "EduSmart Pro develops modern School and Coaching Management ERP software tailored for Indian coaching institutes, tuition classes, and schools.",
        "founder": {
          "@id": "https://edusmartpro.in/#founder"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+91-73887-39691",
            "contactType": "customer support",
            "email": "shahnawaz.23120@gmail.com",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
          }
        ],
        "sameAs": [
          "https://edusmartpro.in"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://edusmartpro.in/#breadcrumbs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://edusmartpro.in"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Pricing",
            "item": "https://edusmartpro.in/pricing"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Register",
            "item": "https://edusmartpro.in/register"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "Contact",
            "item": "https://edusmartpro.in/contact"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://edusmartpro.in/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is EduSmart Pro and why is it better than traditional ERP software?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "EduSmart Pro is an all-in-one coaching and school management app and modern ERP software built for Indian educators. Unlike bulky legacy systems charging expensive annual lock-ins, EduSmart Pro provides real-time data sync without manual refreshes, transparent monthly plans from ₹299/month, a 7-day free trial with no hidden fees, instant CSV/Excel import/export, and 1-click WhatsApp alerts for attendance and fee receipts."
            }
          },
          {
            "@type": "Question",
            "name": "Does student attendance update in real time on the student dashboard?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. When a teacher marks attendance on the administrator portal, the student dashboard and mobile PWA update instantly in real time via secure WebSocket streams without needing to reload or refresh the page."
            }
          },
          {
            "@type": "Question",
            "name": "Does EduSmart Pro offer a free trial and are there any hidden charges?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, EduSmart Pro provides a 100% risk-free 7-day trial with full access on the Basic plan. No credit card is required, there are zero hidden setup fees, and you can cancel anytime with one click."
            }
          },
          {
            "@type": "Question",
            "name": "Can I easily import and export my student and fee records?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. EduSmart Pro guarantees 100% data ownership. You can import your current student directory from Excel or CSV files in seconds and export full attendance, fee statements, and student profiles anytime."
            }
          },
          {
            "@type": "Question",
            "name": "What features are included in EduSmart Pro plans?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Key features include Real-Time Attendance with Absentee Alerts, Automated Fee Tracking with Digital Receipts, Class Timetables & Daily Homework Distribution, Digital Notice Board Broadcasts, Student & Parent Portal (Web & Android PWA), and direct phone and WhatsApp support (+91 7388739691)."
            }
          }
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://edusmartpro.in/#website",
        "url": "https://edusmartpro.in",
        "name": "EduSmart Pro",
        "description": "School & Coaching Management App and ERP Software in India",
        "publisher": {
          "@id": "https://edusmartpro.in/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://edusmartpro.in/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
