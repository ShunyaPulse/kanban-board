import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Kanban Board - Read the terms and conditions for using our free task management tool.",
};

export default function Terms() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block">← Back to Board</Link>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-8">Last updated: September 10, 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Kanban Board (&quot;the Service&quot;), you accept and agree to be bound by
              these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">2. Description of Service</h2>
            <p>
              Kanban Board is a free, browser-based task management tool that allows users to organize
              tasks using a Kanban-style board with drag-and-drop functionality. The Service includes
              features such as card creation, column management, subtask tracking, real-time analytics,
              WIP (Work In Progress) limits, and import/export capabilities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">3. Data Storage</h2>
            <p>
              All data created through the Service is stored locally in your browser&apos;s local storage.
              We do not store your board data on any server. This means:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your data is accessible only from the browser and device where it was created</li>
              <li>Clearing your browser data will permanently delete your board data</li>
              <li>We cannot recover lost data as we do not have access to it</li>
              <li>You are responsible for exporting and backing up your data using the Export feature</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">4. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service only for lawful purposes</li>
              <li>Not attempt to interfere with the proper functioning of the Service</li>
              <li>Not attempt to gain unauthorized access to any part of the Service</li>
              <li>Maintain your own backups of important data using the Export feature</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">5. Intellectual Property</h2>
            <p>
              The Service, including its design, features, and code, is the intellectual property of
              ShunyaPulse and is open-source under the MIT License. The source code is available on{" "}
              <a href="https://github.com/ShunyaPulse/kanban-board" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                GitHub
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">6. Advertisements</h2>
            <p>
              The Service may display advertisements provided by third-party advertising networks,
              including Google AdSense. These advertisements help us keep the Service free for all
              users. By using the Service, you agree to the display of advertisements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind,
              either express or implied. We do not guarantee that the Service will be uninterrupted,
              error-free, or completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">8. Limitation of Liability</h2>
            <p>
              In no event shall ShunyaPulse be liable for any indirect, incidental, special, or
              consequential damages arising from your use of the Service, including but not limited
              to loss of data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be
              posted on this page with an updated revision date. Continued use of the Service after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">10. Contact</h2>
            <p>
              If you have any questions about these Terms, please visit our{" "}
              <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
