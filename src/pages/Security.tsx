// src/pages/Security.tsx
export default function Security() {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-center mb-10 md:mb-16">
          Security at primIQ.ai
        </h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 mb-8">
            Security is foundational to everything we build at primIQ.ai. We
            design our systems (CivIQ, LogIQ, chatbot, and infrastructure) with
            security-first principles to protect user data, meeting content,
            code, and intellectual property.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">Security Practices</h2>
          <ul className="list-disc pl-6 space-y-4 text-gray-300">
            <li>
              <strong>Encryption</strong>: Data in transit is protected with TLS
              1.2+ (including modern TLS configurations on CloudFront and API
              Gateway). Data at rest is encrypted using AWS-managed encryption
              (SSE-KMS or equivalent).
            </li>
            <li>
              <strong>Access Controls</strong>: Least-privilege IAM roles, MFA
              on all internal accounts, and role-based access for users.
            </li>
            <li>
              <strong>Authentication</strong>: Cognito for secure login with JWT
              tokens and short-lived sessions.
            </li>
            <li>
              <strong>Integrations</strong>: OAuth for
              Zoom/Teams/Jira/GitHub/Slack — never store long-term credentials.
            </li>
            <li>
              <strong>AI Model Safety</strong>: Claude models run via Bedrock
              (AWS-managed), with prompt filtering and output guardrails to
              prevent harmful content.
            </li>
            <li>
              <strong>Audit & Monitoring</strong>: All API calls and agent
              actions are logged. CloudWatch alarms detect anomalies. Regular
              dependency and workflow checks.
            </li>
            <li>
              <strong>Data Handling</strong>: Meeting transcripts and user
              content are processed ephemerally when possible. No training on
              user data without explicit consent.
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">Beta Security Notes</h2>
          <p>
            CivIQ and LogIQ are in beta/pre-beta. While we apply
            enterprise-grade controls, beta software may contain undiscovered
            issues. We encourage responsible disclosure — report security
            concerns to security@primiq.ai.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">
            Responsible Disclosure
          </h2>
          <p>
            If you discover a security vulnerability, please report it
            responsibly to{" "}
            <a
              href="mailto:security@primiq.ai"
              className="text-primary-400 hover:text-primary-300"
            >
              security@primiq.ai
            </a>
            . We do not engage in legal action against good-faith researchers
            who follow responsible disclosure guidelines.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">Compliance</h2>
          <p>
            We are working toward SOC 2 Type 1 (target: 2026) and follow best
            practices aligned with GDPR/CCPA principles, even though we are not
            yet formally certified.
          </p>
          <ul className="list-disc pl-6 space-y-3 text-gray-300 mt-4">
            <li>
              <strong>NIST SP 800-53</strong>: Architecture and operational
              controls are mapped to relevant control families as we mature our
              security program.
            </li>
            <li>
              <strong>SOC 2 domains</strong>: Focus on Security, Availability,
              and Confidentiality control objectives for the platform.
            </li>
            <li>
              <strong>ISO/IEC 27001</strong>: Security posture is aligned to an
              ISMS-style approach (policies, risk management, access control,
              change management).
            </li>
            <li>
              <strong>CJIS</strong>: For law-enforcement use cases, CJIS-aligned
              deployments require dedicated hosting and configuration.
            </li>
            <li>
              <strong>FedRAMP</strong>: We can provide a readiness narrative and
              control mapping for federal positioning on request.
            </li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-6">Contact</h2>
          <p>
            Security questions or concerns? Email:{" "}
            <a
              href="mailto:security@primiq.ai"
              className="text-primary-400 hover:text-primary-300"
            >
              security@primiq.ai
            </a>
            <br />
            General privacy questions:{" "}
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
