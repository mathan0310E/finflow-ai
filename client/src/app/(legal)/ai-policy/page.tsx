import type { Metadata } from 'next'
import Link from 'next/link'
import { Brain, Sparkles, AlertTriangle, Eye, Shield, Cpu } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'AI Usage Policy',
  description: `${APP_NAME} Enterprise AI Usage Policy. How our AI features work, their limitations, and your responsibilities.`,
}

const lastUpdated = 'July 15, 2025'

export default function AiPolicyPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <Brain className="h-3.5 w-3.5" />
          AI Usage Policy
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          AI Usage Policy
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Last Updated: {lastUpdated}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Cpu className="h-3.5 w-3.5" />
            GPT-3.5-turbo
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Sparkles className="h-3.5 w-3.5" />
            OpenRouter AI
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Eye className="h-3.5 w-3.5" />
            Human Review Required
          </span>
        </div>
      </div>

      <p className="lead">
        {APP_NAME} Enterprise (&ldquo;{APP_SHORT_NAME}&rdquo;) integrates artificial intelligence
        capabilities to enhance expense management. This AI Usage Policy explains what AI features
        are available, how they work, their limitations, and your responsibilities when using
        AI-powered features. This policy supplements our{' '}
        <Link href="/terms">Terms of Service</Link> and{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <hr />

      {/* 1. AI Capabilities */}
      <h2>1. AI Capabilities</h2>
      <p>
        {APP_SHORT_NAME} leverages AI to provide the following features. These features are
        powered by OpenRouter AI (which provides access to GPT-3.5-turbo) and Tesseract.js for
        optical character recognition.
      </p>

      <div className="not-prose grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Sparkles className="h-4 w-4 text-blue-500" />
            AI Categorization
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Automatically suggests expense categories and subcategories based on expense titles,
            descriptions, vendor names, and amounts. The AI analyzes the context of each expense
            to recommend the most appropriate category from our 14 predefined categories, each
            with multiple subcategories.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Brain className="h-4 w-4 text-green-500" />
            Financial Insights
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Generates AI-powered insights about spending patterns, budget utilization, and
            expense trends. Identifies anomalies, unusual patterns, and potential cost-saving
            opportunities based on historical expense data.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Cpu className="h-4 w-4 text-purple-500" />
            AI Chat Assistant
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            An interactive AI chat assistant that answers questions about your expenses, helps
            you understand spending patterns, provides policy guidance, and assists with
            expense-related queries. The chat has context awareness of your expense data.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Shield className="h-4 w-4 text-red-500" />
            Anomaly Detection
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            AI-powered detection of unusual expense patterns, potential policy violations,
            duplicate submissions, and suspicious activity. Flags expenses that deviate from
            typical spending behavior for review.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Eye className="h-4 w-4 text-orange-500" />
            OCR Scanning
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Uses Tesseract.js and Cloudinary AI to extract text from uploaded receipt and invoice
            images. Extracts merchant name, date, total amount, tax, invoice number, and line
            items. Confidence scores are provided for all extracted data fields.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Health Score
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            AI-calculated financial health score for departments and companies based on budget
            adherence, expense consistency, policy compliance, approval efficiency, and
            reimbursement timeliness.
          </p>
        </div>
      </div>

      {/* 2. AI Limitations */}
      <h2>2. AI Limitations</h2>
      <p>
        While our AI features are designed to assist with expense management, they have important
        limitations that you must understand:
      </p>

      <h3>2.1 Not Financial Advice</h3>
      <p>
        <strong>AI-generated insights, predictions, and recommendations do not constitute
        financial, investment, tax, or accounting advice.</strong> The AI analyzes expense
        data to identify patterns and generate suggestions, but these outputs should not be
        relied upon as the sole basis for financial decisions. Always consult qualified
        financial professionals for:
      </p>
      <ul>
        <li>Tax preparation and filing decisions.</li>
        <li>Investment or budget allocation decisions.</li>
        <li>Financial planning or forecasting.</li>
        <li>Compliance with specific accounting standards (GAAP, IFRS, etc.).</li>
      </ul>

      <h3>2.2 Not Legal Advice</h3>
      <p>
        <strong>AI outputs, including policy compliance checks and regulatory suggestions,
        do not constitute legal advice.</strong> The AI&apos;s understanding of regulations and
        policies is based on its training data and may not reflect current laws or your
        specific jurisdiction. Always consult qualified legal counsel for:
      </p>
      <ul>
        <li>Tax law compliance and interpretation.</li>
        <li>Anti-corruption and anti-bribery compliance (FCPA, UK Bribery Act, etc.).</li>
        <li>Data protection and privacy compliance (GDPR, CCPA, etc.).</li>
        <li>Employment law and expense reimbursement regulations.</li>
      </ul>

      <h3>2.3 AI May Make Errors</h3>
      <p>
        The AI categorization and OCR systems are not infallible. You should be aware that:
      </p>
      <ul>
        <li>
          <strong>Categorization Errors:</strong> The AI may occasionally assign an incorrect
          category to an expense. For example, a client dinner expense might be categorized as
          &ldquo;Food&rdquo; when it should be categorized as &ldquo;Marketing &mdash; Client
          Entertainment.&rdquo;
        </li>
        <li>
          <strong>OCR Errors:</strong> The receipt OCR system may misread amounts, dates,
          merchant names, or other data from uploaded receipts, especially for receipts with
          poor image quality, unusual fonts, or damage.
        </li>
        <li>
          <strong>False Positives/Negatives:</strong> Anomaly detection may flag legitimate
          expenses as suspicious (false positive) or miss actual fraudulent activity (false
          negative).
        </li>
        <li>
          <strong>Context Limitations:</strong> The AI may not understand the full business
          context of an expense, leading to inappropriate categorizations or policy assessments.
        </li>
      </ul>

      <h3>2.4 No Guarantee of Accuracy</h3>
      <p>
        We continuously improve our AI models through training, fine-tuning, and feedback
        incorporation. However, we do not and cannot guarantee the accuracy, completeness,
        reliability, or fitness for purpose of any AI-generated content. AI outputs are
        provided &ldquo;as is&rdquo; with all faults.
      </p>

      {/* 3. Data Used by AI */}
      <h2>3. Data Used by AI</h2>
      <p>
        When you use AI features, the following data may be processed by the AI system:
      </p>
      <table>
        <thead>
          <tr>
            <th>AI Feature</th>
            <th>Data Sent to AI</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Categorization</strong></td>
            <td>Expense title, description, vendor name, amount, currency, user&apos;s previous category preferences</td>
            <td>To suggest the most appropriate expense category</td>
          </tr>
          <tr>
            <td><strong>Financial Insights</strong></td>
            <td>Aggregated expense data (dates, amounts, categories, departments, vendors) over a time period</td>
            <td>To identify trends, patterns, and spending insights</td>
          </tr>
          <tr>
            <td><strong>AI Chat</strong></td>
            <td>Chat messages, user&apos;s expense data relevant to the query, company context</td>
            <td>To answer questions and provide expense-related assistance</td>
          </tr>
          <tr>
            <td><strong>Anomaly Detection</strong></td>
            <td>Expense details (amounts, frequencies, categories, vendors) compared to historical patterns</td>
            <td>To flag unusual or suspicious expense submissions</td>
          </tr>
          <tr>
            <td><strong>OCR</strong></td>
            <td>Receipt/invoice images (processed locally by Tesseract.js or via Cloudinary AI)</td>
            <td>To extract text and structured data from uploaded documents</td>
          </tr>
          <tr>
            <td><strong>Health Score</strong></td>
            <td>Aggregated metrics (budget adherence, approval times, policy compliance rates)</td>
            <td>To calculate a composite financial health score</td>
          </tr>
        </tbody>
      </table>

      <h3>3.1 Data Minimization</h3>
      <p>
        We follow data minimization principles. Only the minimum data required for each AI
        function is sent to the AI model. Personal identifiers (full names, email addresses)
        are not sent to OpenRouter AI unless necessary for the specific AI feature being used.
        Receipt images are processed through Cloudinary&apos;s OCR service or Tesseract.js and
        are not sent to OpenRouter.
      </p>

      {/* 4. Human Review */}
      <h2>4. Human Review Requirement</h2>
      <p>
        <strong>All AI-generated outputs must be reviewed and verified by a human before
        being relied upon.</strong> This is a fundamental requirement of our AI features:
      </p>
      <ul>
        <li>
          <strong>AI Categorizations:</strong> Users must review and confirm or correct each
          AI-suggested category before submitting an expense. Category overrides are tracked
          to improve model accuracy.
        </li>
        <li>
          <strong>OCR Data:</strong> Extracted receipt data should be compared against the
          original receipt image before approval. Any discrepancies should be corrected manually.
        </li>
        <li>
          <strong>AI Insights:</strong> Insights and recommendations provided by the AI should
          be evaluated critically by authorized personnel before being used for decision-making.
        </li>
        <li>
          <strong>Anomaly Flags:</strong> Flagged expenses require human investigation before
          any action (approval, rejection, or escalation) is taken.
        </li>
        <li>
          <strong>Chat Responses:</strong> Information provided by the AI chat assistant should
          be verified against official sources before being relied upon.
        </li>
      </ul>

      {/* 5. Opt-Out Options */}
      <h2>5. Opt-Out Options</h2>
      <p>
        We understand that some organizations may prefer to limit AI usage. {APP_SHORT_NAME}
        provides the following opt-out options:
      </p>

      <h3>5.1 Company-Level Controls</h3>
      <p>
        Company administrators can configure AI feature availability in the Company Settings:
      </p>
      <ul>
        <li>
          <strong>Disable AI Categorization:</strong> Turn off AI-powered category suggestions.
          Categories will need to be selected manually.
        </li>
        <li>
          <strong>Disable AI Insights:</strong> Turn off AI-generated financial insights and
          predictions.
        </li>
        <li>
          <strong>Disable AI Chat:</strong> Remove the AI chat assistant from the dashboard.
        </li>
        <li>
          <strong>Disable OCR:</strong> Turn off automatic OCR processing of receipt images.
          Receipt data must be entered manually.
        </li>
      </ul>

      <h3>5.2 Enterprise Tier</h3>
      <p>
        Enterprise customers can request a dedicated AI configuration with enhanced privacy
        controls, including the option to process AI requests in a isolated environment with
        no data retention by the AI provider.
      </p>

      {/* 6. Model Information */}
      <h2>6. Model Information</h2>
      <p>
        The AI features in {APP_SHORT_NAME} utilize the following models and services:
      </p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Model</th>
            <th>Use Case</th>
            <th>Data Handling</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>OpenRouter AI</strong></td>
            <td>GPT-3.5-turbo</td>
            <td>Categorization, insights, chat, anomaly detection, health score</td>
            <td>Data is processed in memory; not used for model training. OpenAI&apos;s API data usage policies apply.</td>
          </tr>
          <tr>
            <td><strong>Cloudinary AI</strong></td>
            <td>Cloudinary OCR</td>
            <td>Receipt and invoice text extraction</td>
            <td>Images are processed and stored; OCR results are returned to {APP_SHORT_NAME}.</td>
          </tr>
          <tr>
            <td><strong>Tesseract.js</strong></td>
            <td>v5 (LSTM-based)</td>
            <td>Client-side receipt OCR processing</td>
            <td>Processing occurs in the browser. Images are not sent to external servers.</td>
          </tr>
        </tbody>
      </table>
      <p>
        We select AI models based on accuracy, speed, cost-effectiveness, and privacy
        considerations. We monitor model performance and may update the models used as better
        options become available.
      </p>

      {/* 7. Data Privacy in AI Processing */}
      <h2>7. Data Privacy in AI Processing</h2>
      <p>
        We are committed to protecting your data when using AI features:
      </p>
      <ul>
        <li>
          <strong>No Training on Your Data:</strong> Data sent to OpenRouter AI is not used
          to train or improve OpenAI&apos;s general models. We have configured our API usage
          to prohibit data retention and model training.
        </li>
        <li>
          <strong>Data in Transit:</strong> All data sent to AI providers is encrypted using
          TLS 1.3.
        </li>
        <li>
          <strong>Minimal Data Sharing:</strong> Only the minimum data required for each AI
          function is transmitted to external AI providers.
        </li>
        <li>
          <strong>Local Processing:</strong> Client-side OCR via Tesseract.js processes receipt
          images entirely within your browser. No image data is sent to external servers for
          this processing method.
        </li>
        <li>
          <strong>Company Isolation:</strong> AI processing contexts are isolated per company
          tenant. Data from one company is never mixed with data from another company in AI
          processing.
        </li>
        <li>
          <strong>Audit Trail:</strong> All AI interactions are logged for audit purposes,
          including the data sent and the AI response received.
        </li>
      </ul>

      {/* 8. Contact */}
      <h2>8. Contact</h2>
      <p>
        If you have questions about our AI features or this policy, please contact us at{' '}
        <a href="mailto:ai@finflow.ai">ai@finflow.ai</a>.
      </p>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        This AI Usage Policy was last updated on {lastUpdated}. We review and update this policy
        as our AI capabilities evolve.
      </p>
    </article>
  )
}