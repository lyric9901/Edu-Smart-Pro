export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://edusmartpro.in/#software",
        "name": "EduSmart Pro",
        "url": "https://edusmartpro.in",
        "operatingSystem": "Web, Android (PWA), iOS, Windows, macOS",
        "applicationCategory": "BusinessApplication, EducationalApplication",
        "description": "All-in-one management platform for coaching institutes, tuition centers, and schools. Automates student attendance, fee tracking, WhatsApp notices, and performance reporting in India.",
        "image": "https://edusmartpro.in/icons/icon-512x512.png",
        "screenshot": "https://edusmartpro.in/icons/icon-512x512.png",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "128",
          "bestRating": "5",
          "worstRating": "1"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock"
        },
        "featureList": [
          "Automated WhatsApp Attendance Notices",
          "Fee Tracking & Instant Digital Receipts",
          "Student Academic Journey Management",
          "Digital Notice Board & Alerts",
          "Fast Mobile PWA & Cloud Sync"
        ],
        "creator": {
          "@type": "Person",
          "name": "Shah Nawaz Ali"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://edusmartpro.in/#organization",
        "name": "EduSmart Pro",
        "url": "https://edusmartpro.in",
        "logo": "https://edusmartpro.in/icons/icon-512x512.png",
        "sameAs": [
          "https://edusmartpro.in"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "shanibrooo@gmail.com",
          "telephone": "+91-73887-39691",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi", "Gujarati"]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://edusmartpro.in/#website",
        "url": "https://edusmartpro.in",
        "name": "EduSmart Pro",
        "description": "The #1 Management Platform for Coaching Institutes in India",
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