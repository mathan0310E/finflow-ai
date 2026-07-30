import type { Metadata } from 'next'
import Link from 'next/link'
import { Ban, AlertTriangle, Flag, Scale, Eye } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
  description: `${APP_NAME} Enterprise Acceptable Use Policy governing prohibited activities and user obligations.`,
}

const lastUpdated = 'July 15, 2025'

export default function AcceptableUsePage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <Scale className="h-3.5 w-3.5" />
          Acceptable Use Policy
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Acceptable Use Policy
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <p className="lead">
        This Acceptable Use Policy (&ldquo;AUP&rdquo;) governs your use of the {APP_NAME} Enterprise
        (&ldquo;{APP_SHORT_NAME}&rdquo;) platform, website, mobile application, and related services
        (the &ldquo;Service&rdquo;). This AUP is incorporated by reference into our{' '}
        <Link href="/terms">Terms of Service</Link>. All capitalized terms used but not defined
        in this AUP have the meanings set forth in the Terms of Service.
      </p>
      <p>
        By using the Service, you agree to comply with this AUP. We reserve the right to suspend
        or terminate accounts that violate this AUP, as described in Section 6 below.
      </p>

      <hr />

      {/* 1. Prohibited Activities */}
      <h2>1. Prohibited Activities</h2>
      <p>
        You may not use the Service for any of the following activities. This list is not
        exhaustive and we reserve the right to determine, in our sole discretion, whether
        a use of the Service violates the spirit of this AUP.
      </p>

      <h3>1.1 Fraudulent and Deceptive Activities</h3>
      <ul>
        <li>
          <strong>Expense Fraud:</strong> Submitting fictitious, inflated, duplicated, or
          otherwise fraudulent expense claims. This includes claiming personal expenses as
          business expenses, altering receipt amounts, or submitting expenses for transactions
          that did not occur.
        </li>
        <li>
          <strong>Receipt Forgery:</strong> Uploading altered, photoshopped, digitally
          manipulated, or AI-generated receipts or invoices. All uploaded receipts must be
          authentic scans or photographs of original physical receipts or valid electronic invoices.
        </li>
        <li>
          <strong>Misrepresentation:</strong> Misrepresenting your identity, role, company
          affiliation, or the purpose of an expense. This includes impersonating another user
          or creating accounts under false pretenses.
        </li>
        <li>
          <strong>Invoice Fabrication:</strong> Creating or submitting fake invoices to claim
          payments for goods or services that were never provided.
        </li>
      </ul>

      <h3>1.2 Money Laundering and Financial Crimes</h3>
      <ul>
        <li>
          Using the Service to facilitate money laundering, terrorist financing, or any activity
          that would violate anti-money laundering (AML) laws or regulations.
        </li>
        <li>
          Structuring expense submissions to avoid internal approval thresholds or detection
          (i.e., splitting large expenses into smaller amounts to circumvent review).
        </li>
        <li>
          Using the Service to process payments related to illegal activities, including but
          not limited to drug trafficking, human trafficking, illegal gambling, or sanctions
          violations.
        </li>
        <li>
          Submitting expenses related to bribery, kickbacks, or corrupt practices, including
          violations of the U.S. Foreign Corrupt Practices Act (FCPA) or similar anti-corruption
          laws.
        </li>
      </ul>

      <h3>1.3 Tax Evasion and Compliance Violations</h3>
      <ul>
        <li>
          Using the Service to evade taxes, misrepresent deductible expenses, or conceal
          taxable income.
        </li>
        <li>
          Submitting expenses that violate applicable tax laws, including claiming improper
          deductions or falsifying VAT/GST information.
        </li>
        <li>
          Using the Service in a manner that violates sanctions, export controls, or trade
          embargoes administered by the U.S. Office of Foreign Assets Control (OFAC) or
          similar authorities.
        </li>
      </ul>

      <h3>1.4 Unauthorized Access and Interference</h3>
      <ul>
        <li>
          Attempting to access another user&apos;s account, company workspace, or data without
          explicit authorization.
        </li>
        <li>
          Attempting to bypass authentication, authorization, or access controls, including
          but not limited to Firestore Security Rules, API rate limits, or session management.
        </li>
        <li>
          Sharing account credentials or allowing unauthorized individuals to access the Service
          through your account.
        </li>
        <li>
          Accessing or attempting to access data belonging to another company tenant on the
          multi-tenant platform.
        </li>
      </ul>

      <h3>1.5 Security Violations</h3>
      <ul>
        <li>
          Probing, scanning, or testing the vulnerability of the Service or its infrastructure
          without prior written authorization from our security team.
        </li>
        <li>
          Attempting to interfere with, disrupt, or disable the Service, including denial-of-service
          attacks, resource exhaustion, or intentional system overload.
        </li>
        <li>
          Introducing viruses, worms, malware, ransomware, or any other malicious code to the
          Service.
        </li>
        <li>
          Intercepting, monitoring, or modifying communications to or from the Service without
          authorization.
        </li>
      </ul>

      <h3>1.6 Data Misuse</h3>
      <ul>
        <li>
          Systematically extracting, scraping, or harvesting data from the Service using automated
          scripts, bots, crawlers, or other tools.
        </li>
        <li>
          Using data obtained from the Service to create competing products or services.
        </li>
        <li>
          Downloading, storing, or processing expense data, receipts, or user information for
          purposes unrelated to your legitimate use of the Service.
        </li>
        <li>
          Selling, renting, or otherwise commercially exploiting data from the Service to third
          parties.
        </li>
      </ul>

      {/* 2. Data Integrity */}
      <h2>2. Data Integrity</h2>
      <p>
        Maintaining the integrity and accuracy of expense data is fundamental to the proper
        functioning of the {APP_SHORT_NAME} platform. You agree to:
      </p>
      <ul>
        <li>
          <strong>Accurate Submissions:</strong> Ensure that all expense data you submit is
          true, accurate, and complete to the best of your knowledge.
        </li>
        <li>
          <strong>Valid Receipts:</strong> Only upload receipts and invoices that correspond
          to genuine business transactions. Receipts must be legible and include all relevant
          details (merchant name, date, amount, items purchased, tax amount).
        </li>
        <li>
          <strong>Timely Submissions:</strong> Submit expenses in a timely manner, consistent
          with your organization&apos;s expense reporting policies.
        </li>
        <li>
          <strong>Correction of Errors:</strong> Promptly correct any errors or inaccuracies
          in submitted expense data when discovered, whether the error was made by you or by
          the AI categorization system.
        </li>
        <li>
          <strong>Receipt Retention:</strong> Retain original physical receipts and invoices
          for the period required by applicable tax laws and your organization&apos;s policies,
          even after uploading digital copies to the Service.
        </li>
      </ul>

      {/* 3. AI Usage Guidelines */}
      <h2>3. AI Usage Guidelines</h2>
      <p>
        The Service includes AI-powered features that enhance expense management. When using
        these features, you agree to:
      </p>
      <ul>
        <li>
          <strong>No Manipulation:</strong> Do not attempt to manipulate, deceive, or
          intentionally mislead the AI categorization system. This includes submitting
          expenses with misleading descriptions to generate incorrect categories or submitting
          low-quality receipts to test OCR limitations.
        </li>
        <li>
          <strong>No Reverse Engineering:</strong> Do not attempt to reverse engineer, extract,
          replicate, or clone the AI models, algorithms, or prompt structures used in the
          Service. The AI features are proprietary technology.
        </li>
        <li>
          <strong>Human Verification:</strong> Review and verify all AI-generated outputs,
          including expense categorizations, OCR data extractions, and AI insights, before
          acting on them. AI outputs are assistive tools, not authoritative determinations.
        </li>
        <li>
          <strong>Appropriate Use:</strong> Use the AI chat assistant for expense management
          purposes only. Do not submit personal, sensitive, or confidential information unrelated
          to expense management in AI chat conversations.
        </li>
        <li>
          <strong>No Automated Reliance:</strong> Do not fully automate financial decisions
          based solely on AI outputs without human review. All AI-generated insights, policy
          compliance checks, and categorizations require human verification.
        </li>
      </ul>

      {/* 4. Prohibited Content */}
      <h2>4. Prohibited Content</h2>
      <p>
        You may not upload, submit, or transmit any content through the Service that:
      </p>
      <ul>
        <li>Is defamatory, harassing, discriminatory, or otherwise objectionable.</li>
        <li>Contains sensitive personal data (special categories of data under GDPR) unrelated to the expense management purpose.</li>
        <li>Depicts or promotes violence, illegal activities, or self-harm.</li>
        <li>Infringes on the intellectual property rights of any third party.</li>
        <li>Contains malware, viruses, or other harmful code.</li>
        <li>Violates any applicable law, regulation, or industry standard.</li>
      </ul>

      {/* 5. Reporting Violations */}
      <h2>5. Reporting Violations</h2>
      <p>
        If you become aware of any violation of this AUP, we encourage you to report it promptly.
        You can report violations through the following channels:
      </p>
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Report via Email:</strong>{' '}
            <a href="mailto:abuse@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              abuse@finflow.ai
            </a>
            {' '}(for suspected AUP violations)
          </li>
          <li>
            <strong>Security Issues:</strong>{' '}
            <a href="mailto:security@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              security@finflow.ai
            </a>
          </li>
          <li>
            <strong>Fraud Concerns:</strong>{' '}
            <a href="mailto:compliance@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              compliance@finflow.ai
            </a>
          </li>
          <li>
            <strong>In-App Reporting:</strong> Company administrators can report suspicious
            activity through the admin dashboard.
          </li>
        </ul>
      </div>
      <p>
        All reports will be investigated promptly. We will take appropriate action based on
        the severity and nature of the violation. We will protect the confidentiality of
        individuals who report violations in good faith.
      </p>

      {/* 6. Consequences */}
      <h2>6. Consequences of Violation</h2>
      <p>
        Violation of this AUP may result in the following actions, depending on the severity,
        frequency, and impact of the violation:
      </p>
      <table>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Examples</th>
            <th>Potential Consequence</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Minor</strong></td>
            <td>Incorrect categorization, late submissions, minor data inaccuracies</td>
            <td>Warning notification, mandatory correction, additional training</td>
          </tr>
          <tr>
            <td><strong>Moderate</strong></td>
            <td>Repeated inaccuracies, policy violation flags, sharing account credentials</td>
            <td>Temporary account suspension, escalation to company administrator, mandatory retraining</td>
          </tr>
          <tr>
            <td><strong>Severe</strong></td>
            <td>Fraudulent submissions, receipt forgery, unauthorized access, security violations</td>
            <td>Immediate permanent account termination, reporting to relevant authorities, legal action</td>
          </tr>
        </tbody>
      </table>
      <p>
        {APP_SHORT_NAME} reserves the right to pursue legal remedies for any violation that
        results in harm to the platform, other users, or our business interests. We may also
        report violations to relevant regulatory or law enforcement authorities, including
       但不限于 financial regulators, tax authorities, and law enforcement agencies.
      </p>

      {/* 7. Changes */}
      <h2>7. Changes to This AUP</h2>
      <p>
        We may update this Acceptable Use Policy from time to time. We will notify users of
        material changes by posting the updated policy on this page and updating the
        &ldquo;Last Updated&rdquo; date. Continued use of the Service after changes become
        effective constitutes acceptance of the updated AUP.
      </p>

      {/* 8. Contact */}
      <h2>8. Contact</h2>
      <p>
        If you have questions about this Acceptable Use Policy, please contact us at{' '}
        <a href="mailto:legal@finflow.ai">legal@finflow.ai</a>.
      </p>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        This Acceptable Use Policy was last updated on {lastUpdated}.
      </p>
    </article>
  )
}