"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Check,
  Clock,
  Search,
  LayoutList,
  LayoutGrid,
  Trash2,
  Edit3,
  Play,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

const TaskManager = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks");
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Helper for conditional styling based on priority
  const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "low":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredTasks = useMemo(() => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    return tasks
      .filter((t) => {
        const titleMatch = t.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const tagMatch = t.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesSearch = titleMatch || tagMatch;

        if (!matchesSearch) return false;
        if (filter === "all") return true;
        if (filter === "urgent") return t.priority === "high";
        if (filter === "inprogress") return t.status === "in-progress";
        if (filter === "done") return t.status === "completed";
        return true;
      })
      .sort((a, b) => {
        const weightA = priorityOrder[a.priority?.toLowerCase()] || 4;
        const weightB = priorityOrder[b.priority?.toLowerCase()] || 4;
        return weightA - weightB;
      });
  }, [tasks, filter, searchQuery]);

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "completed").length,
    urgent: tasks.filter(
      (t) => t.priority === "high" && t.status !== "completed"
    ).length,
    progress: tasks.length
      ? Math.round(
          (tasks.filter((t) => t.status === "completed").length /
            tasks.length) *
            100
        )
      : 0,
  };

  // --- ACTIONS ---

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const originalTasks = [...tasks];
    setTasks(tasks.filter((t) => t._id !== id));

    try {
      await axios.delete(`/api/tasks/${id}`);
    } catch (error) {
      console.error("Delete failed", error);
      setTasks(originalTasks);
      alert("Failed to delete task. Restoring list.");
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await axios.patch(`/api/tasks/${id}`, { status: newStatus });
    } catch (error) {
      console.error("Update failed", error);
      fetchTasks();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-sky-50 min-h-screen font-sans text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">My Workspace</h1>
          <p className="text-sm text-sky-600/70">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            • {tasks.length} tasks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border border-sky-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none w-64 shadow-sm bg-white"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link
            href="/tasks/add-task"
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Task
          </Link>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", val: stats.total, color: "text-sky-900" },
          { label: "Done", val: stats.done, color: "text-emerald-600" },
          { label: "Urgent", val: stats.urgent, color: "text-red-500" },
          {
            label: "Overall Progress",
            val: `${stats.progress}%`,
            color: "text-sky-600",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-sky-500 uppercase tracking-wider font-semibold">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* VIEW & FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {["all", "urgent", "inprogress", "done"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition-all ${
                filter === f
                  ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                  : "bg-white text-sky-600 border-sky-200 hover:border-sky-400"
              }`}
            >
              {f === "done" ? "Completed" : f}
            </button>
          ))}
        </div>
        <div className="flex bg-sky-200/50 p-1 rounded-lg">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-md transition-all ${
              view === "list"
                ? "bg-white shadow-sm text-sky-600"
                : "text-sky-400"
            }`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`p-1.5 rounded-md transition-all ${
              view === "kanban"
                ? "bg-white shadow-sm text-sky-600"
                : "text-sky-400"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DISPLAY AREA */}
      {view === "list" ? (
        <div className="flex flex-col gap-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onStatusChange={updateTaskStatus}
                onDelete={deleteTask}
                styles={getPriorityStyles}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-sky-200 text-sky-300">
              No tasks match your current filter.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KanbanCol
            title="To Do"
            tasks={filteredTasks.filter((t) => t.status === "todo")}
            onStatusChange={updateTaskStatus}
            onDelete={deleteTask}
            styles={getPriorityStyles}
          />
          <KanbanCol
            title="In Progress"
            tasks={filteredTasks.filter((t) => t.status === "in-progress")}
            onStatusChange={updateTaskStatus}
            onDelete={deleteTask}
            styles={getPriorityStyles}
          />
          <KanbanCol
            title="Completed"
            tasks={filteredTasks.filter((t) => t.status === "completed")}
            onStatusChange={updateTaskStatus}
            onDelete={deleteTask}
            styles={getPriorityStyles}
          />
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const TaskRow = ({ task, onStatusChange, onDelete, styles }) => {
  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in-progress";

  return (
    <div
      className={`group flex items-start gap-4 bg-white p-4 rounded-xl border border-sky-100 hover:border-sky-300 transition-all shadow-sm ${
        isCompleted ? "opacity-60 bg-sky-50/50" : ""
      }`}
    >
      <button
        onClick={() =>
          onStatusChange(task._id, isCompleted ? "todo" : "completed")
        }
        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          isCompleted
            ? "bg-emerald-500 border-emerald-500"
            : "border-sky-200 group-hover:border-sky-500"
        }`}
      >
        {isCompleted && (
          <Check className="w-3 h-3 text-white" strokeWidth={4} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className={`font-semibold text-md truncate ${
                isCompleted ? "line-through text-sky-300" : "text-slate-800"
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex-shrink-0 ${styles(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isCompleted && !isInProgress && (
              <button
                onClick={() => onStatusChange(task._id, "in-progress")}
                title="Start Task"
                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-md"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            )}
            <Link
              href={`/tasks/add-task/${task._id}`}
              title="Edit Task"
              className="p-1.5 text-sky-400 hover:bg-sky-50 rounded-md"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(task._id)}
              title="Delete Task"
              className="p-1.5 text-red-400 hover:bg-red-50 rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-sky-600 mb-3 truncate">
          {task.description || "No description provided."}
        </p>

        <div className="flex items-center gap-4 text-[10px] font-medium text-sky-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString()
              : "No deadline"}
          </span>
          <div className="flex gap-1 flex-wrap">
            {task.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="bg-sky-50 text-sky-600 px-2 py-0.5 rounded uppercase border border-sky-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KanbanCol = ({ title, tasks, onStatusChange, onDelete, styles }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between px-1">
      <h2 className="text-xs font-bold uppercase tracking-widest text-sky-700/70">
        {title}
      </h2>
      <span className="bg-sky-200 text-sky-700 px-2 py-0.5 rounded-full text-[10px]">
        {tasks.length}
      </span>
    </div>
    <div className="bg-sky-100/30 p-3 rounded-xl min-h-[400px] flex flex-col gap-3 border border-sky-100">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div
            key={task._id}
            className="group bg-white p-3 rounded-lg border border-sky-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <button
                onClick={() =>
                  onStatusChange(
                    task._id,
                    task.status === "completed" ? "todo" : "completed"
                  )
                }
                className={`w-4 h-4 rounded border ${
                  task.status === "completed"
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-sky-200 hover:border-sky-500"
                }`}
              >
                {task.status === "completed" && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.status === "todo" && (
                  <button
                    onClick={() => onStatusChange(task._id, "in-progress")}
                    className="p-1 text-sky-600 hover:bg-sky-50 rounded"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(task._id)}
                  className="p-1 text-red-400 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p
              className={`text-xs font-bold mb-1 ${
                task.status === "completed"
                  ? "line-through text-sky-200"
                  : "text-slate-700"
              }`}
            >
              {task.title}
            </p>
            <div className="flex justify-between items-center mt-3">
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${styles(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
              <Link
                href={`/tasks/edit/${task._id}`}
                className="text-sky-300 hover:text-sky-600 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 text-sky-300 text-[10px] italic">
          Empty
        </div>
      )}
    </div>
  </div>
);

export default TaskManager;
