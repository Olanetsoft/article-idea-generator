import Head from "next/head";
import Link from "next/link";
import { Header, Footer } from "@/components";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

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

        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          <article className="prose prose-zinc dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
              Last updated: February 1, 2026
            </p>

            <section className="mb-8">
              <h2>1. Introduction</h2>
              <p>
                Welcome to {SITE_NAME} (&quot;we&quot;, &quot;our&quot;, or
                &quot;us&quot;). We are committed to protecting your privacy and
                ensuring you have a positive experience on our website. This
                policy outlines our data collection and use practices.
              </p>
            </section>

            <section className="mb-8">
              <h2>2. Information We Collect</h2>

              <h3>2.1 Information You Provide</h3>
              <ul>
                <li>
                  <strong>Account Information:</strong> When you sign in with
                  Google, we receive your email address, name, and profile
                  picture.
                </li>
                <li>
                  <strong>URLs:</strong> URLs you shorten or create QR codes for
                  are stored to provide the service.
                </li>
              </ul>

              <h3>2.2 Automatically Collected Information</h3>
              <p>
                When you use our URL shortener or QR code features, we may
                collect:
              </p>
              <ul>
                <li>
                  <strong>Anonymized IP Address:</strong> We hash (one-way
                  encrypt) IP addresses. We never store your actual IP address.
                </li>
                <li>
                  <strong>Device Information:</strong> Device type (mobile,
                  tablet, desktop), browser, and operating system.
                </li>
                <li>
                  <strong>Approximate Location:</strong> Country, region, and
                  city derived from IP address (for analytics only).
                </li>
                <li>
                  <strong>Referrer:</strong> The website that linked to your
                  short URL.
                </li>
                <li>
                  <strong>UTM Parameters:</strong> Marketing campaign tracking
                  parameters if present in URLs.
                </li>
              </ul>

              <h3>2.3 Cookies and Tracking</h3>
              <p>We use the following types of cookies:</p>
              <ul>
                <li>
                  <strong>Necessary Cookies:</strong> Required for basic
                  functionality (authentication, preferences). Always active.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Google Analytics and
                  Vercel Analytics to understand usage patterns. Only activated
                  with your consent.
                </li>
                <li>
                  <strong>Marketing Cookies:</strong> Used for advertising
                  purposes. Only activated with your consent.
                </li>
              </ul>
              <p>
                You can manage your cookie preferences at any time using the
                cookie settings button in the footer.
              </p>
            </section>

            <section className="mb-8">
              <h2>3. How We Use Your Information</h2>
              <ul>
                <li>
                  To provide and maintain our URL shortening and QR code
                  services
                </li>
                <li>To display analytics about your shortened URLs</li>
                <li>To improve our services and user experience</li>
                <li>To detect and prevent fraud or abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>4. Data Sharing</h2>
              <p>
                We do not sell your personal information. We may share data
                with:
              </p>
              <ul>
                <li>
                  <strong>Service Providers:</strong> Supabase (database),
                  Vercel (hosting), Google (authentication and analytics).
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>5. Data Retention</h2>
              <ul>
                <li>
                  <strong>Account Data:</strong> Retained while your account is
                  active.
                </li>
                <li>
                  <strong>URL Analytics:</strong> Click data is retained for up
                  to 2 years.
                </li>
                <li>
                  <strong>Deleted URLs:</strong> Associated analytics are
                  deleted when you delete a URL.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>6. Your Rights (GDPR)</h2>
              <p>
                If you are in the European Economic Area, you have the right to:
              </p>
              <ul>
                <li>
                  <strong>Access:</strong> Request a copy of your personal data.
                </li>
                <li>
                  <strong>Rectification:</strong> Request correction of
                  inaccurate data.
                </li>
                <li>
                  <strong>Erasure:</strong> Request deletion of your data
                  (&quot;right to be forgotten&quot;).
                </li>
                <li>
                  <strong>Portability:</strong> Request your data in a portable
                  format.
                </li>
                <li>
                  <strong>Object:</strong> Object to processing of your data.
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Withdraw consent at any
                  time via cookie settings.
                </li>
              </ul>
              <p>
                To exercise these rights, please contact us at{" "}
                <a href="mailto:privacy@aigl.ink">privacy@aigl.ink</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2>7. Data Security</h2>
              <p>We implement appropriate security measures including:</p>
              <ul>
                <li>HTTPS encryption for all data transmission</li>
                <li>IP address hashing (SHA-256) - we never store raw IPs</li>
                <li>Row-level security in our database</li>
                <li>Regular security audits</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>8. Third-Party Services</h2>
              <p>Our service integrates with:</p>
              <ul>
                <li>
                  <strong>Google Analytics:</strong>{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <strong>Vercel Analytics:</strong>{" "}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <strong>Supabase:</strong>{" "}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <strong>Google OAuth:</strong>{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>9. Children&apos;s Privacy</h2>
              <p>
                Our service is not directed to children under 13. We do not
                knowingly collect personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2>10. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. We will notify you
                of significant changes by posting a notice on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2>11. Contact Us</h2>
              <p>
                For questions about this privacy policy, please contact us at:{" "}
                <a href="mailto:privacy@aigl.ink">privacy@aigl.ink</a>
              </p>
            </section>
          </article>

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-dark-border">
            <Link
              href="/"
              className="text-violet-600 dark:text-violet-400 hover:underline"
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
