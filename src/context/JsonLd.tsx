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
        "description": "EduSmart Pro - Digital Coaching & Tuition Management Platform for Student Enrollment, Batch Attendance, Fee Tracking, and Parent Updates. Offers 7 days free trial with no hidden charges, cancel subscription anytime, and easy CSV/Excel data import & export. Automates student attendance, fee tracking with instant digital receipts, homework & timetable management, and real-time parent notice updates.",
        "image": "https://edusmartpro.in/icons/icon-512x512.png",
        "screenshot": "https://edusmartpro.in/icons/icon-512x512.png",
        "softwareVersion": "2.4.0",
        "inLanguage": ["en-IN", "hi-IN"],
        "offers": [
          {
            "@type": "Offer",
            "name": "7-Day Free Trial",
            "price": "0",
            "priceCurrency": "INR",
            "description": "Full access 7 days trial, no credit card required, zero hidden charges, cancel anytime.",
            "availability": "https://schema.org/InStock",
            "url": "https://edusmartpro.in/register"
          },
          {
            "@type": "Offer",
            "name": "Starter Plan",
            "price": "299",
            "priceCurrency": "INR",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "299",
              "priceCurrency": "INR",
              "unitText": "MONTH"
            },
            "description": "For up to 40 students. Includes student management, smart attendance, fee tracking & receipts, notice board, and student/parent login app.",
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
            "description": "Most popular plan for up to 150 students. Includes all Starter features plus automated WhatsApp notices, fee reminders, homework, and timetable management.",
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
          "7 Days Free Trial with Zero Risk",
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
          "Dedicated Indian Software for Coaching Institutes & Schools"
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
        "name": "Shah",
        "alternateName": "Shah Nawaz Ali",
        "jobTitle": "Founder & CEO",
        "birthDate": "XXXX-09-07",
        "description": "16-year-old student (Class 9 at Lucknow Public School) and Founder & CEO of EduSmart Pro, building high-performance coaching management ERP software.",
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
        "description": "EduSmart Pro develops modern School and Coaching Management ERP software tailored for Indian coaching institutes and schools.",
        "founder": {
          "@id": "https://edusmartpro.in/#founder"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+91-73887-39691",
            "contactType": "customer support",
            "email": "shanibrooo@gmail.com",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
          }
        ],
        "sameAs": [
          "https://edusmartpro.in"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://edusmartpro.in/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is EduSmart Pro and why is it better than other ERP software?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "EduSmart Pro is an all-in-one School/Coaching management app and modern ERP software built specifically for Indian educators. Unlike bulky, complicated legacy ERPs that charge tens of thousands of rupees upfront with long lock-ins, EduSmart Pro offers transparent monthly plans starting at just ₹299/month, a 7-day free trial with no hidden charges, cancel anytime flexibility, easy CSV data import/export, and instant WhatsApp automation for attendance and fee receipts."
            }
          },
          {
            "@type": "Question",
            "name": "Does EduSmart Pro offer a free trial and are there any hidden charges?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! EduSmart Pro offers a 100% risk-free 7 days trial with zero hidden charges. No credit card is required to get started, and you can cancel your subscription at any time with a single click."
            }
          },
          {
            "@type": "Question",
            "name": "Can I easily import and export my student and fee data?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. EduSmart Pro guarantees 100% data ownership with zero vendor lock-in. You can import your existing students from Excel/CSV in seconds and export all attendance, fees, and student records whenever you want."
            }
          },
          {
            "@type": "Question",
            "name": "What features are included in EduSmart Pro plans?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "EduSmart Pro includes comprehensive school and coaching management features: Student & Batch Management, Smart Attendance with Instant WhatsApp Absentee Alerts, Automated Fee Tracking & Due Reminders, Instant Digital Fee Receipts, Class Timetable & Schedule, Homework Tracker, Notice Board Broadcasts, Student/Parent Mobile PWA, and dedicated Indian support via WhatsApp and phone (+91 7388739691)."
            }
          },
          {
            "@type": "Question",
            "name": "How is EduSmart Pro designed specifically for Indian institutes?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "EduSmart Pro is built specifically for Indian coaching centers, tuition classes, and schools. It provides localized workflows like 1-click WhatsApp attendance, instant fee receipts, and simple CSV/Excel import to give institutes world-class digital tools without high enterprise costs."
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