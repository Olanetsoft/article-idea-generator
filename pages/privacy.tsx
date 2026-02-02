import Head from "next/head";
import Link from "next/link";
import { Space_Grotesk } from "@next/font/google";
import { Header, Footer } from "@/components";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import {
  ShieldCheckIcon,
  EyeIcon,
  DatabaseIcon,
  ShareIcon,
  ClockIcon,
  ScaleIcon,
  LockClosedIcon,
  CubeIcon,
  UserGroupIcon,
  RefreshIcon,
  MailIcon,
} from "@heroicons/react/outline";

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="text-gray-600 dark:text-gray-400 space-y-4">{children}</div>
    </div>
  );
}

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 bg-violet-500 rounded-full flex-shrink-0" />
      <div>
        <span className="font-medium text-gray-900 dark:text-white">
          {title}:
        </span>{" "}
        <span>{description}</span>
      </div>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>{`Privacy Policy | ${SITE_NAME}`}</title>
        <meta
          name="description"
          content={`Privacy Policy for ${SITE_NAME}. Learn how we collect, use, and protect your data.`}
        />
        <link rel="canonical" href={`${SITE_URL}/privacy`} />
      </Head>

      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-dark-bg">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-violet-500 dark:hover:text-violet-400 transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-900 dark:text-gray-200 font-semibold">
                Privacy Policy
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl mb-4">
              <ShieldCheckIcon className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h1
              className={`${spaceGrotesk.className} text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3`}
            >
              Privacy Policy
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Last updated: February 1, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Introduction */}
            <Section
              icon={<EyeIcon className="w-5 h-5" />}
              title="1. Introduction"
            >
              <p>
                Welcome to {SITE_NAME}. We are committed to protecting your
                privacy and ensuring you have a positive experience on our
                website. This policy outlines our data collection and use
                practices.
              </p>
            </Section>

            {/* Information We Collect */}
            <Section
              icon={<DatabaseIcon className="w-5 h-5" />}
              title="2. Information We Collect"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    2.1 Information You Provide
                  </h3>
                  <div className="space-y-3">
                    <InfoCard
                      title="Account Information"
                      description="When you sign in with Google, we receive your email address, name, and profile picture."
                    />
                    <InfoCard
                      title="URLs"
                      description="URLs you shorten or create QR codes for are stored to provide the service."
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    2.2 Automatically Collected Information
                  </h3>
                  <p className="mb-3">
                    When you use our URL shortener or QR code features, we may
                    collect:
                  </p>
                  <div className="space-y-3">
                    <InfoCard
                      title="Anonymized IP Address"
                      description="We hash IP addresses using SHA-256 (one-way, irreversible). We never store your actual IP address."
                    />
                    <InfoCard
                      title="Device Information"
                      description="Device type (mobile, tablet, desktop), browser, and operating system."
                    />
                    <InfoCard
                      title="Approximate Location"
                      description="Country, region, and city derived from IP address (for analytics only)."
                    />
                    <InfoCard
                      title="Referrer"
                      description="The website that linked to your short URL."
                    />
                    <InfoCard
                      title="UTM Parameters"
                      description="Marketing campaign tracking parameters if present in URLs."
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    2.3 Cookies and Tracking
                  </h3>
                  <div className="space-y-3">
                    <InfoCard
                      title="Necessary Cookies"
                      description="Required for basic functionality (authentication, preferences). Always active."
                    />
                    <InfoCard
                      title="Analytics Cookies"
                      description="Google Analytics and Vercel Analytics to understand usage patterns. Only activated with your consent."
                    />
                  </div>
                  <p className="mt-3 text-sm">
                    You can manage your cookie preferences at any time using the
                    cookie settings button in the footer.
                  </p>
                </div>
              </div>
            </Section>

            {/* How We Use Your Information */}
            <Section
              icon={<CubeIcon className="w-5 h-5" />}
              title="3. How We Use Your Information"
            >
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">•</span>
                  To provide and maintain our URL shortening and QR code services
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">•</span>
                  To display analytics about your shortened URLs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">•</span>
                  To improve our services and user experience
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">•</span>
                  To detect and prevent fraud or abuse
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">•</span>
                  To comply with legal obligations
                </li>
              </ul>
            </Section>

            {/* Data Sharing */}
            <Section
              icon={<ShareIcon className="w-5 h-5" />}
              title="4. Data Sharing"
            >
              <p className="mb-4">
                <strong className="text-gray-900 dark:text-white">
                  We do not sell your personal information.
                </strong>{" "}
                We may share data with:
              </p>
              <div className="space-y-3">
                <InfoCard
                  title="Service Providers"
                  description="Supabase (database), Vercel (hosting), Google (authentication and analytics)."
                />
                <InfoCard
                  title="Legal Requirements"
                  description="When required by law or to protect our rights."
                />
              </div>
            </Section>

            {/* Data Retention */}
            <Section
              icon={<ClockIcon className="w-5 h-5" />}
              title="5. Data Retention"
            >
              <div className="space-y-3">
                <InfoCard
                  title="Account Data"
                  description="Retained while your account is active."
                />
                <InfoCard
                  title="URL Analytics"
                  description="Click data is retained for as long as the associated URL exists."
                />
                <InfoCard
                  title="Deleted URLs"
                  description="Associated analytics are deleted when you delete a URL."
                />
              </div>
            </Section>

            {/* Your Rights (GDPR) */}
            <Section
              icon={<ScaleIcon className="w-5 h-5" />}
              title="6. Your Rights (GDPR)"
            >
              <p className="mb-4">
                If you are in the European Economic Area, you have the right to:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Access
                  </span>
                  <p className="text-sm mt-1">Request a copy of your personal data</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Rectification
                  </span>
                  <p className="text-sm mt-1">Request correction of inaccurate data</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Erasure
                  </span>
                  <p className="text-sm mt-1">Request deletion of your data</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Portability
                  </span>
                  <p className="text-sm mt-1">Request your data in a portable format</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Object
                  </span>
                  <p className="text-sm mt-1">Object to processing of your data</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Withdraw Consent
                  </span>
                  <p className="text-sm mt-1">Withdraw consent via cookie settings</p>
                </div>
              </div>
              <p className="mt-4">
                To exercise these rights, please contact us at{" "}
                <a
                  href="mailto:privacy@aigl.ink"
                  className="text-violet-600 dark:text-violet-400 hover:underline"
                >
                  privacy@aigl.ink
                </a>
                .
              </p>
            </Section>

            {/* Data Security */}
            <Section
              icon={<LockClosedIcon className="w-5 h-5" />}
              title="7. Data Security"
            >
              <p className="mb-4">
                We implement appropriate security measures including:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                  <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
                  <span>HTTPS encryption for all data</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                  <LockClosedIcon className="w-5 h-5 flex-shrink-0" />
                  <span>IP address hashing (SHA-256)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                  <DatabaseIcon className="w-5 h-5 flex-shrink-0" />
                  <span>Row-level security in database</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                  <RefreshIcon className="w-5 h-5 flex-shrink-0" />
                  <span>Regular security audits</span>
                </div>
              </div>
            </Section>

            {/* Third-Party Services */}
            <Section
              icon={<CubeIcon className="w-5 h-5" />}
              title="8. Third-Party Services"
            >
              <p className="mb-4">Our service integrates with:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition group"
                >
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    Google Analytics →
                  </span>
                  <p className="text-sm mt-1">View Privacy Policy</p>
                </a>
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition group"
                >
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    Vercel Analytics →
                  </span>
                  <p className="text-sm mt-1">View Privacy Policy</p>
                </a>
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition group"
                >
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    Supabase →
                  </span>
                  <p className="text-sm mt-1">View Privacy Policy</p>
                </a>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition group"
                >
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    Google OAuth →
                  </span>
                  <p className="text-sm mt-1">View Privacy Policy</p>
                </a>
              </div>
            </Section>

            {/* Children's Privacy */}
            <Section
              icon={<UserGroupIcon className="w-5 h-5" />}
              title="9. Children's Privacy"
            >
              <p>
                Our service is not directed to children under 13. We do not
                knowingly collect personal information from children.
              </p>
            </Section>

            {/* Changes to This Policy */}
            <Section
              icon={<RefreshIcon className="w-5 h-5" />}
              title="10. Changes to This Policy"
            >
              <p>
                We may update this policy from time to time. We will notify you
                of significant changes by posting a notice on our website.
              </p>
            </Section>

            {/* Contact Us */}
            <Section
              icon={<MailIcon className="w-5 h-5" />}
              title="11. Contact Us"
            >
              <p>
                For questions about this privacy policy, please contact us at:{" "}
                <a
                  href="mailto:privacy@aigl.ink"
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  privacy@aigl.ink
                </a>
              </p>
            </Section>
          </div>

          {/* Back Link */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-dark-border">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
