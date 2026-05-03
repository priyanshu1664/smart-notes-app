import { connectDB } from "@/lib/db";
import { getUserSession } from "@/lib/getUserSession";
import TaskModel from "@/models/TaskModel";
import NoteModel from "@/models/NotesModel";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await connectDB();

    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "weekly";

    // ─── DATE RANGE ────────────────────────────────────────────────
    const now = new Date();
    let startDate = new Date();

    if (range === "weekly") startDate.setDate(now.getDate() - 6);
    else if (range === "monthly") startDate.setMonth(now.getMonth() - 1);
    else if (range === "yearly") startDate.setFullYear(now.getFullYear() - 1);

    // ─── FETCH ALL USER TASKS (no date filter — needed for KPIs) ──
    const allTasks = await TaskModel.find({ userId }).lean();

    // Tasks within selected range (for chart)
    const rangedTasks = allTasks.filter(
      (t) => t.date && new Date(t.date) >= startDate
    );

    // ─── SECTION 1 · KPI OVERVIEW ──────────────────────────────────
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const pendingTasks = allTasks.filter(
      (t) => t.status === "pending" || t.status === "in-progress"
    ).length;
    const overdueTasks = allTasks.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now && t.status !== "completed";
    }).length;

    // Notes KPI
    let totalNotes = 0;
    let notesThisWeek = 0;
    let notesByCategory = {};

    try {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);

      const allNotes = await NoteModel.find({ userId }).lean();
      totalNotes = allNotes.length;
      notesThisWeek = allNotes.filter(
        (n) => n.createdAt && new Date(n.createdAt) >= weekAgo
      ).length;

      // Notes by category for Section 3 doughnut
      allNotes.forEach((note) => {
        const rawTags = note.tags || note.tag || "Uncategorized";
        const tagsArray = Array.isArray(rawTags)
          ? rawTags.length > 0
            ? rawTags
            : ["Uncategorized"]
          : rawTags
          ? [rawTags]
          : ["Uncategorized"];
        tagsArray.forEach((tag) => {
          const raw = typeof tag === "string" ? tag.trim() : "Uncategorized";
          const cleanTag = raw
            ? raw.charAt(0).toUpperCase() + raw.slice(1)
            : "Uncategorized";
          notesByCategory[cleanTag] = (notesByCategory[cleanTag] || 0) + 1;
        });
      });
    } catch (_) {}

    // ─── STREAK CALCULATION ────────────────────────────────────────
    const calculateStreak = () => {
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().split("T")[0];
        const hasCompleted = allTasks.some(
          (t) =>
            t.status === "completed" &&
            t.date &&
            new Date(t.date).toISOString().split("T")[0] === key
        );
        if (hasCompleted) streak++;
        else break;
      }
      return streak;
    };

    const streak = calculateStreak();

    // ─── SECTION 2 · CHART DATA (range-aware) ──────────────────────
    // Group ranged tasks by date
    const grouped = {};
    rangedTasks.forEach((task) => {
      const key = new Date(task.date).toISOString().split("T")[0];
      if (!grouped[key]) grouped[key] = { completed: 0, total: 0, overdue: 0 };
      grouped[key].total++;
      if (task.status === "completed") grouped[key].completed++;
      if (
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "completed"
      ) {
        grouped[key].overdue++;
      }
    });

    // Fill every day in the range (no gaps in chart)
    const chartData = [];
    const loopDate = new Date(startDate);
    while (loopDate <= now) {
      const key = loopDate.toISOString().split("T")[0];
      chartData.push({
        date: key,
        completed: grouped[key]?.completed || 0,
        total: grouped[key]?.total || 0,
        overdue: grouped[key]?.overdue || 0,
      });
      loopDate.setDate(loopDate.getDate() + 1);
    }

    // Status distribution (all tasks)
    const statusDistribution = {
      completed: allTasks.filter((t) => t.status === "completed").length,
      inProgress: allTasks.filter((t) => t.status === "in-progress").length,
      pending: allTasks.filter((t) => t.status === "pending").length,
      overdue: overdueTasks,
      cancelled: allTasks.filter((t) => t.status === "cancelled").length,
    };

    // ─── SECTION 3 · PRIORITY BREAKDOWN ───────────────────────────
    const priorityBreakdown = {
      critical: allTasks.filter((t) => t.priority === "critical").length,
      high: allTasks.filter((t) => t.priority === "high").length,
      medium: allTasks.filter((t) => t.priority === "medium").length,
      low: allTasks.filter((t) => t.priority === "low").length,
      none: allTasks.filter((t) => !t.priority || t.priority === "none").length,
    };

    // ─── SECTION 4 · RECENT TASKS (latest 6) ───────────────────────
    const recentTasks = await TaskModel.find({ userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(6)
      .lean();

    const recentTasksMapped = recentTasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      status: t.status,
      priority: t.priority || "none",
      category: t.category || "",
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
      updatedAt: t.updatedAt
        ? new Date(t.updatedAt).toISOString()
        : new Date(t.createdAt).toISOString(),
    }));

    // Recent Notes (latest 6)
    let recentNotes = [];
    try {
      const notes = await NoteModel.find({ userId })
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(6)
        .lean();

      recentNotes = notes.map((n) => ({
        id: n._id.toString(),
        title: n.title,
        category: n.tags || n.tag || "Uncategorized",
        snippet: n.content
          ? n.content.replace(/<[^>]+>/g, "").slice(0, 60)
          : "",
        updatedAt: n.updatedAt
          ? new Date(n.updatedAt).toISOString()
          : new Date(n.createdAt).toISOString(),
      }));
    } catch (_) {
      // NoteModel may not exist
    }

    // ─── TIME INSIGHTS (carried from original) ─────────────────────
    let totalEstimated = 0;
    let totalActual = 0;
    rangedTasks.forEach((task) => {
      totalEstimated += task.estimatedMinutes || 0;
      totalActual += task.actualMinutes || 0;
    });
    const efficiency =
      totalActual > 0 ? Math.round((totalEstimated / totalActual) * 100) : 0;

    // ─── RESPONSE ──────────────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        range,

        // Section 1 — KPIs
        kpis: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          totalNotes,
          notesThisWeek,
          completionRate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
          streak,
        },

        // Section 2 — Chart + status ring
        chartData,
        statusDistribution,

        // Section 3 — Priority + notes by category
        priorityBreakdown,
        notesByCategory,

        // Section 4 — Recent activity feed
        recentTasks: recentTasksMapped,
        recentNotes,

        // Time insights
        insights: {
          totalEstimated,
          totalActual,
          efficiency,
          streak,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[analytics/route.js]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};
