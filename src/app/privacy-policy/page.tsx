import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Kanban Board - Learn how we handle your data and protect your privacy.",
};

export default function PrivacyPolicy() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block">← Back to Board</Link>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last updated: September 10, 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">1. Introduction</h2>
            <p>
              Welcome to Kanban Board (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information when you visit
              our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">2. Information We Collect</h2>
            <p>
              <strong className="text-slate-100">Local Storage Data:</strong> All your Kanban board data (cards, columns, subtasks)
              is stored exclusively in your browser&apos;s local storage. We do not collect, transmit, or store any of your
              board data on our servers. Your data stays entirely on your device.
            </p>
            <p>
              <strong className="text-slate-100">Automatically Collected Information:</strong> When you visit our website,
              certain information may be collected automatically, including your IP address, browser type,
              operating system, referring URLs, and information about how you interact with the website. This
              information is collected through cookies and similar technologies used by third-party services
              such as Google Analytics and Google AdSense.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">3. How We Use Your Information</h2>
            <p>We use the automatically collected information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Improve and optimize our website&apos;s performance and user experience</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Display relevant advertisements through Google AdSense</li>
              <li>Ensure the security and integrity of our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">4. Google AdSense and Cookies</h2>
            <p>
              We use Google AdSense to display advertisements on our website. Google AdSense uses cookies
              to serve ads based on your prior visits to our website or other websites. Google&apos;s use of
              advertising cookies enables it and its partners to serve ads based on your visit to our site
              and/or other sites on the Internet.
            </p>
            <p>
              You may opt out of personalized advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                Google Ads Settings
              </a>.
              Alternatively, you can opt out of third-party vendor&apos;s use of cookies by visiting the{" "}
              <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                Network Advertising Initiative opt-out page
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">5. Third-Party Services</h2>
            <p>Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party websites you visit.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">6. Data Security</h2>
            <p>
              We take reasonable measures to protect your information. Since all board data is stored locally
              in your browser, you have full control over your data. You can clear your board data at any
              time by clearing your browser&apos;s local storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">7. Children&apos;s Privacy</h2>
            <p>
              Our website is not intended for children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you believe we have collected information
              from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page
              with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please visit our{" "}
              <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
