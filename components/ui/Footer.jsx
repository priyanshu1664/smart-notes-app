import { Layout } from "lucide-react";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <div>
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="p-1.5 bg-sky-600 px-3 rounded-lg flex flex-row items-center">
              <Layout className="w-5 h-5 text-white mr-2" />
              <span className="text-amber-50">SmartNotesApp</span>
            </div>
          </div>

          <div className="flex gap-8 text-sm font-semibold text-slate-500">
            <Link
              href="/notes"
              className="hover:text-sky-600 transition-colors"
            >
              Notes
            </Link>
            <Link
              href="/tasks"
              className="hover:text-sky-600 transition-colors"
            >
              Tasks
            </Link>
            <Link
              href="/privacy"
              className="hover:text-sky-600 transition-colors"
            >
              Privacy
            </Link>
          </div>

          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} SmartNotes. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
