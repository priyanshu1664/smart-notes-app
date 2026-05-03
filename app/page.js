"use client";

import React from "react";
import {
  BarChart3,
  CheckCircle2,
  BookOpen,
  Zap,
  ArrowRight,
  Layout,
  MousePointerClick,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white">
      {/* 🔹 HERO SECTION: High Impact */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white pt-24 pb-1">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-sky-100 text-sky-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 shadow-sm">
            <Zap className="w-4 h-4 fill-sky-600" />
            <span>The smarter way to organize is here</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-8 leading-[1.1]">
            Elevate your thoughts. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
              Master your productivity.
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            A seamless workspace combining powerful note-taking with intuitive
            task management and real-time analytics.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href={session ? "/tasks" : "/api/auth/signin"}
              className="bg-sky-600 hover:bg-sky-700 text-white px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-sky-200 "
            >
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-400 px-10 py-4 rounded-xl font-bold text-lg transition-all"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* 🔹 FEATURES GRID: Value Proposition */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Everything you need in one place
          </h2>
          <div className="h-1.5 w-20 bg-sky-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: <BookOpen className="w-6 h-6" />,
              title: "Notes Management",
              desc: "Capture ideas instantly with tag-based organization and rich descriptions.",
              color: "sky",
            },
            {
              icon: <CheckCircle2 className="w-6 h-6" />,
              title: "Task Tracking",
              desc: "Manage your daily to-dos with clear status updates and priority focuses.",
              color: "emerald",
            },
            {
              icon: <BarChart3 className="w-6 h-6" />,
              title: "Productivity Insights",
              desc: "Visualize your habits with category-based charts and streak tracking.",
              color: "indigo",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-sky-200 hover:shadow-xl hover:shadow-sky-50 transition-all duration-300"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors bg-${feature.color}-50 text-${feature.color}-600 group-hover:bg-${feature.color}-600`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 STEPS SECTION: "How it Works" */}
      <section
        id="how-it-works"
        className="py-12 bg-slate-50 border-y border-slate-100"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-8">
                Streamline your day <br /> in three simple steps
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Capture",
                    text: "Create notes as they come to you and tag them by category.",
                  },
                  {
                    step: "02",
                    title: "Organize",
                    text: "Turn notes into tasks and set your daily focus goals.",
                  },
                  {
                    step: "03",
                    title: "Analyze",
                    text: "Check your dashboard to see your productivity distribution.",
                  },
                ].map((s, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-4xl font-black text-sky-100">
                      {s.step}
                    </span>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">
                        {s.title}
                      </h4>
                      <p className="text-slate-600">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-sky-400 to-indigo-500 rounded-[2rem] shadow-2xl p-8 text-white flex flex-col justify-end">
                <ShieldCheck className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">Secure & Private</h3>
                <p className="text-sky-50">
                  Your notes and tasks are encrypted and stored safely with
                  NextAuth protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 FINAL CTA */}
      <section className="py-20  px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Decorative Background Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to reclaim your focus?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join users who have transformed their workflow with SmartNotes. No
            credit card required.
          </p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-3 bg-white text-slate-900 hover:bg-sky-50 px-10 py-4 rounded-2xl font-bold text-lg transition-all"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
