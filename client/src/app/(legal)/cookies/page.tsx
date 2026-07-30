import type { Metadata } from 'next'
import Link from 'next/link'
import { Cookie, Settings, Shield, Info } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: `Cookie Policy for ${APP_NAME} Enterprise. Learn about the cookies we use and how to manage them.`,
}

const lastUpdated = 'July 15, 2025'

export default function CookiesPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <Cookie className="h-3.5 w-3.5" />
          Cookie Policy
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Cookie Policy
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <p className="lead">
        This Cookie Policy explains how {APP_NAME} Enterprise (&ldquo;{APP_SHORT_NAME},&rdquo; &ldquo;we,&rdquo;
        &ldquo;us,&rdquo; &ldquo;our&rdquo;) uses cookies and similar tracking technologies on our platform,
        website, and related services (collectively, the &ldquo;Service&rdquo;). This policy is designed to
        help you understand what cookies are, why we use them, and how you can control their use.
      </p>
      <p>
        This policy should be read together with our{' '}
        <Link href="/privacy">Privacy Policy</Link>, which provides more detailed information
        about how we collect, use, and protect your personal data.
      </p>

      <hr />

      {/* 1. What Are Cookies */}
      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files that are placed on your device (computer, tablet, or mobile
        phone) when you visit a website or use an online service. They are widely used to make
        websites work more efficiently, provide a better user experience, and give website owners
        information about how their site is being used.
      </p>
      <p>
        Cookies can be &ldquo;first-party&rdquo; (set by us) or &ldquo;third-party&rdquo; (set by
        services we integrate with). They can be &ldquo;session&rdquo; cookies (which expire when
        you close your browser) or &ldquo;persistent&rdquo; cookies (which remain on your device
        for a set period or until you delete them).
      </p>
      <p>
        In addition to cookies, we may use similar technologies such as local storage, session
        storage, and service worker caches to enhance the performance and functionality of the
        Service. These technologies are governed by the same principles described in this policy.
      </p>

      {/* 2. Types of Cookies We Use */}
      <h2>2. Types of Cookies We Use</h2>
      <p>
        We use the following categories of cookies on the Service. We have conducted a cookie
        audit to identify all cookies in use and their purposes.
      </p>

      <h3>2.1 Essential Cookies (Strictly Necessary)</h3>
      <p>
        These cookies are required for the Service to function properly. They enable core
        functionality such as authentication, session management, and security. Without these
        cookies, the Service cannot operate correctly.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>__session</code></td>
            <td>{APP_SHORT_NAME}</td>
            <td>Manages user authentication session. Ensures you remain logged in across page navigation.</td>
            <td>Session</td>
          </tr>
          <tr>
            <td><code>csrf-token</code></td>
            <td>{APP_SHORT_NAME}</td>
            <td>Cross-Site Request Forgery (CSRF) protection token for form submissions and API calls.</td>
            <td>Session</td>
          </tr>
          <tr>
            <td><code>FIREBASE_AUTH</code></td>
            <td>Firebase (Google)</td>
            <td>Firebase Authentication session persistence. Maintains authentication state across browser sessions.</td>
            <td>Persistent (30 days)</td>
          </tr>
          <tr>
            <td><code>firebase-heartbeat</code></td>
            <td>Firebase (Google)</td>
            <td>Monitors Firebase service health and connection status.</td>
            <td>Session</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 Functional Cookies</h3>
      <p>
        These cookies enhance the functionality and personalization of the Service. They remember
        your preferences, settings, and choices to provide a tailored experience.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>theme-preference</code></td>
            <td>{APP_SHORT_NAME}</td>
            <td>Remembers your theme preference (light/dark mode) across sessions.</td>
            <td>Persistent (1 year)</td>
          </tr>
          <tr>
            <td><code>currency-preference</code></td>
            <td>{APP_SHORT_NAME}</td>
            <td>Stores your preferred display currency for expense amounts.</td>
            <td>Persistent (1 year)</td>
          </tr>
          <tr>
            <td><code>sidebar-state</code></td>
            <td>{APP_SHORT_NAME}</td>
            <td>Remembers whether the dashboard sidebar is expanded or collapsed.</td>
            <td>Persistent (1 year)</td>
          </tr>
          <tr>
            <td><code>dismissed-banners</code></td>
            <td>{APP_SHORT_NAME}</td>
            <td>Tracks which informational banners and announcements you have dismissed.</td>
            <td>Persistent (1 year)</td>
          </tr>
        </tbody>
      </table>

      <h3>2.3 Analytics Cookies</h3>
      <p>
        These cookies help us understand how users interact with the Service. We use analytics
        data to improve features, identify usage patterns, and optimize performance. All analytics
        data is collected in an aggregated, anonymized manner.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>_ga</code></td>
            <td>Google Analytics</td>
            <td>Distinguishes unique users and tracks usage patterns across sessions.</td>
            <td>Persistent (2 years)</td>
          </tr>
          <tr>
            <td><code>_ga_&lt;container-id&gt;</code></td>
            <td>Google Analytics</td>
            <td>Used to maintain session state and track page interactions.</td>
            <td>Persistent (2 years)</td>
          </tr>
          <tr>
            <td><code>_gid</code></td>
            <td>Google Analytics</td>
            <td>Distinguishes unique users for a 24-hour period.</td>
            <td>Persistent (24 hours)</td>
          </tr>
          <tr>
            <td><code>_gat</code></td>
            <td>Google Analytics</td>
            <td>Rate limits analytics requests to improve performance.</td>
            <td>Persistent (1 minute)</td>
          </tr>
        </tbody>
      </table>

      <h3>2.4 Preference Cookies</h3>
      <p>
        These cookies store your preferences and choices to improve your experience on future
        visits. They are not strictly essential but significantly enhance usability.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>onboarding-completed</code></td>
            <td>{APP_SHORT_NAME}</td>
            <td>Marks that the onboarding wizard has been completed so it is not shown again.</td>
            <td>Persistent (1 year)</td>
          </tr>
          <tr>
            <td><code>last-visited-path</code></td>
            <td>{APP_SHORT_NAME}</td>
            <td>Redirects you to your last visited dashboard page after login.</td>
            <td>Session</td>
          </tr>
          <tr>
            <td><code>cookie-consent</code></td>
            <td>{APP_SHORT_NAME}</td>
            <td>Records your cookie consent preferences so the cookie banner is not displayed repeatedly.</td>
            <td>Persistent (1 year)</td>
          </tr>
        </tbody>
      </table>

      {/* 3. Third-Party Cookies */}
      <h2>3. Third-Party Cookies</h2>
      <p>
        Some cookies are set by third-party services that we integrate with to provide the Service.
        These third parties may set cookies on your device as described below:
      </p>
      <ul>
        <li>
          <strong>Firebase (Google):</strong> Firebase Authentication and Firestore may set
          cookies for session management, authentication persistence, and service health monitoring.
          These cookies are essential for the secure operation of the Service.
        </li>
        <li>
          <strong>Google Analytics:</strong> We use Google Analytics to understand how users
          interact with the Service. Google Analytics sets cookies as described in Section 2.3.
          You can learn more about Google Analytics cookies at{' '}
          <a
            href="https://policies.google.com/technologies/cookies"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s Cookie Policy
          </a>.
        </li>
        <li>
          <strong>Vercel:</strong> Our frontend hosting provider may set cookies for CDN
          functionality, caching, and performance optimization. These are primarily
          infrastructure-level cookies.
        </li>
      </ul>
      <p>
        We do not allow third-party advertising cookies on the Service. We do not use cookies
        for retargeting, behavioral advertising, or any form of ad personalization.
      </p>

      {/* 4. Purpose of Each Cookie */}
      <h2>4. Purpose Summary</h2>
      <p>
        In summary, we use cookies for the following purposes:
      </p>
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Shield className="h-4 w-4 text-blue-500" />
            Authentication & Security
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Maintain secure login sessions, protect against CSRF attacks, and manage Firebase
            authentication state.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Settings className="h-4 w-4 text-green-500" />
            Functionality & Preferences
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Remember your theme, currency, sidebar state, and dismissed banners for a personalized
            experience.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Info className="h-4 w-4 text-purple-500" />
            Analytics
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Understand usage patterns, identify popular features, and improve the Service based
            on aggregated user behavior.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Cookie className="h-4 w-4 text-orange-500" />
            Consent Management
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Record your cookie preferences and ensure the cookie consent banner is shown appropriately.
          </p>
        </div>
      </div>

      {/* 5. How to Manage Cookies */}
      <h2>5. How to Manage Cookies</h2>
      <p>
        You have the right to choose whether to accept or reject cookies. You can exercise your
        preferences in the following ways:
      </p>

      <h3>5.1 Cookie Consent Banner</h3>
      <p>
        When you first visit the Service, a cookie consent banner is displayed. You can choose
        to accept all cookies, reject non-essential cookies, or customize your preferences.
        Essential cookies cannot be disabled as they are required for the Service to function.
      </p>

      <h3>5.2 Browser Settings</h3>
      <p>
        Most web browsers allow you to control cookies through their settings. You can:
      </p>
      <ul>
        <li>View and delete cookies stored on your device.</li>
        <li>Block cookies from specific websites or all websites.</li>
        <li>Set your browser to notify you when a cookie is being set.</li>
        <li>Configure private or incognito browsing modes that limit cookie storage.</li>
      </ul>
      <p>
        To learn how to manage cookies in your specific browser, refer to the browser&apos;s
        help documentation:
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h3>5.3 Impact of Disabling Cookies</h3>
      <p>
        Please note that if you disable or reject cookies, some parts of the Service may become
        inaccessible or may not function properly. Specifically, disabling essential cookies will
        prevent you from logging in and using the core expense management features.
      </p>

      {/* 6. Do Not Track */}
      <h2>6. Do Not Track (DNT)</h2>
      <p>
        Some browsers have a &ldquo;Do Not Track&rdquo; feature that signals to websites that you
        do not want your online activity tracked. The Service currently does not respond to
        browser DNT signals because there is no uniform industry standard for how DNT signals
        should be interpreted. However, we provide you with the tools described in Section 5
        to manage your cookie preferences.
      </p>
      <p>
        If a universal standard for DNT signals is established in the future, we will update
        this policy to describe our response to such signals.
      </p>

      {/* 7. Changes */}
      <h2>7. Changes to This Cookie Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in our use of
        cookies, legal requirements, or industry best practices. When we make material changes,
        we will:
      </p>
      <ul>
        <li>Update the &ldquo;Last Updated&rdquo; date at the top of this page.</li>
        <li>Notify you through the Service or via email (for company administrators).</li>
        <li>Display a new cookie consent banner to re-confirm your preferences if necessary.</li>
      </ul>
      <p>
        We encourage you to review this Cookie Policy periodically to stay informed about our
        use of cookies.
      </p>

      {/* 8. Contact */}
      <h2>8. Contact Us</h2>
      <p>
        If you have any questions or concerns about our use of cookies, please contact us:
      </p>
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Email:</strong>{' '}
            <a href="mailto:privacy@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              privacy@finflow.ai
            </a>
          </li>
          <li>
            <strong>Data Protection Officer:</strong>{' '}
            <a href="mailto:dpo@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              dpo@finflow.ai
            </a>
          </li>
          <li>
            <strong>Postal Address:</strong> FinFlow AI Inc., 251 Little Falls Drive,
            Wilmington, DE 19808, United States
          </li>
        </ul>
      </div>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        This Cookie Policy was last updated on {lastUpdated}. Previous versions are available
        upon request.
      </p>
    </article>
  )
}