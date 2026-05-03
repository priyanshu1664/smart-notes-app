"use client";
import styles from "./analytics.module.css";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  completed: "#1D9E75",
  "in-progress": "#378ADD",
  pending: "#EF9F27",
  overdue: "#E24B4A",
  cancelled: "#888780",
};

const PRIORITY_COLORS = {
  high: "#D85A30",
  medium: "#EF9F27",
  low: "#1D9E75",
  none: "#888780",
};
const FALLBACK_PALETTE = [
  "#534AB7",
  "#1D9E75",
  "#EF9F27",
  "#378ADD",
  "#D85A30",
  "#E24B4A",
  "#D4537E",
  "#888780",
  "#7B5EA7",
  "#2DA89C",
];
const NOTE_CATEGORY_COLORS = {
  Meeting: { bg: "#EEEDFE", text: "#3C3489", dot: "#534AB7" },
  Research: { bg: "#E1F5EE", text: "#085041", dot: "#1D9E75" },
  Ideas: { bg: "#FAEEDA", text: "#633806", dot: "#EF9F27" },
  Learning: { bg: "#E6F1FB", text: "#0C447C", dot: "#378ADD" },
  DSA: { bg: "#FAECE7", text: "#712B13", dot: "#D85A30" },
  Coding: { bg: "#F1EFE8", text: "#5F5E5A", dot: "#888780" },
  Project: { bg: "#FBEAF0", text: "#72243E", dot: "#D4537E" },

  Work: { bg: "#EBF5FF", text: "#1E3A8A", dot: "#3B82F6" },
  React: { bg: "#FEE2E2", text: "#7F1D1D", dot: "#EF4444" },
  Frontend: { bg: "#ECFDF5", text: "#064E3B", dot: "#10B981" },
  Backend: { bg: "#F5F3FF", text: "#4C1D95", dot: "#8B5CF6" },
  Review: { bg: "#FFF7ED", text: "#9A3412", dot: "#F97316" },

  Personal: { bg: "#FEF2F2", text: "#991B1B", dot: "#F87171" },
  Health: { bg: "#F0FDF4", text: "#166534", dot: "#22C55E" },
  Travel: { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  Hobbies: { bg: "#FDF2F8", text: "#9D174D", dot: "#EC4899" },
  Family: { bg: "#EEF2FF", text: "#3730A3", dot: "#6366F1" },

  Documentation: { bg: "#F8FAFC", text: "#334155", dot: "#64748B" },
  Database: { bg: "#FFF7ED", text: "#9A3412", dot: "#EA580C" },
  Design: { bg: "#FAFAF9", text: "#44403C", dot: "#78716C" },
  Science: { bg: "#ECFEFF", text: "#164E63", dot: "#06B6D4" },
  Goals: { bg: "#F0FDFA", text: "#134E48", dot: "#14B8A6" },
  Uncategorized: { bg: "#F1EFE8", text: "#5F5E5A", dot: "#888780" },
};

const STATUS_BADGE = {
  completed: { cls: styles.bDone, label: "Done" },
  "in-progress": { cls: styles.bProg, label: "In progress" },
  pending: { cls: styles.bPend, label: "Pending" },
  overdue: { cls: styles.bOver, label: "Overdue" },
  cancelled: { cls: styles.bOver, label: "Cancelled" },
};

const PRIORITY_BADGE = {
  critical: { cls: styles.bOver, label: "Crit" },
  high: { cls: styles.bHigh, label: "High" },
  medium: { cls: styles.bMed, label: "Med" },
  low: { cls: styles.bLow, label: "Low" },
  none: { cls: "", label: "—" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  if (diffD < 7)
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatDueDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  if (d < now)
    return `Was due ${d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })}`;
  return `Due ${d.toLocaleDateString([], { month: "short", day: "numeric" })}`;
}

// ─── CHART HOOK (Chart.js via CDN, loaded once) ───────────────────────────────

function useChartJs(callback, deps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Chart) {
      callback(window.Chart);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => callback(window.Chart);
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function SkeletonBlock({ h = 20, w = "100%", radius = 6 }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: radius,
        background: "var(--color-background-secondary)",
        animation: "pulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

function Section1Kpis({ kpis, loading }) {
  const streak = kpis?.streak ?? 0;

  const quotes = [
    "Consistency is your superpower today.",
    "Small steps lead to giants.",
    "Clear skies and clear goals.",
    "Adding wind to your wings.",
    "Showing up is half winning.",
    "Don't let the chain break.",
    "Consistency over intensity, every day.",
    "One day at a time.",
    "Secure your progress for tomorrow.",
    "Keep that momentum flowing high.",
  ];

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const displayQuote = useMemo(() => getRandomQuote(), [streak]);

  const getStreakMessage = (count) => {
    if (count === 0) return "Start your first streak!";
    if (count < 3) return "Great start, keep going!";
    if (count < 5) return "Flying high on this streak.";
    let quote = displayQuote;
    if (count < 7) return quote;

    return " Absolute legend, don't stop!";
  };

  return (
    <div className={styles.sec}>
      <div className={styles.secLabel}>Overview</div>
      <div className={styles.kpiGrid}>
        {/* Total Tasks */}
        <div className={styles.kpi}>
          <div className={styles.kl}>Total tasks</div>
          {loading ? (
            <SkeletonBlock h={28} w={60} />
          ) : (
            <div className={styles.kv}>{kpis?.totalTasks ?? 0}</div>
          )}
          <div className={`${styles.ks} ${styles.tu}`}>
            ↑ {kpis?.completionRate ?? 0}% completion
          </div>
        </div>

        {/* Completed */}
        <div className={styles.kpi}>
          <div className={styles.kl}>Completed</div>
          {loading ? (
            <SkeletonBlock h={28} w={60} />
          ) : (
            <div className={styles.kv} style={{ color: "#1D9E75" }}>
              {kpis?.completedTasks ?? 0}
            </div>
          )}
          <div className={styles.ks}>{kpis?.completionRate ?? 0}% rate</div>
        </div>

        {/* Pending */}
        <div className={styles.kpi}>
          <div className={styles.kl}>Pending</div>
          {loading ? (
            <SkeletonBlock h={28} w={60} />
          ) : (
            <div className={styles.kv} style={{ color: "#185FA5" }}>
              {kpis?.pendingTasks ?? 0}
            </div>
          )}
          <div className={`${styles.ks} ${styles.td}`}>
            {kpis?.overdueTasks ?? 0} overdue
          </div>
        </div>

        {/* Notes */}
        <div className={styles.kpi}>
          <div className={styles.kl}>Total notes</div>
          {loading ? (
            <SkeletonBlock h={28} w={60} />
          ) : (
            <div className={styles.kv}>{kpis?.totalNotes ?? 0}</div>
          )}
          <div className={styles.ks}>
            {kpis?.notesThisWeek ?? 0} new this week
          </div>
        </div>

        {/* Streak */}
        <div className={styles.streakKpi}>
          <div className={styles.streakLabel}>Streak days</div>
          <div className={styles.streakNum}>{streak}</div>
          <div className={styles.streakNote}>{getStreakMessage(streak)}</div>
        </div>
      </div>
    </div>
  );
}

function Section2Chart({
  chartData,
  statusDistribution,
  range,
  onRangeChange,
  loading,
}) {
  const lineRef = useRef(null);
  const lineChartRef = useRef(null);

  const RANGE_MAP = { weekly: "W", monthly: "M", yearly: "Y" };
  const activeKey = RANGE_MAP[range] || "W";

  useChartJs(
    (Chart) => {
      if (!lineRef.current || !chartData?.length) return;
      if (lineChartRef.current) lineChartRef.current.destroy();

      const labels = chartData.map((d) => {
        const date = new Date(d.date);
        if (range === "weekly")
          return date.toLocaleDateString([], { weekday: "short" });
        if (range === "monthly")
          return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
        return date.toLocaleDateString([], { month: "short", year: "2-digit" });
      });

      lineChartRef.current = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Completed",
              data: chartData.map((d) => d.completed),
              borderColor: "#1D9E75",
              backgroundColor: "rgba(29,158,117,.08)",
              tension: 0.35,
              fill: true,
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: "#1D9E75",
            },
            {
              label: "Created",
              data: chartData.map((d) => d.total),
              borderColor: "#85B7EB",
              backgroundColor: "rgba(133,183,235,.07)",
              tension: 0.35,
              fill: true,
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: "#85B7EB",
              borderDash: [4, 3],
            },
            {
              label: "Overdue",
              data: chartData.map((d) => d.overdue),
              borderColor: "#E24B4A",
              backgroundColor: "rgba(226,75,74,.06)",
              tension: 0.35,
              fill: true,
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: "#E24B4A",
              borderDash: [2, 2],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          animation: { duration: 350 },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#888780", font: { size: 11 }, maxTicksLimit: 8 },
            },
            y: {
              grid: { color: "rgba(136,135,128,.15)" },
              ticks: { color: "#888780", font: { size: 11 } },
              beginAtZero: true,
            },
          },
        },
      });
    },
    [chartData, range]
  );

  // SVG ring values from statusDistribution
  const sd = statusDistribution || {};
  const total =
    (sd.completed || 0) +
    (sd.inProgress || 0) +
    (sd.pending || 0) +
    (sd.overdue || 0) +
    (sd.cancelled || 0);
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  // Build ring segments
  const segments = [
    { color: "#1D9E75", value: sd.completed || 0 },
    { color: "#378ADD", value: sd.inProgress || 0 },
    { color: "#EF9F27", value: sd.pending || 0 },
    { color: "#E24B4A", value: sd.overdue || 0 },
    { color: "#888780", value: sd.cancelled || 0 },
  ];
  const circumference = 2 * Math.PI * 34; // r=34
  let offset = 53; // start offset (top)
  const ringSegments = segments.map((s) => {
    const dash = total > 0 ? (s.value / total) * circumference : 0;
    const seg = { ...s, dash, offset: -offset };
    offset += dash;
    return seg;
  });

  return (
    <div className={styles.sec}>
      <div className={styles.secLabel}>Task completion &amp; status</div>
      <div className={styles.g2}>
        {/* Line chart */}
        <div className={styles.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div className={styles.ct} style={{ marginBottom: 0 }}>
              Tasks completed
            </div>
            <div className={styles.periodToggle}>
              {["W", "M", "Y"].map((k) => {
                const rangeMap = { W: "weekly", M: "monthly", Y: "yearly" };
                return (
                  <span
                    key={k}
                    className={`${styles.pt}${
                      activeKey === k ? ` ${styles.on}` : ""
                    }`}
                    onClick={() => onRangeChange(rangeMap[k])}
                  >
                    {k === "W" ? "Weekly" : k === "M" ? "Monthly" : "Yearly"}
                  </span>
                );
              })}
            </div>
          </div>
          <div className={styles.leg}>
            <span>
              <span className={styles.lsq} style={{ background: "#1D9E75" }} />
              Completed
            </span>
            <span>
              <span
                className={styles.lsq}
                style={{ background: "#85B7EB", border: "0.5px solid #85B7EB" }}
              />
              Created
            </span>
            <span>
              <span className={styles.lsq} style={{ background: "#E24B4A" }} />
              Overdue
            </span>
          </div>
          <div style={{ position: "relative", width: "100%", height: 180 }}>
            {loading ? (
              <SkeletonBlock h={180} radius={8} />
            ) : (
              <canvas
                ref={lineRef}
                role="img"
                aria-label="Line chart of tasks completed, created, and overdue"
              >
                Task line chart
              </canvas>
            )}
          </div>
        </div>

        {/* Status ring */}
        <div className={styles.card}>
          <div className={styles.ct}>Status distribution</div>
          <div className={styles.ringWrap}>
            <svg
              width={100}
              height={100}
              viewBox="0 0 90 90"
              style={{ flexShrink: 0 }}
            >
              <circle
                cx={45}
                cy={45}
                r={34}
                fill="none"
                stroke="#EAF3DE"
                strokeWidth={11}
              />
              {ringSegments.map((s, i) => (
                <circle
                  key={i}
                  cx={45}
                  cy={45}
                  r={34}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={11}
                  strokeDasharray={`${s.dash} ${circumference}`}
                  strokeDashoffset={s.offset}
                  transform="rotate(-90 45 45)"
                />
              ))}
              <text
                x={45}
                y={43}
                textAnchor="middle"
                fontSize={14}
                fontWeight={500}
                fill="#1D9E75"
              >
                {pct(sd.completed || 0)}%
              </text>
              <text
                x={45}
                y={57}
                textAnchor="middle"
                fontSize={9}
                fill="#888780"
              >
                done
              </text>
            </svg>
            <div className={styles.ringLegend}>
              {[
                {
                  color: "#1D9E75",
                  label: "Completed",
                  val: sd.completed || 0,
                },
                {
                  color: "#378ADD",
                  label: "In progress",
                  val: sd.inProgress || 0,
                },
                { color: "#EF9F27", label: "Pending", val: sd.pending || 0 },
                { color: "#E24B4A", label: "Overdue", val: sd.overdue || 0 },
                {
                  color: "#888780",
                  label: "Cancelled",
                  val: sd.cancelled || 0,
                },
              ].map((r) => (
                <div key={r.label} className={styles.rl}>
                  <span
                    className={styles.lsq}
                    style={{ background: r.color }}
                  />
                  {r.label}
                  <span className={styles.rlVal}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section3Priority({ priorityBreakdown, notesByCategory, loading }) {
  const priorityChartRef = useRef(null);
  const notesChartRef = useRef(null);
  const priorityInstance = useRef(null);
  const notesInstance = useRef(null);

  const pb = priorityBreakdown || {};
  const maxPriority = Math.max(
    pb.high || 0,
    pb.medium || 0,
    pb.low || 0,
    pb.none || 0,
    1
  );

  const barPriorities = [
    {
      key: "high",
      label: "High",
      color: "#D85A30",
      badgeCls: styles.bHigh,
      bLabel: "High",
    },
    {
      key: "medium",
      label: "Medium",
      color: "#EF9F27",
      badgeCls: styles.bMed,
      bLabel: "Med",
    },
    {
      key: "low",
      label: "Low",
      color: "#1D9E75",
      badgeCls: styles.bLow,
      bLabel: "Low",
    },
    { key: "none", label: "None", color: "#888780", badgeCls: "", bLabel: "—" },
  ];

  // Build notes categories
  const rawNotesCats = notesByCategory || {};
  const notesCatEntries = Object.entries(rawNotesCats).sort(
    (a, b) => b[1] - a[1]
  );
  const totalNotesCats = notesCatEntries.reduce((s, [, v]) => s + v, 0);
  const notesColors = notesCatEntries.map(([cat], i) => {
    return (
      NOTE_CATEGORY_COLORS[cat]?.dot ||
      FALLBACK_PALETTE[i % FALLBACK_PALETTE.length] ||
      "#888780"
    );
  });

  useChartJs(
    (Chart) => {
      // Priority horizontal bar
      if (priorityChartRef.current) {
        if (priorityInstance.current) priorityInstance.current.destroy();
        priorityInstance.current = new Chart(priorityChartRef.current, {
          type: "bar",
          data: {
            labels: ["High", "Medium", "Low"],
            datasets: [
              {
                data: [pb.high || 0, pb.medium || 0, pb.low || 0, pb.none || 0],
                backgroundColor: ["#D85A30", "#EF9F27", "#1D9E75", "#888780"],
                borderRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            animation: { duration: 350 },
            indexAxis: "y",
            scales: {
              x: {
                grid: { color: "rgba(136,135,128,.15)" },
                ticks: { color: "#888780", font: { size: 10 } },
                beginAtZero: true,
              },
              y: {
                grid: { display: false },
                ticks: { color: "#888780", font: { size: 10 } },
              },
            },
          },
        });
      }

      // Notes doughnut
      if (notesChartRef.current && notesCatEntries.length > 0) {
        if (notesInstance.current) notesInstance.current.destroy();
        notesInstance.current = new Chart(notesChartRef.current, {
          type: "doughnut",
          data: {
            labels: notesCatEntries.map(([k]) => k),
            datasets: [
              {
                data: notesCatEntries.map(([, v]) => v),
                backgroundColor: notesColors,
                borderWidth: 0,
                hoverOffset: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",
            plugins: { legend: { display: false } },
            animation: { duration: 350 },
          },
        });
      }
    },
    [priorityBreakdown, notesByCategory]
  );

  return (
    <div className={styles.sec}>
      <div className={styles.secLabel}>Priority &amp; notes</div>
      <div className={styles.g2}>
        {/* Priority */}
        <div className={styles.card}>
          <div className={styles.ct}>Task priority breakdown</div>
          {barPriorities.map(({ key, label, color, badgeCls, bLabel }) => (
            <div key={key} className={styles.barRow}>
              <span className={styles.barLabel}>{label}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${Math.round(
                      ((pb[key] || 0) / maxPriority) * 100
                    )}%`,
                    background: color,
                  }}
                />
              </div>
              <span className={styles.barVal}>{pb[key] || 0}</span>
              {badgeCls ? (
                <span
                  className={`${styles.badge} ${badgeCls}`}
                  style={{ marginLeft: 4 }}
                >
                  {bLabel}
                </span>
              ) : (
                <span
                  style={{
                    marginLeft: 4,
                    fontSize: 11,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  —
                </span>
              )}
            </div>
          ))}
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "0.5px solid var(--color-border-tertiary)",
              position: "relative",
              height: 100,
            }}
          >
            {loading ? (
              <SkeletonBlock h={100} radius={8} />
            ) : (
              <canvas
                ref={priorityChartRef}
                role="img"
                aria-label="Horizontal bar chart of task priority distribution"
              >
                Priority chart
              </canvas>
            )}
          </div>
        </div>

        {/* Notes by category */}
        <div className={styles.card}>
          <div className={styles.ct}>Notes by category</div>

          {/* TAG PILLS SECTION */}
          <div
            style={{
              marginBottom: 15,
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              lineHeight: 1.8,
            }}
          >
            {notesCatEntries.length === 0 ? (
              <span
                style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
              >
                No notes yet
              </span>
            ) : (
              notesCatEntries.map(([cat, count], i) => {
                const fallbackDot =
                  FALLBACK_PALETTE[i % FALLBACK_PALETTE.length];
                const colors = NOTE_CATEGORY_COLORS[cat] || {
                  bg: fallbackDot + "22",
                  text: fallbackDot,
                  dot: fallbackDot,
                };
                return (
                  <span
                    key={cat}
                    className={`${styles.tagPill} capitalize`}
                    style={{
                      background: colors.bg,
                      color: colors.text,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {cat}
                    <span
                      className={styles.tagCount}
                      style={{ opacity: 0.7, fontWeight: "bold" }}
                    >
                      {count}
                    </span>
                  </span>
                );
              })
            )}
          </div>

          {/* PERCENTAGE LEGEND */}
          <div
            className={styles.leg}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              fontSize: "11px",
              marginBottom: "15px",
            }}
          >
            {notesCatEntries.slice(0, 5).map(([cat, count], i) => {
              const pctVal =
                totalNotesCats > 0
                  ? Math.round((count / totalNotesCats) * 100)
                  : 0;
              const dotColor =
                NOTE_CATEGORY_COLORS[cat]?.dot ||
                FALLBACK_PALETTE[i % FALLBACK_PALETTE.length];
              return (
                <span
                  key={cat}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    className={styles.lsq}
                    style={{
                      background: dotColor,
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      display: "inline-block",
                    }}
                  />
                  <span className="capitalize">{cat}</span>
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {pctVal}%
                  </span>
                </span>
              );
            })}
          </div>

          {/* CHART CANVAS AREA */}
          <div style={{ position: "relative", width: "100%", height: 130 }}>
            {loading ? (
              <SkeletonBlock h={130} radius={8} />
            ) : notesCatEntries.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#ccc",
                  border: "1px dashed #eee",
                  borderRadius: "8px",
                }}
              >
                Chart unavailable
              </div>
            ) : (
              <canvas ref={notesChartRef} aria-label="Notes by category chart">
                Notes category chart
              </canvas>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section4Recent({ recentTasks, recentNotes, loading }) {
  const [feed, setFeed] = useState("tasks");

  const tasks = (recentTasks || []).slice(0, 6);
  const notes = (recentNotes || []).slice(0, 6);

  return (
    <div className={styles.sec}>
      <div className={styles.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div className={styles.ct} style={{ marginBottom: 0 }}>
            Recent activity
          </div>
          <div className={styles.toggleRow}>
            <span
              className={`${styles.tog}${
                feed === "tasks" ? ` ${styles.on}` : ""
              }`}
              onClick={() => setFeed("tasks")}
            >
              Tasks
            </span>
            <div className={styles.divider} />
            <span
              className={`${styles.tog}${
                feed === "notes" ? ` ${styles.on}` : ""
              }`}
              onClick={() => setFeed("notes")}
            >
              Notes
            </span>
          </div>
        </div>

        {/* Tasks feed */}
        {feed === "tasks" && (
          <div className={styles.feedGrid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.feedItem}>
                  <SkeletonBlock h={14} w="100%" />
                </div>
              ))
            ) : tasks.length === 0 ? (
              <div
                style={{
                  gridColumn: "span 2",
                  textAlign: "center",
                  padding: "24px 0",
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                }}
              >
                No recent tasks
              </div>
            ) : (
              tasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== "completed";
                const effectiveStatus = isOverdue ? "overdue" : task.status;
                const badge =
                  STATUS_BADGE[effectiveStatus] || STATUS_BADGE.pending;
                const dot = STATUS_COLORS[effectiveStatus] || "#888780";
                const due = formatDueDate(task.dueDate);
                return (
                  <div key={task.id} className={styles.feedItem}>
                    <div
                      className={styles.feedDot}
                      style={{ background: dot }}
                    />
                    <div className={styles.feedBody}>
                      <div className={styles.feedTitle}>{task.title}</div>
                      <div className={styles.feedSub}>
                        <span className={`${styles.badge} ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {(task.category || due) && (
                          <span style={{ marginLeft: 4 }}>
                            {task.category && `· ${task.category}`}
                            {due && ` · ${due}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.feedTime}>
                      {formatRelativeTime(task.updatedAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Notes feed */}
        {feed === "notes" && (
          <div className={styles.feedGrid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.feedItem}>
                  <SkeletonBlock h={14} w="100%" />
                </div>
              ))
            ) : notes.length === 0 ? (
              <div
                style={{
                  gridColumn: "span 2",
                  textAlign: "center",
                  padding: "24px 0",
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                }}
              >
                No recent notes
              </div>
            ) : (
              notes.map((note, i) => {
                const fallbackDot =
                  FALLBACK_PALETTE[i % FALLBACK_PALETTE.length];

                const colors = NOTE_CATEGORY_COLORS[note.category] || {
                  bg: fallbackDot + "22", // ~13% opacity hex
                  text: fallbackDot,
                  dot: fallbackDot,
                };
                return (
                  <div key={note.id} className={styles.feedItem}>
                    <div
                      className={styles.feedDot}
                      style={{ background: colors.dot }}
                    />
                    <div className={styles.feedBody}>
                      <div className={styles.feedTitle}>{note.title}</div>
                      <div className={styles.feedSub}>
                        <div className={styles.feedSnip}>
                          {note.snippet && (
                            <span style={{ marginLeft: 4 }}>
                              {note.snippet}
                            </span>
                          )}
                        </div>
                        {note.category.map((tag, i) => (
                          <span
                            className={styles.tagPill}
                            key={i}
                            style={{
                              background: colors.bg,
                              color: colors.text,
                              padding: "1px 6px",
                              margin: 0,
                              fontSize: 11,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.feedTime}>
                      {formatRelativeTime(note.updatedAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (r) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${r}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  const handleRangeChange = (r) => {
    setRange(r);
  };

  return (
    <>
      <div className="">
        <div className={styles.dash}>
          {error && (
            <div
              style={{
                background: "#FCEBEB",
                color: "#791F1F",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              Failed to load analytics: {error}
            </div>
          )}

          <Section1Kpis kpis={data?.kpis} loading={loading} />

          <Section2Chart
            chartData={data?.chartData}
            statusDistribution={data?.statusDistribution}
            range={range}
            onRangeChange={handleRangeChange}
            loading={loading}
          />

          <Section3Priority
            priorityBreakdown={data?.priorityBreakdown}
            notesByCategory={data?.notesByCategory}
            loading={loading}
          />

          <Section4Recent
            recentTasks={data?.recentTasks}
            recentNotes={data?.recentNotes}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
