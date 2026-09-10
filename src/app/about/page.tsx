import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Kanban Board - A free, open-source task management tool built with Next.js. Discover our features and the technology behind the app.",
};

export default function About() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block">← Back to Board</Link>
        <h1 className="text-3xl font-bold text-slate-100 mb-8">About Kanban Board</h1>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">What is Kanban Board?</h2>
            <p>
              Kanban Board is a free, open-source task management tool designed to help individuals
              and teams organize their work efficiently. Built with modern web technologies, it provides
              a beautiful, intuitive interface for managing projects using the Kanban methodology — a visual
              system for managing work as it moves through a process.
            </p>
            <p>
              Whether you&apos;re a developer tracking sprints, a student managing assignments, or a freelancer
              juggling multiple projects, Kanban Board helps you visualize your workflow, limit work in
              progress, and maximize efficiency.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-2">🖱️ Drag & Drop</h3>
                <p className="text-sm">Intuitively move cards between columns with smooth drag-and-drop interactions powered by dnd-kit.</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-2">📊 Real-Time Analytics</h3>
                <p className="text-sm">Track throughput, lead times, column distribution, and WIP alerts with built-in metrics.</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-2">↩️ Undo / Redo</h3>
                <p className="text-sm">Made a mistake? Instantly undo or redo any action with full history support.</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-2">🎯 WIP Limits</h3>
                <p className="text-sm">Set work-in-progress limits on columns to prevent bottlenecks and maintain flow.</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-2">✅ Subtasks</h3>
                <p className="text-sm">Break down cards into smaller subtasks with checkbox tracking and progress indicators.</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-2">📤 Import / Export</h3>
                <p className="text-sm">Back up your board as JSON and import it on any device. Your data, your control.</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-2">🔒 Privacy First</h3>
                <p className="text-sm">All data is stored in your browser&apos;s local storage. Nothing is sent to any server.</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <h3 className="font-semibold text-slate-100 mb-2">📱 Responsive Design</h3>
                <p className="text-sm">Works beautifully on desktop, tablet, and mobile devices with an adaptive layout.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">Technology Stack</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-slate-100">Framework:</strong> Next.js 14 with App Router and TypeScript</li>
              <li><strong className="text-slate-100">Styling:</strong> Tailwind CSS with a modern dark theme</li>
              <li><strong className="text-slate-100">State Management:</strong> Zustand with localStorage persistence</li>
              <li><strong className="text-slate-100">Drag and Drop:</strong> dnd-kit (accessible, performant)</li>
              <li><strong className="text-slate-100">Validation:</strong> Zod for type-safe data validation</li>
              <li><strong className="text-slate-100">Testing:</strong> Vitest with comprehensive test coverage</li>
              <li><strong className="text-slate-100">Deployment:</strong> Vercel for global edge delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">Open Source</h2>
            <p>
              Kanban Board is open source and available on{" "}
              <a href="https://github.com/ShunyaPulse/kanban-board" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                GitHub
              </a>.
              Contributions, issues, and feature requests are welcome. The project is licensed under
              the MIT License.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-3">How to Use</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong className="text-slate-100">Create Cards:</strong> Click the &quot;+ Add card&quot; button at the bottom of any column to create a new task.</li>
              <li><strong className="text-slate-100">Organize:</strong> Drag and drop cards between columns (To Do → In Progress → Review → Done) to track progress.</li>
              <li><strong className="text-slate-100">Edit Details:</strong> Click any card to open the detail modal where you can edit the title, description, priority, and manage subtasks.</li>
              <li><strong className="text-slate-100">Track Metrics:</strong> Click the &quot;📊 Metrics&quot; button to view analytics including throughput, lead time, and column distribution.</li>
              <li><strong className="text-slate-100">Back Up Data:</strong> Use the Export button to download your board as a JSON file, and Import to restore it.</li>
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
