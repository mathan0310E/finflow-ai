import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Scale, FileText } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of Service for ${APP_NAME} Enterprise AI-powered expense management platform.`,
}

const effectiveDate = 'January 1, 2025'
const lastUpdated = 'July 15, 2025'

export default function TermsPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <Scale className="h-3.5 w-3.5" />
          Legal Document
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <FileText className="h-3.5 w-3.5" />
            Version 2.1
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Shield className="h-3.5 w-3.5" />
            Enterprise
          </span>
        </div>
      </div>

      {/* Preamble */}
      <p className="lead">
        Welcome to {APP_NAME} Enterprise (&ldquo;{APP_SHORT_NAME},&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
        These Terms of Service (the &ldquo;Terms&rdquo;) govern your access to and use of the {APP_NAME}
        platform, website, mobile application, and related services (collectively, the &ldquo;Service&rdquo;).
      </p>
      <p>
        By registering for, accessing, or using the Service, you agree to be bound by these Terms.
        If you are using the Service on behalf of an organization (a &ldquo;Company&rdquo;), you represent
        and warrant that you have the authority to bind that organization to these Terms. If you do
        not agree to these Terms, you must not access or use the Service.
      </p>

      <hr />

      {/* 1. Acceptance of Terms */}
      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account, submitting expense data, uploading receipts or invoices, using our AI-powered
        categorization features, or otherwise accessing the Service, you acknowledge that you have read,
        understood, and agree to be bound by these Terms, our <Link href="/privacy">Privacy Policy</Link>,
        our <Link href="/cookies">Cookie Policy</Link>, and our <Link href="/acceptable-use">Acceptable Use Policy</Link>.
      </p>
      <p>
        If you are using the Service as an employee of a Company that has registered for {APP_NAME} Enterprise,
        your use of the Service is also subject to your employer&apos;s internal expense policies. In the event
        of a conflict between these Terms and your employer&apos;s policies, these Terms shall govern your
        use of the {APP_NAME} platform.
      </p>

      {/* 2. Description of Service */}
      <h2>2. Description of Service</h2>
      <p>
        {APP_NAME} Enterprise is an AI-powered expense management SaaS platform that provides the following
        capabilities:
      </p>
      <ul>
        <li>
          <strong>Expense Tracking &amp; Submission:</strong> Users can submit, categorize, and track
          business expenses across multiple currencies and categories.
        </li>
        <li>
          <strong>AI-Powered Features:</strong> The Service uses artificial intelligence through
          OpenRouter AI (GPT-3.5-turbo) to automatically categorize expenses, generate financial
          insights, detect anomalies, provide a health score, and power an AI chat assistant for
          expense-related queries.
        </li>
        <li>
          <strong>OCR Scanning:</strong> The Service uses Tesseract.js and Cloudinary AI to perform
          optical character recognition (OCR) on uploaded receipts and invoices, extracting merchant
          names, amounts, dates, tax information, and line items.
        </li>
        <li>
          <strong>Multi-Level Approval Workflows:</strong> Organizations can configure multi-tier
          approval chains involving department managers, finance managers, and CEOs.
        </li>
        <li>
          <strong>Multi-Tenant Architecture:</strong> The Service supports personal workspaces,
          company workspaces, and employee accounts within organizations, with complete data isolation
          between tenants.
        </li>
        <li>
          <strong>Reporting &amp; Analytics:</strong> Comprehensive dashboards and configurable
          reports for financial analysis, budget tracking, and compliance monitoring.
        </li>
        <li>
          <strong>Vendor Management:</strong> Track and analyze spending across vendors and suppliers.
        </li>
      </ul>

      {/* 3. User Accounts & Registration */}
      <h2>3. User Accounts &amp; Registration</h2>
      <h3>3.1 Account Types</h3>
      <p>
        {APP_SHORT_NAME} supports three account types:
      </p>
      <ul>
        <li>
          <strong>Personal Accounts:</strong> For individual users managing their own expenses.
          Personal accounts are limited to a single user.
        </li>
        <li>
          <strong>Company Accounts:</strong> For organizations that register a company workspace.
          Company accounts include an administrator who manages users, roles, and settings.
        </li>
        <li>
          <strong>Employee Accounts:</strong> For individuals who are invited to join a Company
          account. Employee accounts are governed by the Company&apos;s administrative settings.
        </li>
      </ul>

      <h3>3.2 Registration</h3>
      <p>
        To register for the Service, you must provide accurate, current, and complete information
        as requested in the registration form, including your name, email address, and company
        details (if applicable). You are responsible for maintaining the confidentiality of your
        account credentials and for all activities that occur under your account.
      </p>

      <h3>3.3 Account Security</h3>
      <p>
        You agree to: (a) notify us immediately of any unauthorized use of your account or any
        other breach of security; (b) use strong, unique passwords; and (c) enable multi-factor
        authentication (MFA) where available. We use Firebase Authentication for account management
        and session handling.
      </p>

      {/* 4. User Responsibilities */}
      <h2>4. User Responsibilities</h2>
      <p>As a user of the Service, you are responsible for:</p>
      <ul>
        <li>
          <strong>Accurate Expense Data:</strong> Submitting true, accurate, and complete expense
          information. You must not fabricate, inflate, or duplicate expense claims.
        </li>
        <li>
          <strong>Valid Receipts:</strong> Uploading legible, authentic receipts or invoices that
          correspond to actual business transactions. Receipts must not be altered, forged, or
          digitally manipulated.
        </li>
        <li>
          <strong>Compliance with Laws:</strong> Using the Service in compliance with all applicable
          local, state, national, and international laws and regulations, including tax laws,
          anti-bribery laws, and data protection regulations.
        </li>
        <li>
          <strong>Company Policy Compliance:</strong> Adhering to your organization&apos;s expense
          policies, approval workflows, and spending limits as configured in the platform.
        </li>
        <li>
          <strong>Accurate Categorization:</strong> Reviewing and correcting AI-generated expense
          categorizations to ensure accuracy.
        </li>
      </ul>

      {/* 5. Company Responsibilities */}
      <h2>5. Company Responsibilities</h2>
      <p>
        Organizations that register for Company accounts (&ldquo;Customers&rdquo;) are responsible for:
      </p>
      <ul>
        <li>
          Designating authorized administrators who can manage user roles, permissions, and
          company settings.
        </li>
        <li>
          Establishing and maintaining internal expense policies that comply with applicable laws.
        </li>
        <li>
          Ensuring that all employee users under the Company account are aware of and comply
          with these Terms.
        </li>
        <li>
          Configuring appropriate approval workflows and spending limits for their organization.
        </li>
        <li>
          Paying applicable fees for paid subscription tiers in accordance with the payment
          terms agreed upon at registration.
        </li>
      </ul>

      {/* 6. Platform Responsibilities & Limitations */}
      <h2>6. Platform Responsibilities &amp; Limitations</h2>
      <p>
        {APP_SHORT_NAME} is committed to providing a reliable, secure, and available Service.
        However, you acknowledge and agree that:
      </p>
      <ul>
        <li>
          We strive for 99.9% uptime for paid tiers (Business and Enterprise), but we do not
          guarantee uninterrupted or error-free operation of the Service.
        </li>
        <li>
          We perform scheduled maintenance, which may result in temporary service interruptions.
          We will provide advance notice for planned maintenance where reasonably practicable.
        </li>
        <li>
          The Service relies on third-party infrastructure providers including Firebase (authentication
          and database), Cloudinary (media storage and processing), Vercel (frontend hosting), and
          Render (backend services). We are not responsible for outages or failures of these
          third-party services beyond our reasonable control.
        </li>
        <li>
          We implement industry-standard security measures as described in our{' '}
          <Link href="/security">Security Policy</Link>, but no system is completely secure.
        </li>
      </ul>

      {/* 7. AI Services & Limitations */}
      <h2>7. AI Services &amp; Limitations</h2>
      <p>
        {APP_SHORT_NAME} incorporates artificial intelligence features to enhance expense management.
        These features are powered by OpenRouter AI (GPT-3.5-turbo) and include:
      </p>
      <ul>
        <li>Automated expense categorization</li>
        <li>Anomaly and fraud detection</li>
        <li>Financial insights and predictions</li>
        <li>Health score calculation</li>
        <li>AI chat assistant for expense queries</li>
        <li>Receipt OCR via Tesseract.js and Cloudinary AI</li>
      </ul>

      <h3>7.1 AI Limitations</h3>
      <p>You acknowledge and agree that:</p>
      <ul>
        <li>
          <strong>No Financial Advice:</strong> AI-generated insights, predictions, and
          recommendations do not constitute financial, investment, or tax advice. You should
          consult qualified financial professionals for such advice.
        </li>
        <li>
          <strong>No Legal Advice:</strong> AI outputs, including policy compliance checks and
          categorization suggestions, do not constitute legal advice. You should consult
          qualified legal counsel for compliance matters.
        </li>
        <li>
          <strong>AI May Make Errors:</strong> The AI categorization system may occasionally
          misclassify expenses. Users must review and verify all AI-generated categorizations
          and data extractions before submission.
        </li>
        <li>
          <strong>No Guarantee of Accuracy:</strong> While we continuously improve our AI models,
          we do not guarantee the accuracy, completeness, or reliability of AI-generated content.
        </li>
        <li>
          <strong>Human Oversight Required:</strong> AI features are designed to assist, not
          replace, human judgment. All AI-generated outputs should be reviewed by authorized
          personnel before making financial decisions.
        </li>
      </ul>

      <h3>7.2 AI Data Processing</h3>
      <p>
        When you use AI features, expense descriptions, categories, amounts, and chat messages
        may be processed through OpenRouter AI. For details on how data is handled in AI
        processing, see our <Link href="/ai-policy">AI Usage Policy</Link>.
      </p>

      {/* 8. Data Processing & Storage */}
      <h2>8. Data Processing &amp; Storage</h2>
      <p>
        {APP_SHORT_NAME} processes and stores data using the following infrastructure:
      </p>
      <ul>
        <li>
          <strong>Authentication:</strong> Firebase Authentication manages user identities and
          session tokens.
        </li>
        <li>
          <strong>Database:</strong> Cloud Firestore (Firebase) stores expense records, user
          profiles, company configurations, approval chains, and all structured data.
        </li>
        <li>
          <strong>Media Storage:</strong> Cloudinary stores uploaded receipts, invoices, and
          other media files, including performing OCR processing and image transformations.
        </li>
        <li>
          <strong>AI Processing:</strong> OpenRouter AI processes expense data for categorization,
          insights, and chat features. Data sent to OpenRouter is handled in accordance with
          their privacy commitments.
        </li>
        <li>
          <strong>Hosting:</strong> Frontend assets are hosted on Vercel; backend services are
          hosted on Render.
        </li>
      </ul>
      <p>
        We implement appropriate technical and organizational measures to protect your data,
        as described in our <Link href="/security">Security Policy</Link> and{' '}
        <Link href="/dpa">Data Processing Agreement</Link>.
      </p>

      {/* 9. Intellectual Property */}
      <h2>9. Intellectual Property</h2>
      <h3>9.1 Our Intellectual Property</h3>
      <p>
        The Service, including its source code, database structure, AI models, algorithms, user
        interface designs, logos, trademarks, and documentation, is the intellectual property of
        {APP_SHORT_NAME} and its licensors. You may not copy, modify, reverse engineer,
        decompile, or create derivative works of the Service without our express written permission.
      </p>

      <h3>9.2 Your Content</h3>
      <p>
        You retain all ownership rights to the expense data, receipts, invoices, and other content
        you submit to the Service (&ldquo;Your Content&rdquo;). By submitting Your Content, you grant
        {APP_SHORT_NAME} a worldwide, non-exclusive, royalty-free license to process, store,
        transmit, and display Your Content solely for the purpose of providing the Service to you.
      </p>

      <h3>9.3 Feedback</h3>
      <p>
        If you provide us with suggestions, enhancement requests, or other feedback about the
        Service, we may use that feedback without obligation to you.
      </p>

      {/* 10. Acceptable Use Policy */}
      <h2>10. Acceptable Use Policy</h2>
      <p>
        Your use of the Service is subject to our <Link href="/acceptable-use">Acceptable Use Policy</Link>.
        By using the Service, you agree not to:
      </p>
      <ul>
        <li>Submit fraudulent, fictitious, or inflated expense claims.</li>
        <li>Upload altered, forged, or otherwise invalid receipts or invoices.</li>
        <li>Use the Service for money laundering, tax evasion, or any illegal purpose.</li>
        <li>Attempt to access another user&apos;s account or data without authorization.</li>
        <li>Interfere with the operation of the Service, including attempting to bypass rate limits or security controls.</li>
        <li>Reverse engineer, decompile, or extract the source code or AI models.</li>
        <li>Use automated scripts, bots, or scrapers to extract data from the Service.</li>
        <li>Submit content that is defamatory, harassing, or otherwise objectionable.</li>
      </ul>

      {/* 11. Prohibited Activities */}
      <h2>11. Prohibited Activities</h2>
      <p>
        In addition to the Acceptable Use restrictions, the following activities are strictly prohibited:
      </p>
      <ul>
        <li>
          <strong>Unauthorized Access:</strong> Attempting to gain unauthorized access to any part
          of the Service, other user accounts, or connected systems.
        </li>
        <li>
          <strong>Security Violations:</strong> Attempting to probe, scan, or test the vulnerability
          of the Service or its infrastructure without prior written authorization.
        </li>
        <li>
          <strong>Data Theft:</strong> Systematically extracting data from the Service to create
          competing products or services.
        </li>
        <li>
          <strong>Malicious Code:</strong> Introducing viruses, worms, malware, or other harmful
          code to the Service.
        </li>
        <li>
          <strong>Abuse of AI Features:</strong> Attempting to manipulate or deceive the AI
          categorization system, submitting intentionally misleading data to skew AI outputs,
          or using the AI chat for purposes unrelated to expense management.
        </li>
      </ul>

      {/* 12. Fees & Payment */}
      <h2>12. Fees &amp; Payment</h2>
      <h3>12.1 Free Tier</h3>
      <p>
        {APP_SHORT_NAME} offers a Free tier that includes limited features: up to 5 users,
        basic expense tracking, receipt capture, and email support. The Free tier is provided
        at no cost, subject to the usage limits described on our pricing page.
      </p>

      <h3>12.2 Paid Subscriptions</h3>
      <p>
        Paid subscription tiers (Starter, Business, and Enterprise) are billed monthly or annually
        as selected during registration. Fees are non-refundable except as expressly stated in our{' '}
        <Link href="/refund">Refund Policy</Link>.
      </p>

      <h3>12.3 Payment Terms</h3>
      <p>
        Payments are processed through our payment processor. By providing payment information,
        you represent that you are authorized to use the payment method. Late payments may result
        in service suspension.
      </p>

      <h3>12.4 Tax</h3>
      <p>
        You are responsible for all applicable taxes, duties, and government charges associated
        with your use of the Service.
      </p>

      {/* 13. Termination & Suspension */}
      <h2>13. Termination &amp; Suspension</h2>
      <h3>13.1 Termination by You</h3>
      <p>
        You may terminate your account at any time through the account settings page. For Company
        accounts, the Company administrator may delete the entire workspace. Upon termination,
        your data will be handled in accordance with our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h3>13.2 Suspension by Us</h3>
      <p>
        We may suspend or terminate your access to the Service if:
      </p>
      <ul>
        <li>You breach these Terms or the Acceptable Use Policy.</li>
        <li>Your payment is past due and remains unpaid for 30 days.</li>
        <li>We are required to do so by law or regulatory authority.</li>
        <li>Your use of the Service poses a security risk to the platform or other users.</li>
      </ul>

      <h3>13.3 Effect of Termination</h3>
      <p>
        Upon termination, your right to access the Service ceases immediately. We will retain
        your data for 90 days following termination to allow for data export. After this period,
        your data will be permanently deleted in accordance with our data retention policies.
      </p>

      {/* 14. Limitation of Liability */}
      <h2>14. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law:
      </p>
      <ul>
        <li>
          {APP_SHORT_NAME} and its affiliates, officers, employees, and licensors shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages,
          including but not limited to loss of profits, data, use, goodwill, or other intangible
          losses, arising out of or related to your use of the Service.
        </li>
        <li>
          Our total liability for any claim arising out of or relating to these Terms or the
          Service shall not exceed the amount paid by you to us in the 12 months preceding the claim.
        </li>
        <li>
          We are not liable for errors or omissions in AI-generated categorizations, insights,
          or data extractions.
        </li>
        <li>
          We are not liable for losses resulting from unauthorized access to your account due
          to your failure to maintain adequate security measures.
        </li>
      </ul>

      {/* 15. Disclaimer of Warranties */}
      <h2>15. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS.
        {APP_SHORT_NAME} MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
        INCLUDING BUT NOT LIMITED TO:
      </p>
      <ul>
        <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement.</li>
        <li>That the Service will be uninterrupted, timely, secure, or error-free.</li>
        <li>That AI-generated categorizations, insights, or data extractions will be accurate or reliable.</li>
        <li>That the Service will meet your specific expense management or compliance requirements.</li>
      </ul>

      {/* 16. Indemnification */}
      <h2>16. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless {APP_SHORT_NAME}, its affiliates,
        officers, directors, employees, and agents from and against any claims, damages, losses,
        liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of
        or related to:
      </p>
      <ul>
        <li>Your use of the Service in violation of these Terms.</li>
        <li>Your violation of any applicable law or regulation.</li>
        <li>Your Content, including any claims that Your Content infringes the rights of a third party.</li>
        <li>Any dispute between you and another user of the Service.</li>
      </ul>

      {/* 17. Governing Law */}
      <h2>17. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the State
        of Delaware, United States, without regard to its conflict of law principles. The United
        Nations Convention on Contracts for the International Sale of Goods shall not apply.
      </p>
      <p>
        Any disputes arising under these Terms shall be resolved exclusively in the state or
        federal courts located in Wilmington, Delaware. You consent to the personal jurisdiction
        of these courts.
      </p>

      {/* 18. Changes to Terms */}
      <h2>18. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will notify you of material
        changes by:
      </p>
      <ul>
        <li>Posting the updated Terms on this page with a new &ldquo;Last Updated&rdquo; date.</li>
        <li>Sending an email notification to the registered email address (for Company account administrators).</li>
        <li>Displaying a notice within the Service upon login.</li>
      </ul>
      <p>
        If you continue to use the Service after the revised Terms become effective, you agree
        to be bound by the updated Terms. If you do not agree to the changes, you must stop
        using the Service and terminate your account.
      </p>

      {/* 19. Contact Information */}
      <h2>19. Contact Information</h2>
      <p>
        If you have any questions about these Terms, please contact us at:
      </p>
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Email:</strong>{' '}
            <a href="mailto:legal@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              legal@finflow.ai
            </a>
          </li>
          <li>
            <strong>Legal Notices:</strong> FinFlow AI Inc., 251 Little Falls Drive, Wilmington,
            DE 19808, United States
          </li>
          <li>
            <strong>Data Protection:</strong>{' '}
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
        </ul>
      </div>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        These Terms of Service were last updated on {lastUpdated}. Previous versions of these
        Terms are available upon request.
      </p>
    </article>
  )
}