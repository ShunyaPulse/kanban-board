import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact the Kanban Board team. Get support, report issues, or provide feedback about our free task management tool.",
};

export default function Contact() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block">← Back to Board</Link>
        <h1 className="text-3xl font-bold text-slate-100 mb-8">Contact Us</h1>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 leading-relaxed">
          <p>
            We would love to hear from you! Whether you have a question, feedback, bug report, or feature
            request, feel free to reach out through any of the channels below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <a
              href="https://github.com/ShunyaPulse/kanban-board/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 hover:border-blue-500/50 transition-all group no-underline"
            >
              <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">🐛 Report a Bug</h3>
              <p className="text-sm text-slate-400">Found something broken? Open an issue on our GitHub repository and we will fix it.</p>
            </a>
            <a
              href="https://github.com/ShunyaPulse/kanban-board/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 hover:border-green-500/50 transition-all group no-underline"
            >
              <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-green-400 transition-colors">💡 Feature Request</h3>
              <p className="text-sm text-slate-400">Have an idea to make Kanban Board better? We welcome all suggestions.</p>
            </a>
            <a
              href="https://github.com/ShunyaPulse/kanban-board"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 hover:border-purple-500/50 transition-all group no-underline"
            >
              <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-purple-400 transition-colors">🤝 Contribute</h3>
              <p className="text-sm text-slate-400">Kanban Board is open source. Fork the repo, make improvements, and submit a pull request.</p>
            </a>
            <a
              href="mailto:techanics6174@gmail.com"
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 hover:border-amber-500/50 transition-all group no-underline"
            >
              <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">📧 Email</h3>
              <p className="text-sm text-slate-400">For general inquiries, partnerships, or business-related questions, send us an email.</p>
            </a>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-3">Frequently Asked Questions</h2>

            <div className="space-y-4 mt-4">
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-1">Is Kanban Board free?</h3>
                <p className="text-sm text-slate-400">Yes, Kanban Board is completely free and open source. No sign-up, no subscription, no hidden fees.</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-1">Where is my data stored?</h3>
                <p className="text-sm text-slate-400">All your data is stored in your browser&apos;s local storage. It never leaves your device. We have zero access to your board content.</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-1">Can I use it on my phone?</h3>
                <p className="text-sm text-slate-400">Yes! Kanban Board is fully responsive and works on mobile phones, tablets, and desktops.</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-1">How do I back up my data?</h3>
                <p className="text-sm text-slate-400">Click the &quot;Export&quot; button in the toolbar to download your entire board as a JSON file. You can import it back anytime using the &quot;Import&quot; button.</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-1">Will my data be lost if I clear my browser?</h3>
                <p className="text-sm text-slate-400">Yes. Since data is stored in local storage, clearing browser data will remove it. Always export your board before clearing browser data.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
