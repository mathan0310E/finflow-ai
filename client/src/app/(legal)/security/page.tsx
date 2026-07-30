import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Lock, Key, Server, Network, FileSearch, AlertTriangle } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Security Policy',
  description: `${APP_NAME} Enterprise security policy covering encryption, authentication, authorization, infrastructure, and incident response.`,
}

const lastUpdated = 'July 15, 2025'

export default function SecurityPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <Shield className="h-3.5 w-3.5" />
          Security Policy
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Security Policy
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Last Updated: {lastUpdated}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Lock className="h-3.5 w-3.5" />
            TLS 1.3
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Key className="h-3.5 w-3.5" />
            MFA Support
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Server className="h-3.5 w-3.5" />
            SOC 2
          </span>
        </div>
      </div>

      <p className="lead">
        At {APP_NAME} Enterprise (&ldquo;{APP_SHORT_NAME}&rdquo;), security is a core pillar of our
        platform. This Security Policy describes the technical and organizational measures we
        implement to protect the data processed through our AI-powered expense management service.
        We employ a defense-in-depth approach, layering multiple security controls across
        infrastructure, application, data, and organizational domains.
      </p>

      <hr />

      {/* 1. Encryption */}
      <h2>1. Encryption</h2>

      <h3>1.1 Encryption in Transit</h3>
      <p>
        All communications between clients and our servers are encrypted using <strong>TLS 1.3</strong>,
        the latest and most secure version of the Transport Layer Security protocol. We enforce
        HTTPS across all endpoints, including our web application, API endpoints, and static
        asset delivery. HTTP requests are automatically redirected to HTTPS. We maintain an
        <strong>A+ rating</strong> on SSL Labs for our TLS configuration.
      </p>
      <ul>
        <li>Certificate type: TLS 1.3 with strong cipher suites (TLS_AES_256_GCM_SHA384).</li>
        <li>HSTS (HTTP Strict Transport Security) is enabled with a max-age of 2 years.</li>
        <li>All API responses include secure headers including <code>Strict-Transport-Security</code>,
        <code>X-Content-Type-Options</code>, and <code>X-Frame-Options</code>.</li>
      </ul>

      <h3>1.2 Encryption at Rest</h3>
      <p>
        Data stored in our infrastructure is encrypted at rest using industry-standard encryption:
      </p>
      <ul>
        <li>
          <strong>Firestore (Firebase):</strong> Data is automatically encrypted at rest using
          AES-256 encryption by Google Cloud&apos;s infrastructure. Encryption keys are managed
          by Google Cloud Key Management Service (KMS).
        </li>
        <li>
          <strong>Cloudinary:</strong> Uploaded receipts and invoices are encrypted at rest using
          AES-256. Cloudinary maintains SOC 2 Type II certification.
        </li>
        <li>
          <strong>Backend Services (Render):</strong> Data volumes and databases are encrypted
          at rest using platform-managed encryption keys.
        </li>
      </ul>

      {/* 2. Authentication */}
      <h2>2. Authentication</h2>

      <h3>2.1 Firebase Authentication</h3>
      <p>
        {APP_SHORT_NAME} uses <strong>Firebase Authentication</strong> as its identity platform.
        Firebase Auth provides:
      </p>
      <ul>
        <li>Secure password hashing using bcrypt with salted hashes.</li>
        <li>Support for email/password, Google OAuth, and GitHub OAuth sign-in methods.</li>
        <li>Token-based session management using Firebase ID tokens (JWTs) with 1-hour expiry.</li>
        <li>Automatic token refresh to maintain secure sessions.</li>
        <li>Rate limiting on authentication endpoints to prevent brute-force attacks.</li>
      </ul>

      <h3>2.2 Multi-Factor Authentication (MFA)</h3>
      <p>
        {APP_SHORT_NAME} supports <strong>multi-factor authentication</strong> for enhanced
        account security. Company administrators can enforce MFA for all users in their
        organization. MFA methods include time-based one-time passwords (TOTP) via authenticator
        apps (Google Authenticator, Authy, etc.) and SMS-based verification codes.
      </p>

      <h3>2.3 Session Management</h3>
      <p>
        User sessions are managed through Firebase Auth tokens with the following security measures:
      </p>
      <ul>
        <li>Session tokens expire after 1 hour and are automatically refreshed.</li>
        <li>Long-lived sessions (remember me) persist for up to 30 days.</li>
        <li>Session revocation is supported for immediate logout on all devices.</li>
        <li>Concurrent session limits can be configured by company administrators.</li>
      </ul>

      {/* 3. Authorization */}
      <h2>3. Authorization</h2>

      <h3>3.1 Role-Based Access Control (RBAC)</h3>
      <p>
        {APP_SHORT_NAME} implements a comprehensive RBAC system with the following roles:
      </p>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Permissions</th>
            <th>Scope</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Super Admin</strong></td>
            <td>Full system access across all companies</td>
            <td>Global (platform-wide)</td>
          </tr>
          <tr>
            <td><strong>CEO</strong></td>
            <td>Company-wide oversight, final approval authority</td>
            <td>Company</td>
          </tr>
          <tr>
            <td><strong>Finance Manager</strong></td>
            <td>Budget management, expense review, financial approval</td>
            <td>Company</td>
          </tr>
          <tr>
            <td><strong>Department Manager</strong></td>
            <td>Team expense approval, department budget monitoring</td>
            <td>Department</td>
          </tr>
          <tr>
            <td><strong>Employee</strong></td>
            <td>Submit and view own expenses, personal profile management</td>
            <td>Self</td>
          </tr>
        </tbody>
      </table>

      <h3>3.2 Company Isolation (Multi-Tenancy)</h3>
      <p>
        The platform uses a <strong>strict multi-tenant architecture</strong>. Each company
        workspace is completely isolated, ensuring that:
      </p>
      <ul>
        <li>Users from one company cannot access data belonging to another company.</li>
        <li>Company-specific Firestore collections are prefixed with the company ID.</li>
        <li>All database queries are scoped to the authenticated user&apos;s company.</li>
        <li>Cross-tenant data access is prevented at the application and database layers.</li>
      </ul>

      <h3>3.3 Firestore Security Rules</h3>
      <p>
        All data access is governed by <strong>Firestore Security Rules</strong> that enforce
        row-level security. The rules ensure that:
      </p>
      <ul>
        <li>Users can only read/write data within their own company scope.</li>
        <li>Users can only access expense records they are authorized to view based on their role.</li>
        <li>Approval chain operations are restricted to authorized approvers at each level.</li>
        <li>Company settings modifications are restricted to authorized administrators.</li>
        <li>All access attempts are logged for audit purposes.</li>
      </ul>

      {/* 4. Data Isolation */}
      <h2>4. Data Isolation</h2>
      <p>
        Our multi-tenant architecture ensures complete data isolation between different customers:
      </p>
      <ul>
        <li>
          <strong>Database Level:</strong> Each company&apos;s data is stored in separate Firestore
          collections with the company ID as a partition key.
        </li>
        <li>
          <strong>Storage Level:</strong> Receipts and invoices uploaded to Cloudinary are organized
          in separate folders per company, with access restricted by upload tokens and company-scoped
          API keys.
        </li>
        <li>
          <strong>Caching Level:</strong> Application-level caches are keyed by company ID to
          prevent cross-tenant data leakage.
        </li>
        <li>
          <strong>AI Processing:</strong> Data sent to OpenRouter AI is tagged with company
          identifiers to ensure response isolation.
        </li>
      </ul>

      {/* 5. API Security */}
      <h2>5. API Security</h2>
      <p>
        All API endpoints are secured through the following measures:
      </p>
      <ul>
        <li>
          <strong>Rate Limiting:</strong> API requests are rate-limited per user and per IP
          address. Excessive requests are temporarily blocked with a 429 Too Many Requests response.
        </li>
        <li>
          <strong>CSRF Protection:</strong> All state-changing requests require a CSRF token
          validated by the server.
        </li>
        <li>
          <strong>Input Validation:</strong> All user inputs are validated and sanitized on
          both client and server sides. We use Zod schemas for request validation.
        </li>
        <li>
          <strong>Helmet.js:</strong> Our Express.js backend uses Helmet.js to set security-related
          HTTP headers including Content-Security-Policy, X-Powered-By removal, and Referrer-Policy.
        </li>
        <li>
          <strong>CORS:</strong> Cross-Origin Resource Sharing is strictly configured to allow
          requests only from authorized origins.
        </li>
        <li>
          <strong>API Authentication:</strong> All API requests require a valid Firebase Auth
          token, verified on each request.
        </li>
      </ul>

      {/* 6. Infrastructure Security */}
      <h2>6. Infrastructure Security</h2>

      <h3>6.1 Vercel (Frontend)</h3>
      <ul>
        <li>DDoS protection at the edge network.</li>
        <li>Automatic HTTPS with managed TLS certificates.</li>
        <li>Global CDN with data processed at edge locations near users.</li>
        <li>Infrastructure monitoring and automated scaling.</li>
        <li>Security headers applied at the CDN level.</li>
      </ul>

      <h3>6.2 Render (Backend)</h3>
      <ul>
        <li>Isolated containers for each service deployment.</li>
        <li>Automatic TLS termination at the load balancer.</li>
        <li>Private networking between backend services.</li>
        <li>Automated security patching for base images.</li>
        <li>Encrypted data volumes for persistent storage.</li>
      </ul>

      <h3>6.3 Firebase (Database & Auth)</h3>
      <ul>
        <li>Google Cloud infrastructure with SOC 1, SOC 2, SOC 3, and ISO 27001 certifications.</li>
        <li>Automated encryption at rest and in transit.</li>
        <li>Multi-region data replication for disaster recovery.</li>
        <li>99.95% uptime SLA for Firestore.</li>
      </ul>

      <h3>6.4 Cloudinary (Media Storage)</h3>
      <ul>
        <li>SOC 2 Type II certified infrastructure.</li>
        <li>Encryption at rest (AES-256) and in transit (TLS).</li>
        <li>Access control through signed URLs and upload presets.</li>
        <li>Automatic malware scanning for uploaded files.</li>
      </ul>

      <h3>6.5 Network Security</h3>
      <ul>
        <li>Web Application Firewall (WAF) at the edge.</li>
        <li>DDoS protection through Vercel&apos;s edge network.</li>
        <li>IP allowlisting and blocking capabilities for enterprise customers.</li>
        <li>Regular vulnerability scanning of all infrastructure components.</li>
      </ul>

      {/* 7. Incident Response */}
      <h2>7. Incident Response</h2>
      <p>
        We maintain a documented <strong>Incident Response Plan</strong> aligned with industry
        best practices (NIST SP 800-61). Our incident response process includes:
      </p>

      <h3>7.1 Preparation</h3>
      <ul>
        <li>Dedicated security incident response team with defined roles.</li>
        <li>Runbooks for common incident scenarios (data breach, DDoS, unauthorized access).</li>
        <li>Regular tabletop exercises and incident response drills.</li>
      </ul>

      <h3>7.2 Detection & Analysis</h3>
      <ul>
        <li>24/7 automated monitoring for anomalous activity.</li>
        <li>Real-time alerting for security events (unusual login patterns, data access anomalies).</li>
        <li>Centralized logging through Firebase and application-level audit trails.</li>
      </ul>

      <h3>7.3 Containment, Eradication & Recovery</h3>
      <ul>
        <li>Immediate isolation of affected systems upon incident confirmation.</li>
        <li>Forensic analysis to determine root cause and scope.</li>
        <li>System restoration from encrypted backups.</li>
        <li>Post-incident review and remediation implementation.</li>
      </ul>

      <h3>7.4 Post-Incident</h3>
      <ul>
        <li>Root cause analysis documentation.</li>
        <li>Implementation of preventive measures.</li>
        <li>Notification to affected users and regulatory authorities as required by applicable law.</li>
      </ul>

      <h3>7.5 Data Breach Notification</h3>
      <p>
        In the event of a data breach that affects your personal data, we will:
      </p>
      <ul>
        <li>Notify affected users within 72 hours of becoming aware of the breach.</li>
        <li>Provide details of the nature, scope, and likely consequences of the breach.</li>
        <li>Describe the measures taken or proposed to address the breach.</li>
        <li>Report to relevant supervisory authorities as required by applicable regulations.</li>
      </ul>

      {/* 8. Vulnerability Reporting */}
      <h2>8. Vulnerability Reporting</h2>
      <p>
        We welcome responsible disclosure of security vulnerabilities. If you discover a security
        issue in the {APP_SHORT_NAME} platform, please report it to us immediately:
      </p>
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Security Contact:</strong>{' '}
            <a href="mailto:security@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              security@finflow.ai
            </a>
          </li>
          <li>
            <strong>PGP Key:</strong> Available at{' '}
            <a
              href="https://finflow.ai/.well-known/security.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              finflow.ai/.well-known/security.txt
            </a>
          </li>
          <li>
            <strong>Bug Bounty Program:</strong> We participate in coordinated disclosure
            programs. Please contact us before disclosing any vulnerability publicly.
          </li>
        </ul>
      </div>
      <p>
        We commit to acknowledging receipt of vulnerability reports within 24 hours and providing
        regular updates on remediation progress.
      </p>

      {/* 9. Compliance */}
      <h2>9. Compliance &amp; Certifications</h2>
      <p>
        {APP_SHORT_NAME} is committed to maintaining compliance with industry standards and
        regulations:
      </p>
      <ul>
        <li>
          <strong>SOC 2 Type II:</strong> We maintain SOC 2 Type II certification for security,
          availability, and confidentiality trust services criteria.
        </li>
        <li>
          <strong>GDPR:</strong> Our data processing practices comply with the EU General Data
          Protection Regulation. We maintain a Data Processing Agreement (DPA) for customers
          who require it.
        </li>
        <li>
          <strong>CCPA:</strong> We comply with the California Consumer Privacy Act and respect
          the data rights of California residents.
        </li>
        <li>
          <strong>ISO 27001:</strong> Our information security management system is aligned
          with ISO/IEC 27001 standards.
        </li>
      </ul>

      {/* Contact */}
      <h2>10. Contact</h2>
      <p>
        For security-related inquiries, please contact our security team:
      </p>
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Security Issues:</strong>{' '}
            <a href="mailto:security@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              security@finflow.ai
            </a>
          </li>
          <li>
            <strong>Data Protection Officer:</strong>{' '}
            <a href="mailto:dpo@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              dpo@finflow.ai
            </a>
          </li>
          <li>
            <strong>Postal Address:</strong> FinFlow AI Inc., Attn: Security Team,
            251 Little Falls Drive, Wilmington, DE 19808, United States
          </li>
        </ul>
      </div>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        This Security Policy was last updated on {lastUpdated}. We review and update this policy
        quarterly or after significant changes to our security infrastructure.
      </p>
    </article>
  )
}