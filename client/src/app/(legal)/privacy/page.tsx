import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Globe, Lock, Eye, Database } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${APP_NAME} Enterprise. How we collect, use, process, and protect your data.`,
}

const effectiveDate = 'January 1, 2025'
const lastUpdated = 'July 15, 2025'

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <Shield className="h-3.5 w-3.5" />
          Privacy Policy
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Database className="h-3.5 w-3.5" />
            GDPR Compliant
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Globe className="h-3.5 w-3.5" />
            CCPA Compliant
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Lock className="h-3.5 w-3.5" />
            SOC 2 Compliant
          </span>
        </div>
      </div>

      {/* Preamble */}
      <p className="lead">
        {APP_NAME} Enterprise (&ldquo;{APP_SHORT_NAME},&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
        is committed to protecting the privacy and security of your personal data. This Privacy Policy
        explains how we collect, use, disclose, retain, and safeguard your information when you use
        our AI-powered expense management platform, website, and related services (the &ldquo;Service&rdquo;).
      </p>
      <p>
        This Privacy Policy applies to all users of the Service, including individuals using personal
        accounts, company administrators, employees of organizations using {APP_SHORT_NAME}, and
        visitors to our website. We process personal data as a Data Controller (for our own users)
        and as a Data Processor (for data processed on behalf of our Customers). Our{' '}
        <Link href="/dpa">Data Processing Agreement (DPA)</Link> provides additional details
        for Customers who require processor-level commitments.
      </p>

      <hr />

      {/* 1. Information We Collect */}
      <h2>1. Information We Collect</h2>
      <p>We collect the following categories of information:</p>

      <h3>1.1 Account Information</h3>
      <ul>
        <li>Full name and display name</li>
        <li>Email address</li>
        <li>Profile photo (optional)</li>
        <li>Phone number (optional)</li>
        <li>Job title, department, and employee ID (for company accounts)</li>
        <li>Company name, industry, size, and country</li>
        <li>Account credentials (securely hashed and managed by Firebase Authentication)</li>
      </ul>

      <h3>1.2 Expense Data</h3>
      <ul>
        <li>Expense titles, descriptions, amounts, and currencies</li>
        <li>Expense categories and subcategories (both user-selected and AI-generated)</li>
        <li>Expense dates and locations</li>
        <li>Vendor names and details</li>
        <li>Department and project allocations</li>
        <li>Approval status, comments, and workflow history</li>
        <li>Policy violation flags and audit trail</li>
      </ul>

      <h3>1.3 Receipts and Invoices</h3>
      <ul>
        <li>Uploaded receipt and invoice images</li>
        <li>OCR-extracted data (merchant name, amount, date, tax, line items, invoice numbers)</li>
        <li>Metadata including file names, sizes, upload timestamps</li>
      </ul>

      <h3>1.4 AI Interaction Data</h3>
      <ul>
        <li>AI chat messages and queries submitted through the AI assistant</li>
        <li>AI-generated categorization suggestions and their confidence scores</li>
        <li>AI-generated financial insights and predictions</li>
        <li>Health score calculations and anomaly detection results</li>
      </ul>

      <h3>1.5 Usage and Technical Data</h3>
      <ul>
        <li>IP address and browser/user-agent information</li>
        <li>Device type, operating system, and screen resolution</li>
        <li>Pages visited, features used, and interaction patterns</li>
        <li>Referring URLs and exit pages</li>
        <li>Session duration and activity timestamps</li>
      </ul>

      <h3>1.6 Communication Data</h3>
      <ul>
        <li>Support inquiries and correspondence</li>
        <li>Notification preferences and communication settings</li>
        <li>Email engagement data (opens, clicks) for transactional emails</li>
      </ul>

      {/* 2. How We Collect Information */}
      <h2>2. How We Collect Information</h2>
      <p>We collect information through the following methods:</p>

      <h3>2.1 Direct Collection</h3>
      <ul>
        <li>
          <strong>Registration:</strong> When you create an account, join a company, or register
          for a workspace.
        </li>
        <li>
          <strong>Expense Submission:</strong> When you submit expenses, upload receipts or invoices,
          and interact with expense records.
        </li>
        <li>
          <strong>AI Interactions:</strong> When you use the AI chat assistant, request AI
          categorization, or generate AI-powered insights.
        </li>
        <li>
          <strong>Profile Management:</strong> When you update your profile, preferences, or
          company settings.
        </li>
        <li>
          <strong>Support Communications:</strong> When you contact our support team via email,
          chat, or phone.
        </li>
      </ul>

      <h3>2.2 Automated Collection</h3>
      <ul>
        <li>
          <strong>Cookies and Similar Technologies:</strong> We use cookies, local storage, and
          similar tracking technologies as described in our{' '}
          <Link href="/cookies">Cookie Policy</Link>.
        </li>
        <li>
          <strong>Analytics:</strong> We use analytics tools to understand how users interact
          with the Service, which helps us improve functionality and user experience.
        </li>
        <li>
          <strong>Log Data:</strong> Our servers automatically record information when you access
          the Service, including IP addresses, request timestamps, and error logs.
        </li>
      </ul>

      <h3>2.3 Third-Party Sources</h3>
      <ul>
        <li>
          <strong>Firebase Authentication:</strong> We receive authentication data from Google
          Firebase when you sign in using Google, GitHub, or email/password.
        </li>
        <li>
          <strong>Cloudinary:</strong> We receive processed image data (OCR results, image
          transformations) from Cloudinary for receipt and invoice handling.
        </li>
        <li>
          <strong>OpenRouter AI:</strong> We receive AI-generated categorization and insight
          data from OpenRouter API.
        </li>
      </ul>

      {/* 3. How We Use Information */}
      <h2>3. How We Use Information</h2>
      <p>We use the collected information for the following purposes:</p>

      <h3>3.1 Service Provision</h3>
      <ul>
        <li>Creating and managing your account and workspace</li>
        <li>Processing and tracking expense submissions through approval workflows</li>
        <li>Storing and retrieving receipts and invoices</li>
        <li>Generating reports, dashboards, and analytics</li>
        <li>Managing user roles, permissions, and company settings</li>
      </ul>

      <h3>3.2 AI Features</h3>
      <ul>
        <li>Automatically categorizing expenses using OpenRouter AI</li>
        <li>Extracting data from receipts and invoices via OCR (Tesseract.js, Cloudinary AI)</li>
        <li>Generating financial insights, predictions, and health scores</li>
        <li>Powering the AI chat assistant for expense-related queries</li>
        <li>Detecting anomalies and potential policy violations</li>
      </ul>

      <h3>3.3 Platform Improvement</h3>
      <ul>
        <li>Analyzing usage patterns to improve the Service</li>
        <li>Training and refining AI categorization models (using anonymized, aggregated data)</li>
        <li>Identifying and fixing bugs, errors, and performance issues</li>
        <li>Developing new features and capabilities</li>
      </ul>

      <h3>3.4 Communication</h3>
      <ul>
        <li>Sending transactional emails (approval notifications, reimbursement updates, etc.)</li>
        <li>Responding to support inquiries and service requests</li>
        <li>Sending service updates, security alerts, and policy change notices</li>
        <li>Sending product announcements and marketing communications (with opt-out option)</li>
      </ul>

      <h3>3.5 Security and Compliance</h3>
      <ul>
        <li>Monitoring for suspicious activity and unauthorized access</li>
        <li>Enforcing our Acceptable Use Policy and Terms of Service</li>
        <li>Complying with legal obligations and regulatory requirements</li>
        <li>Maintaining audit logs for expense approval workflows</li>
      </ul>

      {/* 4. Data Sharing & Disclosure */}
      <h2>4. Data Sharing &amp; Disclosure</h2>
      <h3>4.1 We Do Not Sell Your Data</h3>
      <p>
        <strong>{APP_SHORT_NAME} does not sell, rent, or trade your personal information to third
        parties.</strong> We do not share personal data for third-party advertising or marketing
        purposes. Your expense data, receipts, and personal information are used solely to provide
        and improve the Service.
      </p>

      <h3>4.2 Service Providers (Sub-processors)</h3>
      <p>
        We engage trusted third-party service providers to help us deliver the Service. These
        providers are contractually bound to process data only on our instructions and to maintain
        appropriate security measures:
      </p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Data Processed</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Firebase (Google)</strong></td>
            <td>Authentication, database (Firestore), hosting</td>
            <td>Account credentials, user profiles, expense records, company data</td>
            <td>United States (multi-region)</td>
          </tr>
          <tr>
            <td><strong>Cloudinary</strong></td>
            <td>Media storage, image processing, OCR</td>
            <td>Receipt images, invoice images, extracted OCR data</td>
            <td>United States</td>
          </tr>
          <tr>
            <td><strong>OpenRouter</strong></td>
            <td>AI model API for categorization and insights</td>
            <td>Expense descriptions, categories, amounts, chat messages</td>
            <td>United States</td>
          </tr>
          <tr>
            <td><strong>Vercel</strong></td>
            <td>Frontend hosting and deployment</td>
            <td>IP addresses, session data, static assets</td>
            <td>Global (multi-region CDN)</td>
          </tr>
          <tr>
            <td><strong>Render</strong></td>
            <td>Backend API hosting</td>
            <td>API requests, application data in transit</td>
            <td>United States</td>
          </tr>
        </tbody>
      </table>

      <h3>4.3 Legal Disclosures</h3>
      <p>
        We may disclose your information if required to do so by law or in the good faith belief
        that such action is necessary to:
      </p>
      <ul>
        <li>Comply with a legal obligation, court order, or government request.</li>
        <li>Protect and defend the rights or property of {APP_SHORT_NAME}.</li>
        <li>Prevent or investigate possible wrongdoing in connection with the Service.</li>
        <li>Protect the personal safety of users or the public.</li>
      </ul>

      <h3>4.4 Business Transfers</h3>
      <p>
        In the event of a merger, acquisition, reorganization, or sale of assets, your data may
        be transferred as part of the transaction. We will notify you of any such change in
        ownership or control of your personal data.
      </p>

      {/* 5. Data Retention & Deletion */}
      <h2>5. Data Retention &amp; Deletion</h2>
      <h3>5.1 Retention Periods</h3>
      <p>We retain your personal data for the following periods:</p>
      <ul>
        <li>
          <strong>Active Accounts:</strong> Your data is retained for as long as your account
          is active and the Service is being used.
        </li>
        <li>
          <strong>Terminated Accounts:</strong> Following account termination, we retain your
          data for 90 days to allow for data export. After this grace period, data is permanently
          deleted within 30 days.
        </li>
        <li>
          <strong>Expense Records:</strong> Expense data is retained for 7 years from the date
          of submission to comply with applicable tax and financial record-keeping requirements.
        </li>
        <li>
          <strong>Audit Logs:</strong> Audit logs are retained for 3 years.
        </li>
        <li>
          <strong>Communication Data:</strong> Support correspondence is retained for 2 years
          after the last interaction.
        </li>
      </ul>

      <h3>5.2 Deletion</h3>
      <p>
        You may request deletion of your data at any time by contacting us at{' '}
        <a href="mailto:dpo@finflow.ai">dpo@finflow.ai</a> or through the account settings page.
        Upon deletion, your data is permanently removed from our active systems and backup systems
        within the retention periods specified above.
      </p>

      {/* 6. User Rights */}
      <h2>6. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have the following rights regarding your personal data:
      </p>

      <h3>6.1 Access</h3>
      <p>
        You have the right to request a copy of the personal data we hold about you. We will
        provide this information in a structured, commonly used, machine-readable format.
      </p>

      <h3>6.2 Correction</h3>
      <p>
        You have the right to request correction of inaccurate or incomplete personal data.
        You can update most information directly through your account settings.
      </p>

      <h3>6.3 Deletion (&ldquo;Right to be Forgotten&rdquo;)</h3>
      <p>
        You have the right to request deletion of your personal data, subject to certain
        exceptions (e.g., legal obligations, active contracts).
      </p>

      <h3>6.4 Portability</h3>
      <p>
        You have the right to receive your personal data in a portable format and to transmit
        that data to another controller.
      </p>

      <h3>6.5 Restriction and Objection</h3>
      <p>
        You have the right to restrict or object to our processing of your personal data in
        certain circumstances, including processing for direct marketing.
      </p>

      <h3>6.6 Withdrawal of Consent</h3>
      <p>
        Where we rely on consent as a legal basis for processing, you have the right to withdraw
        that consent at any time.
      </p>

      <h3>6.7 Exercising Your Rights</h3>
      <p>
        To exercise any of these rights, please contact us at{' '}
        <a href="mailto:dpo@finflow.ai">dpo@finflow.ai</a>. We will respond to your request
        within 30 days. If you are in the EEA, you also have the right to lodge a complaint
        with your local data protection authority.
      </p>

      {/* 7. Children's Privacy */}
      <h2>7. Children&apos;s Privacy</h2>
      <p>
        The Service is not intended for individuals under the age of 18 (or the age of majority
        in their jurisdiction). We do not knowingly collect personal data from children. If we
        become aware that a child has provided us with personal data, we will promptly delete
        such information. If you believe a child has provided us with personal data, please
        contact us at <a href="mailto:dpo@finflow.ai">dpo@finflow.ai</a>.
      </p>

      {/* 8. International Data Transfers */}
      <h2>8. International Data Transfers</h2>
      <p>
        {APP_SHORT_NAME} operates primarily in the United States. If you are located in the
        European Economic Area (EEA), the United Kingdom, Switzerland, or other regions with
        data protection laws that differ from those in the United States, your data may be
        transferred to and processed in the United States.
      </p>
      <p>
        We ensure that international data transfers are protected by appropriate safeguards,
        including:
      </p>
      <ul>
        <li>
          <strong>Standard Contractual Clauses (SCCs):</strong> We have entered into SCCs with
          our sub-processors to ensure adequate data protection.
        </li>
        <li>
          <strong>Data Processing Agreements:</strong> We maintain DPAs with all sub-processors
          as listed in Section 4.2.
        </li>
        <li>
          <strong>Firebase:</strong> Google Firebase offers data processing in multiple regions.
          Customers can select data residency preferences where available.
        </li>
      </ul>

      {/* 9. Security Measures */}
      <h2>9. Security Measures</h2>
      <p>
        We implement comprehensive technical and organizational security measures to protect
        your data. For full details, please refer to our{' '}
        <Link href="/security">Security Policy</Link>. Key measures include:
      </p>
      <ul>
        <li>Encryption in transit using TLS 1.3</li>
        <li>Encryption at rest for data stored in Firestore and Cloudinary</li>
        <li>Firebase Authentication with MFA support</li>
        <li>Role-based access control (RBAC) with company-level data isolation</li>
        <li>Firestore Security Rules enforcing tenant isolation</li>
        <li>API rate limiting, input validation, and CSRF protection</li>
        <li>Regular security audits and penetration testing</li>
        <li>Incident response procedures</li>
      </ul>

      {/* 10. Cookie Policy */}
      <h2>10. Cookie Policy</h2>
      <p>
        We use cookies and similar tracking technologies to enhance your experience. For detailed
        information about the cookies we use, their purposes, and how to manage them, please see
        our separate <Link href="/cookies">Cookie Policy</Link>.
      </p>

      {/* 11. Changes to Privacy Policy */}
      <h2>11. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material
        changes by:
      </p>
      <ul>
        <li>Posting the updated Privacy Policy on this page with a new &ldquo;Last Updated&rdquo; date.</li>
        <li>Sending an email notification to company administrators.</li>
        <li>Displaying a prominent notice within the Service.</li>
      </ul>
      <p>
        We encourage you to review this Privacy Policy periodically. Your continued use of the
        Service after changes become effective constitutes your acceptance of the updated policy.
      </p>

      {/* 12. Contact & DPO Information */}
      <h2>12. Contact &amp; DPO Information</h2>
      <p>
        If you have questions, concerns, or requests regarding this Privacy Policy or our data
        practices, please contact us:
      </p>
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Data Protection Officer</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Email:</strong>{' '}
            <a href="mailto:dpo@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              dpo@finflow.ai
            </a>
          </li>
          <li>
            <strong>Privacy Inquiries:</strong>{' '}
            <a href="mailto:privacy@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              privacy@finflow.ai
            </a>
          </li>
          <li>
            <strong>Postal Address:</strong> FinFlow AI Inc., Attn: Data Protection Officer,
            251 Little Falls Drive, Wilmington, DE 19808, United States
          </li>
          <li>
            <strong>EU Representative:</strong> FinFlow AI EU Ltd., 1 Grand Canal Square,
            Dublin 2, Ireland (for GDPR purposes)
          </li>
        </ul>
      </div>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        This Privacy Policy was last updated on {lastUpdated}. Previous versions are available
        upon request.
      </p>
    </article>
  )
}