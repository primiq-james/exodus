// src/pages/TermsOfService.tsx
export default function TermsOfService() {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-center mb-10 md:mb-16">
          Terms of Service
        </h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 mb-8">
            Last updated: January 31, 2026
          </p>

          <p>
            Welcome to primIQ.ai. These Terms of Service ("Terms") govern your
            access to and use of the primIQ.ai website, services, CivIQ, LogIQ,
            chatbot, and related offerings (collectively, the "Service"). By
            accessing or using the Service, you agree to be bound by these
            Terms.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">1. Eligibility</h2>
          <p>
            You must be at least 13 years old (or the minimum age required in
            your country) to use the Service. If you are using the Service on
            behalf of an organization, you represent that you have authority to
            bind that organization.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            2. Accounts & Security
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities under your account.
            Notify us immediately of any unauthorized use.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Use the Service for illegal purposes or to violate any law</li>
            <li>
              Attempt to reverse-engineer, decompile, or extract our AI models
            </li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>
              Scrape, copy, or redistribute Service content without permission
            </li>
            <li>Interfere with the Service or other users</li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            4. User Content & Data
          </h2>
          <p>
            You retain ownership of any content you upload or input (meeting
            transcripts, code, tickets, etc.). By using the Service, you grant
            us a limited, worldwide, royalty-free license to process, store, and
            use that content solely to provide and improve the Service.
          </p>
          <p>
            We may use anonymized/aggregated data for training, analytics, and
            product improvement (no personal identifiers).
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            5. Intellectual Property
          </h2>
          <p>
            The Service, including all software, AI models, designs, and
            trademarks, is owned by primIQ.ai or its licensors. You may not
            copy, modify, or create derivative works without written permission.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">6. Beta Services</h2>
          <p>
            CivIQ and LogIQ are in beta or pre-beta stages. Features may change,
            be limited, or be discontinued without notice. Beta use is at your
            own risk.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">7. Termination</h2>
          <p>
            We may suspend or terminate your access at any time for violation of
            these Terms or for any other reason. Upon termination, your right to
            use the Service ends immediately.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            8. Disclaimers & Limitation of Liability
          </h2>
          <p>
            The Service is provided "as is" without warranties of any kind. We
            are not liable for indirect, incidental, or consequential damages.
            Our total liability shall not exceed the amount you paid us in the
            past 12 months (or $100, if no payment).
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Texas, without
            regard to conflict of law principles.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">10. Contact Us</h2>
          <p>
            Questions about these Terms? Contact us at:
            <br />
            <a
              href="mailto:info@primiq.ai"
              className="text-primary-400 hover:text-primary-300"
            >
              info@primiq.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
