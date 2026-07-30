import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Scale, HelpCircle, Shield, Wifi } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: `${APP_NAME} Enterprise Disclaimer. Limitations of liability for financial advice, AI accuracy, platform availability, and third-party services.`,
}

const lastUpdated = 'July 15, 2025'

export default function DisclaimerPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          Disclaimer
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Disclaimer
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <p className="lead">
        This disclaimer (&ldquo;Disclaimer&rdquo;) governs your use of the {APP_NAME} Enterprise
        (&ldquo;{APP_SHORT_NAME}&rdquo;) platform, website, mobile application, and related
        services (the &ldquo;Service&rdquo;). Please read this Disclaimer carefully. By using
        the Service, you acknowledge and agree to the terms of this Disclaimer. If you do not
        agree, you must not use the Service.
      </p>
      <p>
        This Disclaimer supplements our <Link href="/terms">Terms of Service</Link> and other
        legal policies. In the event of a conflict, the Terms of Service shall prevail.
      </p>

      <hr />

      {/* 1. No Financial Advice */}
      <h2>1. No Financial Advice</h2>
      <div className="not-prose mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
        <div className="flex items-start gap-3">
          <Scale className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {APP_SHORT_NAME} does not provide financial advice.
            </p>
          </div>
        </div>
      </div>
      <p>
        The Service, including all AI-generated insights, categorizations, predictions, health
        scores, and recommendations, is provided as an expense management tool only. It is not
        intended to constitute, and should not be construed as, financial advice, investment
        advice, tax advice, accounting advice, or any other form of professional financial
        guidance.
      </p>
      <p>
        Specifically, the following outputs from the Service are not financial advice:
      </p>
      <ul>
        <li>AI-generated expense categorizations and subcategory suggestions.</li>
        <li>Budget utilization metrics and spending analyses.</li>
        <li>Financial health scores and trend predictions.</li>
        <li>Policy compliance assessments and anomaly flags.</li>
        <li>Any recommendations or insights provided by the AI chat assistant.</li>
      </ul>
      <p>
        <strong>You should consult a qualified financial advisor, accountant, or tax professional
        for advice specific to your financial situation.</strong> Decisions based on information
        provided by the Service are your sole responsibility.
      </p>

      {/* 2. No Accounting Advice */}
      <h2>2. No Accounting Advice</h2>
      <p>
        {APP_SHORT_NAME} is an expense management platform and is not a substitute for professional
        accounting services. The Service does not:
      </p>
      <ul>
        <li>Prepare financial statements or balance sheets in accordance with GAAP, IFRS, or
        other accounting standards.</li>
        <li>Provide audited or certified financial records.</li>
        <li>Ensure compliance with specific tax filing requirements in your jurisdiction.</li>
        <li>Calculate tax liabilities, deductions, or credits.</li>
        <li>Generate official accounting reports suitable for regulatory filing.</li>
      </ul>
      <p>
        While the Service provides tools and reports to assist with expense tracking and
        categorization, all financial records should be reviewed by a qualified accountant
        or financial professional before being used for accounting, tax filing, or regulatory
        compliance purposes.
      </p>

      {/* 3. AI Accuracy Disclaimer */}
      <h2>3. AI Accuracy Disclaimer</h2>
      <div className="not-prose mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
        <div className="flex items-start gap-3">
          <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              AI-powered features may produce incorrect or incomplete results.
            </p>
          </div>
        </div>
      </div>
      <p>
        {APP_SHORT_NAME} incorporates artificial intelligence features, including automated
        expense categorization via OpenRouter AI (GPT-3.5-turbo), optical character recognition
        via Tesseract.js and Cloudinary AI, and AI-generated financial insights. While we strive
        for accuracy, we make no guarantees regarding the accuracy, completeness, reliability,
        or fitness for purpose of AI-generated outputs.
      </p>
      <p>You acknowledge that:</p>
      <ul>
        <li>
          <strong>AI Categorization:</strong> Suggested categories may be incorrect or
          inappropriate for your specific context. Always verify and correct AI-generated
          categories.
        </li>
        <li>
          <strong>OCR Extraction:</strong> Data extracted from receipts and invoices may contain
          errors, particularly for low-quality images, handwritten text, unusual formats, or
          receipts in languages other than English.
        </li>
        <li>
          <strong>AI Insights:</strong> Financial insights, trend analyses, and predictions
          are based on available data and statistical models. They may not account for all
          relevant factors and should not be solely relied upon for decision-making.
        </li>
        <li>
          <strong>Anomaly Detection:</strong> Flagged anomalies may be false positives, and
          genuine issues may go undetected. Human review of all flags is required.
        </li>
        <li>
          <strong>Health Score:</strong> The AI-calculated health score is a simplified
          composite metric and does not represent a comprehensive financial assessment.
        </li>
      </ul>
      <p>
        For more information about our AI features and their limitations, please see our{' '}
        <Link href="/ai-policy">AI Usage Policy</Link>.
      </p>

      {/* 4. Platform Availability Disclaimer */}
      <h2>4. Platform Availability Disclaimer</h2>
      <div className="not-prose mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
        <div className="flex items-start gap-3">
          <Wifi className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo;
            </p>
          </div>
        </div>
      </div>
      <p>
        {APP_SHORT_NAME} strives to maintain high availability and performance of the Service.
        However, we do not warrant that:
      </p>
      <ul>
        <li>The Service will be uninterrupted, timely, secure, or error-free.</li>
        <li>Defects or errors in the Service will be corrected promptly or at all.</li>
        <li>The Service will meet your specific requirements or expectations.</li>
        <li>Data stored on the Service will be free from loss, corruption, or unauthorized access.</li>
      </ul>
      <p>
        The Service may be temporarily unavailable due to:
      </p>
      <ul>
        <li>Scheduled maintenance, for which we will provide advance notice where practical.</li>
        <li>Unscheduled emergency maintenance to address security vulnerabilities or critical issues.</li>
        <li>Outages or failures of third-party infrastructure providers (Firebase, Vercel, Render, Cloudinary).</li>
        <li>Events beyond our reasonable control, including natural disasters, cyberattacks, power outages, or internet service disruptions.</li>
      </ul>
      <p>
        For paid subscription tiers, service credits may be available for extended outages as
        described in our <Link href="/refund">Refund Policy</Link>.
      </p>

      {/* 5. Third-Party Services Disclaimer */}
      <h2>5. Third-Party Services Disclaimer</h2>
      <p>
        {APP_SHORT_NAME} integrates with third-party services and infrastructure to provide the
        Service. These include:
      </p>
      <ul>
        <li><strong>Firebase (Google)</strong> &mdash; Authentication and database services.</li>
        <li><strong>Cloudinary</strong> &mdash; Media storage, processing, and OCR.</li>
        <li><strong>OpenRouter AI</strong> &mdash; AI model API for categorization and insights.</li>
        <li><strong>Vercel</strong> &mdash; Frontend hosting and CDN.</li>
        <li><strong>Render</strong> &mdash; Backend API hosting.</li>
        <li><strong>Stripe</strong> &mdash; Payment processing.</li>
        <li><strong>Google Analytics</strong> &mdash; Usage analytics.</li>
      </ul>
      <p>
        We do not control, and are not responsible for, the availability, security, performance,
        or data handling practices of these third-party services. Each service is governed by
        its own terms of service, privacy policy, and security practices. We encourage you to
        review the policies of these third-party providers.
      </p>
      <p>
        We select our third-party providers carefully and contractually require them to maintain
        appropriate security and data protection standards. However, we make no representations
        or warranties regarding third-party services and disclaim all liability arising from
        your use of or reliance on these services.
      </p>

      {/* 6. No Professional Relationship */}
      <h2>6. No Professional Relationship</h2>
      <p>
        Use of the Service does not create a professional advisory relationship between you
        and {APP_SHORT_NAME}. The Service is a software platform that provides tools for expense
        management. It does not establish:
      </p>
      <ul>
        <li>An accountant-client relationship.</li>
        <li>A financial advisor-client relationship.</li>
        <li>An attorney-client relationship.</li>
        <li>A tax preparer-client relationship.</li>
        <li>Any other fiduciary or professional advisory relationship.</li>
      </ul>

      {/* 7. Compliance Disclaimer */}
      <h2>7. Compliance Disclaimer</h2>
      <p>
        While {APP_SHORT_NAME} provides features to assist with expense policy compliance and
        regulatory adherence, we do not guarantee that use of the Service will ensure compliance
        with any specific laws, regulations, or industry standards. Compliance obligations vary
        by jurisdiction, industry, and organizational structure, and may change over time.
      </p>
      <p>
        You are solely responsible for:
      </p>
      <ul>
        <li>Ensuring that your use of the Service complies with applicable laws and regulations.</li>
        <li>Configuring the Service in accordance with your organization&apos;s compliance requirements.</li>
        <li>Verifying that AI-generated policy compliance assessments are accurate and complete.</li>
        <li>Maintaining appropriate records and documentation as required by tax authorities or regulators.</li>
      </ul>

      {/* 8. Contact */}
      <h2>8. Contact</h2>
      <p>
        If you have questions about this Disclaimer, please contact us at{' '}
        <a href="mailto:legal@finflow.ai">legal@finflow.ai</a>.
      </p>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        This Disclaimer was last updated on {lastUpdated}. We review and update this Disclaimer
        periodically to reflect changes in our Service and applicable laws.
      </p>
    </article>
  )
}