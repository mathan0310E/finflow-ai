import type { Metadata } from 'next'
import Link from 'next/link'
import { Accessibility, Eye, MousePointerClick, Keyboard, MessageSquare } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: `${APP_NAME} Enterprise Accessibility Statement. Our commitment to WCAG AA compliance and inclusive design.`,
}

const lastUpdated = 'July 15, 2025'

export default function AccessibilityPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <Accessibility className="h-3.5 w-3.5" />
          Accessibility Statement
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Accessibility Statement
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <p className="lead">
        {APP_NAME} Enterprise (&ldquo;{APP_SHORT_NAME}&rdquo;) is committed to ensuring digital
        accessibility for all users, regardless of ability. We believe that everyone should be
        able to manage expenses effectively and participate fully in the financial workflows
        of their organization. This accessibility statement reflects our ongoing efforts to
        make the platform accessible, usable, and inclusive.
      </p>

      <hr />

      {/* 1. Compliance Target */}
      <h2>1. Compliance Target</h2>
      <p>
        Our goal is to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1
        Level AA</strong> standards, published by the World Wide Web Consortium (W3C). WCAG 2.1
        Level AA is the internationally recognized benchmark for web accessibility, encompassing:
      </p>
      <ul>
        <li>
          <strong>Perceivable:</strong> Information and user interface components must be
          presentable to users in ways they can perceive.
        </li>
        <li>
          <strong>Operable:</strong> User interface components and navigation must be operable
          by all users.
        </li>
        <li>
          <strong>Understandable:</strong> Information and the operation of the user interface
          must be understandable.
        </li>
        <li>
          <strong>Robust:</strong> Content must be robust enough to be interpreted by a wide
          variety of user agents, including assistive technologies.
        </li>
      </ul>
      <p>
        We are actively working to achieve and maintain WCAG 2.1 Level AA conformance for the
        entire platform. Our current compliance status is being assessed through automated
        testing tools and manual audits. We aim for full conformance by Q2 2026.
      </p>

      {/* 2. Accessibility Features */}
      <h2>2. Accessibility Features</h2>
      <p>
        The {APP_SHORT_NAME} platform incorporates the following accessibility features:
      </p>

      <div className="not-prose grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Eye className="h-4 w-4 text-blue-500" />
            Visual Design
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            <li>Sufficient color contrast ratios meeting WCAG AA standards</li>
            <li>Dark mode support for reduced eye strain</li>
            <li>Scalable text that can be resized up to 200% without loss of functionality</li>
            <li>Clear visual focus indicators on all interactive elements</li>
            <li>Information not conveyed by color alone (supplementary indicators provided)</li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Keyboard className="h-4 w-4 text-green-500" />
            Keyboard Navigation
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            <li>Full keyboard navigation support for all interactive elements</li>
            <li>Logical tab order matching visual layout</li>
            <li>Skip-to-content links for efficient navigation</li>
            <li>All dropdown menus and dialogs operable by keyboard</li>
            <li>Keyboard shortcuts for common actions</li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <MousePointerClick className="h-4 w-4 text-purple-500" />
            Screen Reader Support
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            <li>Semantic HTML structure with proper heading hierarchy</li>
            <li>ARIA labels and roles on all custom interactive components</li>
            <li>Descriptive alt text on all meaningful images and icons</li>
            <li>Live regions for dynamic content updates (notifications, status changes)</li>
            <li>Form inputs with programmatically associated labels</li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <MessageSquare className="h-4 w-4 text-orange-500" />
            Content &amp; Interaction
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            <li>Clear, predictable navigation patterns</li>
            <li>Error messages with suggestions for correction</li>
            <li>Form validation with descriptive error messages</li>
            <li>Progress indicators for multi-step processes (onboarding wizard)</li>
            <li>Meaningful link text (no &ldquo;click here&rdquo; links)</li>
          </ul>
        </div>
      </div>

      {/* 3. Known Limitations */}
      <h2>3. Known Limitations</h2>
      <p>
        We are actively working to address the following known accessibility issues. If you
        encounter any of these limitations, please let us know so we can prioritize improvements:
      </p>
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Issue</th>
            <th>Status</th>
            <th>Target Resolution</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Data Visualization Charts</strong></td>
            <td>Some chart libraries may not provide full screen reader support for complex data series</td>
            <td>In progress</td>
            <td>Q1 2026</td>
          </tr>
          <tr>
            <td><strong>Drag-and-Drop Receipt Upload</strong></td>
            <td>Drag-and-drop zones may not be fully keyboard accessible</td>
            <td>Planned</td>
            <td>Q4 2025</td>
          </tr>
          <tr>
            <td><strong>AI Chat Interface</strong></td>
            <td>Real-time chat updates may not be announced by screen readers consistently</td>
            <td>Under investigation</td>
            <td>Q1 2026</td>
          </tr>
          <tr>
            <td><strong>Third-Party Components</strong></td>
            <td>Some third-party UI libraries may have varying levels of accessibility support</td>
            <td>Continuous improvement</td>
            <td>Ongoing</td>
          </tr>
        </tbody>
      </table>

      {/* 4. Testing and Evaluation */}
      <h2>4. Testing and Evaluation</h2>
      <p>
        We evaluate the accessibility of the platform through:
      </p>
      <ul>
        <li>
          <strong>Automated Testing:</strong> We use axe-core, Lighthouse, and WAVE tools to
          automatically scan for accessibility violations on every deployment.
        </li>
        <li>
          <strong>Manual Audits:</strong> Our development team conducts periodic manual
          accessibility audits using screen readers (NVDA, VoiceOver) and keyboard-only navigation.
        </li>
        <li>
          <strong>User Testing:</strong> We engage with users with disabilities to gather
          real-world feedback and identify barriers.
        </li>
        <li>
          <strong>Peer Reviews:</strong> Accessibility considerations are integrated into our
          code review process for all new features and components.
        </li>
      </ul>

      {/* 5. Feedback Mechanism */}
      <h2>5. Feedback Mechanism</h2>
      <p>
        We welcome your feedback on the accessibility of the {APP_SHORT_NAME} platform. If you
        encounter accessibility barriers or have suggestions for improvement, please contact us:
      </p>
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Accessibility Email:</strong>{' '}
            <a href="mailto:accessibility@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              accessibility@finflow.ai
            </a>
          </li>
          <li>
            <strong>Phone:</strong> +1 (302) 555-0198 (assistance available during business hours, Eastern Time)
          </li>
          <li>
            <strong>In-App:</strong> Use the feedback option in the Help menu within the dashboard.
          </li>
        </ul>
      </div>
      <p>
        We aim to respond to accessibility feedback within 5 business days and to resolve
        reported issues within 30 days, depending on the complexity of the issue.
      </p>

      {/* 6. Third-Party Services */}
      <h2>6. Third-Party Services</h2>
      <p>
        The {APP_SHORT_NAME} platform integrates with third-party services that may have their
        own accessibility characteristics. These include:
      </p>
      <ul>
        <li><strong>Firebase Authentication</strong> &mdash; Google&apos;s sign-in interfaces</li>
        <li><strong>Cloudinary</strong> &mdash; Media upload and processing</li>
        <li><strong>Receipt Upload</strong> &mdash; File picker dialogs (browser-native)</li>
      </ul>
      <p>
        We encourage you to contact us if you experience accessibility issues with any
        third-party component integrated into the platform.
      </p>

      {/* 7. Ongoing Commitment */}
      <h2>7. Ongoing Commitment</h2>
      <p>
        Accessibility is an ongoing commitment, not a one-time project. We will:
      </p>
      <ul>
        <li>Continue to test and improve the accessibility of existing features.</li>
        <li>Ensure new features are designed and developed with accessibility in mind from the start.</li>
        <li>Provide accessibility training for our design and development teams.</li>
        <li>Update this statement annually and after significant platform changes.</li>
        <li>Work toward WCAG 2.2 compliance as standards evolve.</li>
      </ul>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        This Accessibility Statement was last updated on {lastUpdated}. We are committed to
        making {APP_SHORT_NAME} accessible to everyone. Your feedback helps us achieve this goal.
      </p>
    </article>
  )
}