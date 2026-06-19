export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Edu Smart Pro",
    "url": "https://edusmartpro.in",
    "operatingSystem": "Web, Android (PWA), iOS",
    "applicationCategory": "EducationalApplication",
    "description": "The ultimate AI-powered app to automate attendance, fees, and student management for coaching centers in India, specifically Godhra.",
    "creator": {
      "@type": "Person",
      "name": "Shah Nawaz Ali"
    },
    "offers": {
      "@type": "Offer",
      "price": "0", 
      "priceCurrency": "INR"
    },
    "keywords": "Coaching App, Attendance Tracker, Fee Manager, EduSmart Pro"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}