import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, FileCheck, Database, Bell, Users } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Data Processing Agreement (DPA)',
  description: `${APP_NAME} Enterprise Data Processing Agreement. Details of data processing, sub-processors, and data subject rights.`,
}

const lastUpdated = 'July 15, 2025'

export default function DpaPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <FileCheck className="h-3.5 w-3.5" />
          Data Processing Agreement
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Data Processing Agreement
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Last Updated: {lastUpdated}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Shield className="h-3.5 w-3.5" />
            GDPR Art. 28
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Database className="h-3.5 w-3.5" />
            SCCs
          </span>
        </div>
      </div>

      <p className="lead">
        This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the{' '}
        <Link href="/terms">Terms of Service</Link> (the &ldquo;Agreement&rdquo;) between
        {APP_NAME} Enterprise (&ldquo;{APP_SHORT_NAME},&rdquo; &ldquo;Processor,&rdquo; or
        &ldquo;we&rdquo;) and the Customer (&ldquo;Controller&rdquo; or &ldquo;you&rdquo;).
        This DPA reflects the parties&apos; agreement with respect to the processing of
        personal data by the Processor on behalf of the Controller in connection with the
        provision of the {APP_SHORT_NAME} expense management platform.
      </p>
      <p>
        This DPA is drafted in accordance with Article 28 of the General Data Protection
        Regulation (Regulation (EU) 2016/679) (&ldquo;GDPR&rdquo;) and is intended to be
        incorporated into the Agreement. By using the Service, the Controller agrees to
        be bound by the terms of this DPA.
      </p>

      <hr />

      {/* 1. Definitions */}
      <h2>1. Definitions</h2>
      <p>Capitalized terms used in this DPA have the meanings set forth below:</p>
      <ul>
        <li>
          <strong>&ldquo;Controller&rdquo;</strong> means the Customer, who determines the
          purposes and means of the processing of Personal Data.
        </li>
        <li>
          <strong>&ldquo;Data Subject&rdquo;</strong> means an identified or identifiable
          natural person whose Personal Data is processed.
        </li>
        <li>
          <strong>&ldquo;Personal Data&rdquo;</strong> means any information relating to an
          identified or identifiable natural person processed under the Agreement.
        </li>
        <li>
          <strong>&ldquo;Processing&rdquo;</strong> means any operation performed on Personal
          Data, including collection, recording, organization, structuring, storage, adaptation,
          retrieval, consultation, use, disclosure, dissemination, or deletion.
        </li>
        <li>
          <strong>&ldquo;Processor&rdquo;</strong> means {APP_SHORT_NAME}, who processes Personal
          Data on behalf of the Controller.
        </li>
        <li>
          <strong>&ldquo;Sub-processor&rdquo;</strong> means a third party engaged by the
          Processor to assist in processing Personal Data on behalf of the Controller.
        </li>
        <li>
          <strong>&ldquo;Supervisory Authority&rdquo;</strong> means an independent public
          authority established pursuant to Article 51 of the GDPR.
        </li>
      </ul>

      {/* 2. Data Processor vs Controller Definitions */}
      <h2>2. Roles of the Parties</h2>

      <h3>2.1 Controller</h3>
      <p>
        The Customer is the Data Controller. As the Controller, you determine the purposes
        and means of processing Personal Data. Specifically, you decide:
      </p>
      <ul>
        <li>Which users are authorized to access the Service.</li>
        <li>What expense data, receipts, and invoices are submitted to the Service.</li>
        <li>What categories, approval workflows, and policies are configured.</li>
        <li>How long data is retained before deletion.</li>
        <li>Which AI features are enabled for your organization.</li>
      </ul>

      <h3>2.2 Processor</h3>
      <p>
        {APP_SHORT_NAME} is the Data Processor. As the Processor, we:
      </p>
      <ul>
        <li>Process Personal Data only on documented instructions from the Controller.</li>
        <li>Implement appropriate technical and organizational security measures.</li>
        <li>Ensure that personnel authorized to process Personal Data are bound by confidentiality obligations.</li>
        <li>Assist the Controller in fulfilling its obligations regarding Data Subject rights.</li>
        <li>Assist the Controller with compliance obligations under Articles 32 to 36 of the GDPR.</li>
        <li>Make available all information necessary to demonstrate compliance with the GDPR.</li>
      </ul>

      {/* 3. Processing Details */}
      <h2>3. Processing Details</h2>
      <table>
        <thead>
          <tr>
            <th>Element</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Subject Matter</strong></td>
            <td>AI-powered expense management services, including expense tracking, receipt OCR,
            AI categorization, approval workflows, reporting, and analytics.</td>
          </tr>
          <tr>
            <td><strong>Duration</strong></td>
            <td>The duration of the Agreement plus 90 days post-termination for data export,
            after which data is deleted in accordance with the retention policy.</td>
          </tr>
          <tr>
            <td><strong>Nature &amp; Purpose</strong></td>
            <td>Processing of expense-related Personal Data for the purpose of providing the
            {APP_SHORT_NAME} expense management platform and associated services.</td>
          </tr>
          <tr>
            <td><strong>Categories of Data Subjects</strong></td>
            <td>Controller&apos;s employees, contractors, and authorized users who submit,
            approve, or manage expenses through the platform.</td>
          </tr>
          <tr>
            <td><strong>Types of Personal Data</strong></td>
            <td>Name, email address, phone number, profile photo, employee ID, department,
            job title, cost center, manager information, and expense-related financial data.</td>
          </tr>
          <tr>
            <td><strong>Special Categories of Data</strong></td>
            <td>The Service is not designed to process special categories of data (health,
            biometric, political opinions, religious beliefs, etc.). Controllers must ensure
            that no special category data is uploaded to the Service.</td>
          </tr>
        </tbody>
      </table>

      {/* 4. Data Security Measures */}
      <h2>4. Data Security Measures</h2>
      <p>
        The Processor shall implement appropriate technical and organizational measures to
        ensure a level of security appropriate to the risk, including:
      </p>
      <ul>
        <li>
          <strong>Encryption:</strong> TLS 1.3 for data in transit; AES-256 for data at rest
          (Firestore, Cloudinary).
        </li>
        <li>
          <strong>Access Control:</strong> Role-based access control (RBAC), multi-factor
          authentication (MFA), and principle of least privilege.
        </li>
        <li>
          <strong>Network Security:</strong> Firewalls, DDoS protection, WAF, and intrusion
          detection monitoring.
        </li>
        <li>
          <strong>Data Isolation:</strong> Multi-tenant architecture with strict company-level
          data isolation enforced by Firestore Security Rules.
        </li>
        <li>
          <strong>Audit Logging:</strong> Comprehensive audit trails of all data access,
          modifications, and administrative actions.
        </li>
        <li>
          <strong>Vulnerability Management:</strong> Regular vulnerability scanning, penetration
          testing, and timely patching of identified vulnerabilities.
        </li>
        <li>
          <strong>Personnel Training:</strong> Annual security awareness training for all
          employees with access to Personal Data.
        </li>
        <li>
          <strong>Business Continuity:</strong> Documented business continuity and disaster
          recovery plans with regular testing.
        </li>
      </ul>
      <p>
        Full details are available in our <Link href="/security">Security Policy</Link>.
      </p>

      {/* 5. Sub-processors */}
      <h2>5. Sub-processors</h2>
      <p>
        The Controller authorizes the Processor to engage the following Sub-processors for
        the provision of the Service:
      </p>
      <table>
        <thead>
          <tr>
            <th>Sub-processor</th>
            <th>Service Provided</th>
            <th>Data Processing Location</th>
            <th>Certification / Safeguards</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Google Cloud (Firebase)</strong></td>
            <td>Authentication (Firebase Auth), database (Cloud Firestore), hosting</td>
            <td>United States (multi-region)</td>
            <td>SOC 1/2/3, ISO 27001, SCCs</td>
          </tr>
          <tr>
            <td><strong>Cloudinary Ltd.</strong></td>
            <td>Media storage, image processing, OCR</td>
            <td>United States</td>
            <td>SOC 2 Type II, ISO 27001, SCCs</td>
          </tr>
          <tr>
            <td><strong>OpenRouter</strong></td>
            <td>AI model API (GPT-3.5-turbo) for categorization and insights</td>
            <td>United States</td>
            <td>SCCs, data processing agreement, no-training commitment</td>
          </tr>
          <tr>
            <td><strong>Vercel Inc.</strong></td>
            <td>Frontend hosting, CDN, edge functions</td>
            <td>Global (multi-region CDN)</td>
            <td>SOC 2 Type II, ISO 27001</td>
          </tr>
          <tr>
            <td><strong>Render Services Inc.</strong></td>
            <td>Backend API hosting, managed databases</td>
            <td>United States</td>
            <td>ISO 27001, SOC 2</td>
          </tr>
          <tr>
            <td><strong>Stripe Inc.</strong></td>
            <td>Payment processing for paid subscriptions</td>
            <td>United States</td>
            <td>PCI DSS Level 1, SOC 2 Type II</td>
          </tr>
        </tbody>
      </table>

      <h3>5.1 Engagement of New Sub-processors</h3>
      <p>
        The Processor shall notify the Controller of any intended changes concerning the
        addition or replacement of Sub-processors. The Controller may object to the engagement
        of a new Sub-processor within 30 days of notification. If the Controller objects and
        the parties cannot resolve the objection, the Controller may terminate the Agreement
        without penalty.
      </p>

      <h3>5.2 Sub-processor Compliance</h3>
      <p>
        The Processor shall impose on each Sub-processor the same data protection obligations
        as set out in this DPA. The Processor remains fully liable to the Controller for the
        performance of each Sub-processor&apos;s obligations.
      </p>

      {/* 6. Data Breach Notification */}
      <h2>6. Data Breach Notification</h2>
      <p>
        The Processor shall notify the Controller without undue delay (and in any event within
        48 hours) upon becoming aware of a personal data breach affecting the Controller&apos;s
        data. The notification shall include:
      </p>
      <ul>
        <li>A description of the nature of the breach, including categories and approximate
        number of Data Subjects and data records concerned.</li>
        <li>The name and contact details of the data protection officer or security contact.</li>
        <li>A description of the likely consequences of the breach.</li>
        <li>A description of the measures taken or proposed to address the breach and mitigate
        its possible adverse effects.</li>
      </ul>
      <p>
        The Processor shall cooperate fully with the Controller in investigating and remediating
        the breach, including providing all relevant information and access to systems for
        forensic analysis.
      </p>

      {/* 7. Data Subject Rights */}
      <h2>7. Data Subject Rights</h2>
      <p>
        The Processor shall assist the Controller in fulfilling its obligations to respond to
        Data Subject requests under Chapter III of the GDPR, including:
      </p>
      <ul>
        <li>
          <strong>Right of Access (Art. 15):</strong> Provide the Controller with tools to
          export Data Subject data in a structured, commonly used format.
        </li>
        <li>
          <strong>Right to Rectification (Art. 16):</strong> Enable the Controller to correct
          inaccurate Personal Data through the Service interface.
        </li>
        <li>
          <strong>Right to Erasure (Art. 17):</strong> Delete Personal Data upon the
          Controller&apos;s instruction, subject to legal retention requirements.
        </li>
        <li>
          <strong>Right to Restrict Processing (Art. 18):</strong> Restrict processing of
          specific Personal Data upon request.</li>
        <li>
          <strong>Right to Data Portability (Art. 20):</strong> Provide Personal Data in a
          machine-readable, portable format.
        </li>
        <li>
          <strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate
          interests or for direct marketing.
        </li>
      </ul>
      <p>
        The Controller may exercise these rights through the Service&apos;s self-service tools
        or by contacting the Processor at{' '}
        <a href="mailto:dpo@finflow.ai">dpo@finflow.ai</a>. The Processor shall respond to
        Data Subject requests forwarded by the Controller within the timeframe specified by
        applicable law.
      </p>

      {/* 8. Termination & Data Deletion */}
      <h2>8. Termination &amp; Data Deletion</h2>

      <h3>8.1 Deletion Upon Termination</h3>
      <p>
        Upon termination of the Agreement, the Processor shall, at the choice of the Controller,
        delete or return all Personal Data processed on behalf of the Controller. The Processor
        shall delete existing copies unless applicable law requires storage of the data.
      </p>

      <h3>8.2 Data Export Period</h3>
      <p>
        Following termination, the Controller has 90 days to export its data through the
        Service&apos;s export functionality. After this period, the Processor will initiate
        permanent deletion of the Personal Data.
      </p>

      <h3>8.3 Deletion Confirmation</h3>
      <p>
        Upon completion of deletion, the Processor shall provide written certification to the
        Controller that the Personal Data has been deleted in accordance with this DPA.
      </p>

      {/* 9. Audit Rights */}
      <h2>9. Audit Rights</h2>
      <p>
        The Controller may audit the Processor&apos;s compliance with this DPA once per
        calendar year, upon 30 days&apos; written notice. Audits shall be conducted by a
        mutually agreed independent third party at the Controller&apos;s expense. The Processor
        shall cooperate with reasonable audit requests, provided that the audit does not
        unreasonably interfere with the Processor&apos;s business operations.
      </p>
      <p>
        As an alternative to an on-site audit, the Processor may provide the Controller with
        copies of its SOC 2 Type II report, ISO 27001 certificate, and/or penetration testing
        summary, which shall satisfy the Controller&apos;s audit rights.
      </p>

      {/* 10. Governing Law */}
      <h2>10. Governing Law</h2>
      <p>
        This DPA shall be governed by the laws of the State of Delaware, United States. The
        parties agree that the Standard Contractual Clauses (SCCs) adopted by the European
        Commission shall apply to any transfer of Personal Data from the EEA to the United
        States, and the Processor shall enter into SCCs with the Controller upon request.
      </p>

      {/* 11. Contact */}
      <h2>11. Contact Information</h2>
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>DPO Contact:</strong>{' '}
            <a href="mailto:dpo@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              dpo@finflow.ai
            </a>
          </li>
          <li>
            <strong>Security:</strong>{' '}
            <a href="mailto:security@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              security@finflow.ai
            </a>
          </li>
          <li>
            <strong>Postal:</strong> FinFlow AI Inc., Attn: DPO, 251 Little Falls Drive,
            Wilmington, DE 19808, United States
          </li>
          <li>
            <strong>EU Rep:</strong> FinFlow AI EU Ltd., 1 Grand Canal Square, Dublin 2, Ireland
          </li>
        </ul>
      </div>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        This Data Processing Agreement was last updated on {lastUpdated}. Controllers may
        request execution of a standalone DPA by contacting{' '}
        <a href="mailto:dpo@finflow.ai">dpo@finflow.ai</a>.
      </p>
    </article>
  )
}