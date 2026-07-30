import type { Metadata } from 'next'
import Link from 'next/link'
import { RefreshCcw, DollarSign, Clock, Mail } from 'lucide-react'
import { APP_NAME, APP_SHORT_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: `${APP_NAME} Enterprise Refund Policy covering free tier, paid subscriptions, cancellations, and service credits.`,
}

const lastUpdated = 'July 15, 2025'

export default function RefundPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <RefreshCcw className="h-3.5 w-3.5" />
          Refund Policy
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Refund Policy
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <p className="lead">
        This Refund Policy describes the circumstances under which {APP_NAME} Enterprise
        (&ldquo;{APP_SHORT_NAME},&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
        will provide refunds, service credits, or other remedies for our paid subscription tiers.
        This policy is incorporated by reference into our{' '}
        <Link href="/terms">Terms of Service</Link>.
      </p>

      <hr />

      {/* 1. Free Tier */}
      <h2>1. Free Tier</h2>
      <p>
        {APP_SHORT_NAME} offers a Free tier that is provided at no cost. Since there are no
        fees associated with the Free tier, all usage of the Free tier is not eligible for
        refunds. Free tier users may cancel their account at any time through the account
        settings page.
      </p>
      <p>
        If you are on the Free tier and upgrade to a paid subscription, any fees paid for
        the paid subscription are subject to the refund terms described in this policy.
      </p>

      {/* 2. Paid Subscriptions */}
      <h2>2. Paid Subscriptions</h2>

      <h3>2.1 Monthly Subscriptions</h3>
      <p>
        Monthly subscriptions (Starter and Business tiers) are billed on a recurring monthly
        basis. Refunds for monthly subscriptions are handled as follows:
      </p>
      <ul>
        <li>
          <strong>First Month Guarantee:</strong> If you cancel your subscription within 7 days
          of your initial payment, you are eligible for a full refund of that first month&apos;s
          payment. This guarantee applies only to the initial subscription payment, not to
          subsequent renewal payments.
        </li>
        <li>
          <strong>Renewal Payments:</strong> Monthly renewal payments are non-refundable except
          as required by applicable law. However, if we experience a service outage that
          materially impacts your use of the Service for a period of 48 hours or more, you
          may request a prorated service credit for the affected period.
        </li>
      </ul>

      <h3>2.2 Annual Subscriptions</h3>
      <p>
        Annual subscriptions are billed once per year and may offer a discount compared to
        monthly billing. Refunds for annual subscriptions are handled as follows:
      </p>
      <ul>
        <li>
          <strong>30-Day Guarantee:</strong> If you cancel your annual subscription within 30
          days of your initial payment, you are eligible for a full refund of the annual payment.
        </li>
        <li>
          <strong>After 30 Days:</strong> If you cancel an annual subscription after 30 days,
          you may receive a prorated refund for the remaining months of the subscription term,
          minus a processing fee equivalent to one month of the monthly subscription price.
        </li>
      </ul>

      <h3>2.3 Enterprise Subscriptions</h3>
      <p>
        Enterprise subscriptions are billed according to the terms specified in the individual
        Enterprise Agreement entered into between {APP_SHORT_NAME} and the Customer. Refund
        terms for Enterprise subscriptions are governed by the applicable Enterprise Agreement.
      </p>

      {/* 3. Service Credits */}
      <h2>3. Service Credits</h2>
      <p>
        In certain circumstances, we may issue service credits instead of refunds. Service
        credits are applied to your account and can be used toward future subscription payments.
      </p>
      <p>Service credits may be issued in the following circumstances:</p>
      <ul>
        <li>
          <strong>Service Outages:</strong> If the Service experiences an unscheduled outage
          that materially affects your ability to use core features for more than 48 consecutive
          hours, you may request a service credit equal to 5% of your monthly subscription fee
          for each additional 24-hour period of continued outage, up to a maximum of 50% of
          your monthly fee.
        </li>
        <li>
          <strong>Feature Unavailability:</strong> If a feature that is advertised as part of
          your subscription tier is unavailable for 30 consecutive days due to a defect in
          the Service, you may request a prorated service credit.
        </li>
        <li>
          <strong>Billing Errors:</strong> If we make an error in billing you, we will promptly
          correct the error and issue a service credit or refund for any overpayment.
        </li>
      </ul>

      <h3>3.1 Limitation on Credits</h3>
      <p>
        Service credits are not redeemable for cash and will expire 12 months after issuance.
        The total service credits issued in any 12-month period shall not exceed 50% of the
        subscription fees paid in that period.
      </p>

      {/* 4. Cancellation Policy */}
      <h2>4. Cancellation Policy</h2>

      <h3>4.1 How to Cancel</h3>
      <p>
        You can cancel your subscription at any time through the billing section of your
        account settings. Company administrators have the authority to cancel the company
        subscription. Upon cancellation:
      </p>
      <ul>
        <li>Your subscription will remain active until the end of the current billing period.</li>
        <li>You will not be charged for subsequent billing periods.</li>
        <li>At the end of the billing period, your account will be downgraded to the Free tier.</li>
      </ul>

      <h3>4.2 Data After Cancellation</h3>
      <p>
        Following cancellation, your data will be retained according to our data retention
        policy as described in our <Link href="/privacy">Privacy Policy</Link>. You can export
        your data before cancellation through the export functionality available in account
        settings.
      </p>

      <h3>4.3 Reactivation</h3>
      <p>
        If you cancel and later decide to reactivate your subscription, you can do so within
        90 days of cancellation. Upon reactivation, access to your historical data will be
        restored. After 90 days, your workspace may need to be set up again as the data will
        have been permanently deleted.
      </p>

      {/* 5. Non-Refundable Items */}
      <h2>5. Non-Refundable Items</h2>
      <p>The following are not eligible for refunds or service credits:</p>
      <ul>
        <li>Setup fees, onboarding fees, or professional services fees (unless otherwise specified in a separate agreement).</li>
        <li>Fees for third-party integrations or add-on services.</li>
        <li>Usage overages beyond the limits of your subscription tier.</li>
        <li>Subscription fees for billing periods that have already ended.</li>
        <li>Fees for accounts terminated due to violation of our Terms of Service or Acceptable Use Policy.</li>
      </ul>

      {/* 6. How to Request a Refund */}
      <h2>6. How to Request a Refund</h2>
      <p>
        To request a refund or service credit, please contact our billing team:
      </p>
      <div className="not-prose rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Billing Email:</strong>{' '}
            <a href="mailto:billing@finflow.ai" className="text-blue-600 hover:underline dark:text-blue-400">
              billing@finflow.ai
            </a>
          </li>
          <li>
            <strong>Subject Line:</strong> &ldquo;Refund Request &mdash; [Your Company Name]&rdquo;
          </li>
          <li>
            <strong>Required Information:</strong> Account email, company name, subscription
            tier, reason for refund request, and date of payment (if known).
          </li>
        </ul>
      </div>
      <p>
        We will process refund requests within 10 business days. Approved refunds will be
        issued to the original payment method within 5 business days of approval.
      </p>

      {/* 7. Chargebacks */}
      <h2>7. Chargebacks</h2>
      <p>
        If you believe a charge is erroneous, we encourage you to contact our billing team
        before initiating a chargeback with your payment provider. We will work promptly to
        resolve billing disputes. Initiating an unjustified chargeback may result in immediate
        suspension of your account and all associated data.
      </p>

      {/* 8. Changes */}
      <h2>8. Changes to This Policy</h2>
      <p>
        We reserve the right to modify this Refund Policy at any time. Changes will be posted
        on this page with an updated &ldquo;Last Updated&rdquo; date. Material changes will
        be communicated to active subscribers via email.
      </p>

      <hr />

      <p className="text-sm text-gray-500 dark:text-gray-400">
        This Refund Policy was last updated on {lastUpdated}.
      </p>
    </article>
  )
}