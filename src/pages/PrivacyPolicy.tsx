// src/pages/PrivacyPolicy.tsx
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-center mb-10 md:mb-16">
          Privacy Policy
        </h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 mb-8">
            Last updated: January 31, 2026
          </p>

          <p>
            primIQ.ai ("we", "us", or "our") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you visit our website
            (primIQ.ai), use our services (including CivIQ and LogIQ), or
            interact with us in any way.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>
              <strong>Personal Information</strong>: Name, email address, phone
              number, and any information you provide in forms, applications, or
              communications.
            </li>
            <li>
              <strong>Account Data</strong>: When you sign in (via Cognito), we
              may receive your email and basic profile info.
            </li>
            <li>
              <strong>Usage Data</strong>: IP address, browser type, pages
              visited, time spent, and interaction data (via cookies, logs,
              analytics).
            </li>
            <li>
              <strong>Meeting & Content Data</strong>: If you use LogIQ or CivIQ
              features, we process meeting transcripts, Jira data, code changes,
              and related content — but only with your explicit authorization
              and for the purpose of providing the service.
            </li>
            <li>
              <strong>Uploaded Files</strong>: Resumes or other files you submit
              (e.g., job applications) are processed temporarily and deleted
              after review unless you consent otherwise.
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            2. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>
              Provide, maintain, and improve our services (CivIQ, LogIQ,
              chatbot, etc.)
            </li>
            <li>Authenticate and secure your account</li>
            <li>
              Respond to inquiries, support requests, and job applications
            </li>
            <li>
              Send service updates, newsletters, or marketing (only if you opt
              in)
            </li>
            <li>Comply with legal obligations and prevent fraud/abuse</li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            3. Sharing Your Information
          </h2>
          <p>We do not sell your personal information. We may share it with:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>
              Service providers (AWS, Claude/Anthropic, Zoom/Teams/Jira/GitHub
              integrations — only as needed and under strict contracts)
            </li>
            <li>Legal authorities when required by law</li>
            <li>
              Business partners in case of merger/acquisition (with notice)
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">4. Data Security</h2>
          <p>
            We implement reasonable security measures (encryption at
            rest/transit, access controls, monitoring) to protect your data.
            However, no system is 100% secure — we cannot guarantee absolute
            security.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">5. Your Rights</h2>
          <p>Depending on your location, you may have rights to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Access, correct, or delete your personal data</li>
            <li>Opt out of marketing emails</li>
            <li>Request data portability</li>
            <li>Object to processing</li>
          </ul>
          <p className="mt-4">
            Contact us at{" "}
            <a
              href="mailto:info@primiq.ai"
              className="text-primary-400 hover:text-primary-300"
            >
              info@primiq.ai
            </a>{" "}
            to exercise these rights.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            6. International Transfers
          </h2>
          <p>
            Your data may be processed in the United States or other countries.
            We use safeguards (e.g., Standard Contractual Clauses) to protect
            cross-border transfers.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            7. Changes to This Policy
          </h2>
          <p>
            We may update this policy. Changes will be posted here with the
            updated date. Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">8. Contact Us</h2>
          <p>
            Questions about this Privacy Policy? Reach out to:
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
