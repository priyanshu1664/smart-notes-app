"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  FileText,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { setUser } from "@/store/userSlice";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { user } = useSelector((s) => s.user);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.id) return;
      let id = session.user.id;
      const res = await fetch(`/api/user/${id}`, {
        method: "GET",
      });

      const data = await res.json();
      // console.log(data.user);
      dispatch(setUser(data.user));
    };

    fetchUser();
  }, [session]);

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await axios.get("/api/dashboard");

      // console.log("Res", res.data);
      setData(res.data);
    }
    fetchAnalytics();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-indigo-50/30 p-10 flex items-center justify-center font-medium text-indigo-600 animate-pulse">
        Loading Performance Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className=" capitalize text-3xl font-bold tracking-tight text-slate-900">
              Good morning, {user?.name}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-indigo-200/50">
            {data.stats.pending} tasks due today
          </div>
        </header>

        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="TOTAL TASKS"
            value={data.stats.total}
            sub={`${data.stats.completed} of ${data.stats.total} completed`}
            progress={(data.stats.completed / data.stats.total) * 100}
          />
          <StatCard
            title="PENDING"
            value={data.stats.pending}
            sub={`${data.stats.overdue || 0} overdue`}
            color="text-indigo-600"
          />
          <StatCard
            title="COMPLETED"
            value={data.stats.completed}
            sub="+3 this week"
            color="text-emerald-600"
          />
          <StatCard
            title="NOTES"
            value={data.stats.notesCount}
            sub="2 pinned"
          />
        </div>

        {/* MIDDLE SECTION: TASKS & NOTES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* TODAY'S TASKS */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-[11px] font-bold tracking-[0.2em] mb-8 uppercase">
              Today's Tasks
            </h3>
            <div className="space-y-5">
              {data.todayTasks.length > 0 ? (
                data.todayTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      {task.status === "completed" ? (
                        <div className="relative">
                          <CheckCircle2 className="text-slate-300 w-6 h-6" />
                          <div className="absolute inset-0 bg-white/50" />
                        </div>
                      ) : (
                        <Circle className="text-slate-300 w-6 h-6 hover:text-indigo-500 cursor-pointer transition-colors" />
                      )}
                      <span
                        className={`text-[15px] font-medium transition-all ${
                          task.status === "completed"
                            ? "line-through text-slate-400"
                            : "text-slate-700"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span
                      className={`px-4 py-1 rounded-full text-[10px] font-bold border transition-all ${getPriorityStyle(
                        task.priority,
                        task.status
                      )}`}
                    >
                      {(task.status === "completed"
                        ? "Done"
                        : task.priority || "Medium"
                      ).toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic py-4">
                  No tasks scheduled for today.
                </p>
              )}
            </div>
          </div>

          {/* RECENT NOTES */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-[11px] font-bold tracking-[0.2em] mb-8 uppercase">
              Recent Notes
            </h3>
            <div className="space-y-8">
              {data.recentNotes.map((note) => (
                <div key={note._id} className="group cursor-pointer">
                  <h4 className="text-slate-900 font-bold text-[15px] mb-2 group-hover:text-indigo-600 transition-colors">
                    {note.title}
                  </h4>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-3">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                    <span>{getFormattedDate(note.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: RECENT ACTIVITY */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-slate-400 text-[11px] font-bold tracking-[0.2em] mb-8 uppercase">
            Recent Activity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {data.recentActivity?.length > 0 ? (
              data.recentActivity.map((act, index) => (
                <div
                  key={act.id + index}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <ActivityIcon type={act.type} action={act.action} />
                    <div className="text-[14px]">
                      <span className="text-slate-400">
                        {act.type === "note" ? "Note " : ""}
                      </span>
                      <span className="font-bold text-slate-800">
                        {act.title}{" "}
                      </span>
                      <span className="text-slate-500">{act.action}</span>
                    </div>
                  </div>
                  <div className="text-slate-400 text-[12px] font-medium">
                    {getRelativeTime(act.time)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm italic">
                No recent activity to show.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, sub, progress, color = "text-slate-900" }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-6">
        {title}
      </p>
      <div className="flex items-baseline gap-2 mb-4">
        <span className={`text-4xl font-bold tracking-tight ${color}`}>
          {value}
        </span>
        <span className="text-slate-400 text-sm font-medium">
          {title.split(" ")[0].toLowerCase()}
        </span>
      </div>
      {progress !== undefined && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3 overflow-hidden">
          <div
            className="bg-slate-900 h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-tight">
        {sub}
      </p>
    </div>
  );
}

function ActivityIcon({ type, action }) {
  // Styles inspired by image_11f120.jpg
  if (action?.includes("complete")) {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
        <Check className="w-4 h-4 text-emerald-600" />
      </div>
    );
  }
  if (action?.includes("overdue")) {
    return (
      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
        <AlertCircle className="w-4 h-4 text-rose-600" />
      </div>
    );
  }
  if (type === "note") {
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
        <FileText className="w-4 h-4 text-indigo-600" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
      <Plus className="w-4 h-4 text-slate-600" />
    </div>
  );
}

// --- HELPER FUNCTIONS ---

function getPriorityStyle(p, status) {
  if (status === "completed")
    return "bg-slate-50 text-slate-400 border-slate-100";
  switch (p?.toLowerCase()) {
    case "high":
      return "bg-rose-50 text-rose-600 border-rose-100";
    case "medium":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "low":
      return "bg-indigo-50 text-indigo-600 border-indigo-100";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

function getFormattedDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInHrs = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHrs < 1) return "Just now";
  if (diffInHrs < 24)
    return date
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .toLowerCase();
  if (diffInHrs < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
