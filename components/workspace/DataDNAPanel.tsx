"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Database, Activity, GitBranch, ArrowUpRight, Fingerprint,
    Clock, BarChart2, AlertTriangle, Lightbulb, Search,
    TrendingUp, Layers, ChevronRight, Copy, Check
} from "lucide-react";
import type { DataDNA } from "@/store/dataStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataDNAPanelProps {
    dataDNA: DataDNA;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const T = {
    bg: "var(--bg)",
    fg: "var(--fg)",
    loaderBg: "var(--loader-bg)",
    stroke: "var(--stroke)",
    strokeMd: "rgba(0,0,0,0.2)",
    muted: "var(--text-muted)",
    mutedMd: "var(--text-subtle)",
    accent: "var(--accent)",
    success: "var(--success)",
    warning: "var(--warning)",
    error: "var(--error)",
    info: "var(--info)",
};

// ─── Type / Role Maps ─────────────────────────────────────────────────────────

const TYPE_DOTS: Record<string, string> = {
    numeric: "var(--info)",
    categorical: "var(--accent)",
    datetime: "var(--warning)",
    boolean: "var(--success)",
    categorical_numeric: "var(--error)",
};

const TYPE_LABEL: Record<string, string> = {
    numeric: "NUM",
    categorical: "CAT",
    datetime: "DATE",
    boolean: "BOOL",
    categorical_numeric: "C.NUM",
};

const ROLE_BG: Record<string, { bg: string; color: string }> = {
    target_metric: { bg: "rgba(185,28,28,0.08)", color: "#b91c1c" },
    identifier: { bg: "rgba(0,0,0,0.06)", color: T.mutedMd },
    dimension: { bg: "rgba(79,70,229,0.08)", color: "#4f46e5" },
    temporal: { bg: "rgba(215,119,6,0.1)", color: "#d97706" },
    financial_metric: { bg: "rgba(45,80,22,0.08)", color: "#2d5016" },
    count_metric: { bg: "rgba(30,64,175,0.08)", color: "#1e40af" },
    measure: { bg: "rgba(79,70,229,0.06)", color: "#4f46e5" },
    binary_flag: { bg: "rgba(215,119,6,0.08)", color: "#d97706" },
};

// ─── Micro Components ─────────────────────────────────────────────────────────

const Pill = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
    <span style={{
        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", padding: "2px 7px", borderRadius: 9999,
        background: bg, color, display: "inline-block", whiteSpace: "nowrap",
    }}>{label}</span>
);

const Bar = ({ value, max = 100, color = T.fg, height = 3 }: {
    value: number; max?: number; color?: string; height?: number;
}) => {
    const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
    return (
        <div style={{ background: T.stroke, borderRadius: 99, height, overflow: "hidden", flex: 1 }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: "100%", background: color, borderRadius: 99 }}
            />
        </div>
    );
};

const Divider = () => (
    <div style={{ height: 1, background: T.stroke, margin: "0 1.5rem" }} />
);

const SectionHeader = ({ icon: Icon, title, count }: {
    icon: React.ComponentType<any>; title: string; count?: string | number;
}) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Icon size={13} style={{ color: T.muted, flexShrink: 0 }} />
        <span style={{
            fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.07em", color: T.muted, flex: 1,
        }}>{title}</span>
        {count !== undefined && (
            <span style={{
                fontSize: "0.65rem", fontWeight: 600, color: T.muted,
                background: T.loaderBg, padding: "1px 6px", borderRadius: 4,
            }}>{count}</span>
        )}
    </div>
);

const Accordion = ({
    title, children, accent = T.fg, defaultOpen = false,
}: {
    title: string; children: React.ReactNode; accent?: string; defaultOpen?: boolean;
}) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ borderBottom: `1px solid ${T.stroke}` }}>
            <button onClick={() => setOpen(o => !o)} style={{
                width: "100%", background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.6rem 0", textAlign: "left",
            }}>
                <motion.span
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: T.muted, display: "flex", flexShrink: 0 }}
                >
                    <ChevronRight size={12} />
                </motion.span>
                <span style={{
                    fontSize: "0.75rem", fontWeight: 600, color: open ? T.fg : T.muted,
                    flex: 1, transition: "color 0.2s",
                }}>{title}</span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                    >
                        <div style={{ paddingBottom: "0.75rem" }}>{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TABS = [
    { id: "overview", Icon: Database, label: "Overview" },
    { id: "columns", Icon: Fingerprint, label: "Columns" },
    { id: "health", Icon: Activity, label: "Health" },
    { id: "correlations", Icon: GitBranch, label: "Corr" },
    { id: "outliers", Icon: AlertTriangle, label: "Outliers" },
    { id: "patterns", Icon: Lightbulb, label: "Patterns" },
    { id: "segments", Icon: Layers, label: "Segments" },
    { id: "baselines", Icon: BarChart2, label: "Baselines" },
    { id: "datetime", Icon: Clock, label: "Time" },
    { id: "queries", Icon: Search, label: "Queries" },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Section: Overview ────────────────────────────────────────────────────────

function OverviewSection({ d }: { d: DataDNA }) {
    const h = (d.health || {}) as any;
    const gradeColor = ({ A: T.success, B: "#16803c", C: T.warning, D: "#ea580c", F: T.error })[h.grade as string] ?? T.fg;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Top KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                {[
                    { label: "Rows", value: (d.rowCount || 0).toLocaleString() },
                    { label: "Columns", value: d.columnCount || 0 },
                    { label: "Grade", value: h.grade || "—", color: gradeColor },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        background: T.loaderBg, borderRadius: "0.75rem",
                        padding: "0.875rem 1rem",
                        border: `1px solid ${T.stroke}`,
                    }}>
                        <div style={{
                            fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: "0.07em", color: T.muted, marginBottom: "0.375rem"
                        }}>{label}</div>
                        <div style={{
                            fontSize: "1.375rem", fontWeight: 600, letterSpacing: "-0.02em",
                            color: color ?? T.fg, lineHeight: 1
                        }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Health bar */}
            <div style={{
                background: T.loaderBg, borderRadius: "0.75rem", padding: "1rem",
                border: `1px solid ${T.stroke}`,
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                    <span style={{
                        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: T.muted
                    }}>Health Score</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: gradeColor }}>{h.score}/100</span>
                </div>
                <Bar value={h.score || 0} max={100} color={gradeColor} height={5} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.65rem", color: T.muted }}>
                        Completeness <b style={{ color: T.fg }}>{h.completeness}%</b>
                    </span>
                    <span style={{ fontSize: "0.65rem", color: T.muted }}>
                        Dupes <b style={{ color: h.duplicatePct > 1 ? T.warning : T.fg }}>
                            {h.duplicatePct}%
                        </b>
                    </span>
                </div>
            </div>

            {/* Warnings */}
            {h.highMissingCols?.length > 0 && (
                <div style={{
                    background: "rgba(217,119,6,0.07)", border: `1px solid rgba(217,119,6,0.25)`,
                    borderRadius: "0.75rem", padding: "0.75rem 1rem",
                    display: "flex", gap: "0.5rem", alignItems: "flex-start",
                }}>
                    <AlertTriangle size={13} style={{ color: T.warning, flexShrink: 0, marginTop: 1 }} />
                    <div>
                        <div style={{
                            fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: "0.06em", color: T.warning, marginBottom: "0.25rem"
                        }}>
                            High Missing Columns
                        </div>
                        <div style={{ fontSize: "0.7rem", color: T.mutedMd }}>
                            {h.highMissingCols.join(", ")}
                        </div>
                    </div>
                </div>
            )}

            {/* Column type breakdown */}
            {d.columns?.length > 0 && (() => {
                const counts: Record<string, number> = {};
                d.columns.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
                return (
                    <div>
                        <div style={{
                            fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: "0.07em", color: T.muted, marginBottom: "0.5rem"
                        }}>
                            Column Types
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                            {Object.entries(counts).map(([type, count]) => (
                                <div key={type} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                    <div style={{
                                        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                                        background: TYPE_DOTS[type] ?? T.muted,
                                    }} />
                                    <span style={{ fontSize: "0.7rem", color: T.mutedMd, flex: 1, textTransform: "capitalize" }}>{type}</span>
                                    <Bar value={count} max={d.columnCount} color={TYPE_DOTS[type] ?? T.muted} height={3} />
                                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: T.fg, width: 20, textAlign: "right" }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

// ─── Section: Columns ─────────────────────────────────────────────────────────

function NumericStats({ col }: { col: any }) {
    const pairs = [
        ["Mean", col.mean], ["Median", col.median],
        ["Std", col.std], ["Min", col.min],
        ["Max", col.max], ["IQR", col.iqr],
    ];
    return (
        <div style={{ paddingTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.375rem" }}>
                {pairs.map(([k, v]) => (
                    <div key={k as string} style={{
                        background: T.loaderBg, borderRadius: "0.5rem",
                        padding: "0.4rem 0.5rem"
                    }}>
                        <div style={{
                            fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.06em",
                            color: T.muted
                        }}>{k}</div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: T.fg, marginTop: 1 }}>
                            {v !== undefined && v !== null
                                ? Number(v).toLocaleString(undefined, { maximumFractionDigits: 3 })
                                : "—"}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.65rem", color: T.muted }}>
                <span>Skew: <b style={{ color: Math.abs(col.skewness) > 2 ? T.warning : T.fg }}>
                    {col.skewness?.toFixed(2)}</b>
                </span>
                <span>Kurt: <b style={{ color: T.fg }}>{col.kurtosis?.toFixed(2)}</b></span>
                {col.zerosPct > 0 && <span>Zeros: <b style={{ color: T.fg }}>{col.zerosPct}%</b></span>}
            </div>
            {col.outlierCountIqr > 0 && (
                <div style={{
                    background: "rgba(185,28,28,0.06)", border: `1px solid rgba(185,28,28,0.18)`,
                    borderRadius: "0.5rem", padding: "0.375rem 0.625rem",
                    fontSize: "0.68rem", color: T.error, display: "flex", alignItems: "center", gap: "0.375rem",
                }}>
                    <AlertTriangle size={10} />
                    {col.outlierCountIqr} outliers ({col.outlierPct}% of data)
                </div>
            )}
            {/* Mini percentile rail */}
            <div>
                <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "0.55rem", color: T.muted, marginBottom: 3
                }}>
                    {["min", "p25", "median", "p75", "max"].map(k => (
                        <span key={k}>{k}</span>
                    ))}
                </div>
                <div style={{ position: "relative", height: 6, background: T.stroke, borderRadius: 99, overflow: "hidden" }}>
                    {["p25", "median", "p75"].map((k, i) => {
                        const range = (col.max || 0) - (col.min || 0);
                        if (!range) return null;
                        const pct = ((col[k] - col.min) / range) * 100;
                        const colors = ["var(--accent)", "var(--accent)", "var(--accent)"];
                        return (
                            <div key={k} style={{
                                position: "absolute", left: 0, width: `${pct}%`,
                                height: "100%", background: colors[i], borderRadius: 99,
                            }} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function CatStats({ col }: { col: any }) {
    const maxCount = col.top_value_count || 1;
    return (
        <div style={{ paddingTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {col.topValues?.map((v: string, i: number) => (
                <div key={v} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.6rem", color: T.muted, width: 14, flexShrink: 0 }}>#{i + 1}</span>
                    <span style={{
                        fontSize: "0.7rem", color: T.fg, flex: 1, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>{v}</span>
                    <Bar value={i === 0 ? col.topValuePct : col.topValuePct / (i + 1.5)}
                        max={100} color="var(--accent)" height={3} />
                </div>
            ))}
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.65rem", color: T.muted, paddingTop: "0.25rem" }}>
                <span>Entropy: <b style={{ color: T.fg }}>{col.entropy?.toFixed(2)}</b></span>
                {col.isDominated && <Pill label="Dominated" color={T.error} bg="rgba(185,28,28,0.08)" />}
                {col.rareValues > 0 && <span>Rare: <b style={{ color: T.fg }}>{col.rareValues}</b></span>}
            </div>
        </div>
    );
}

function DateStats({ col }: { col: any }) {
    return (
        <div style={{ paddingTop: "0.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem" }}>
            {[
                ["From", col.minDate?.split("T")[0]],
                ["To", col.maxDate?.split("T")[0]],
                ["Span", col.spanDays ? `${col.spanDays}d` : "—"],
                ["Peak Hour", col.peakHour !== undefined ? `${col.peakHour}:00` : "—"],
                ["Peak Day", col.peakDay],
                ["Med Gap", col.medianGapDays ? `${col.medianGapDays}d` : "—"],
            ].map(([k, v]) => (
                <div key={k as string} style={{
                    background: T.loaderBg, borderRadius: "0.5rem",
                    padding: "0.4rem 0.5rem"
                }}>
                    <div style={{
                        fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.06em",
                        color: T.muted
                    }}>{k}</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: T.fg, marginTop: 1 }}>{v || "—"}</div>
                </div>
            ))}
        </div>
    );
}

function ColumnsSection({ d }: { d: DataDNA }) {
    const cols = d.columns || [];
    const types = ["all", ...Array.from(new Set(cols.map((c: any) => c.type)))];
    const [filter, setFilter] = useState("all");

    const filtered = filter === "all" ? cols : cols.filter((c: any) => c.type === filter);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                {types.map(t => (
                    <button key={t} onClick={() => setFilter(t)} style={{
                        padding: "3px 10px", borderRadius: 9999, cursor: "pointer",
                        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                        border: `1px solid ${filter === t ? T.fg : T.stroke}`,
                        background: filter === t ? T.fg : "transparent",
                        color: filter === t ? T.bg : T.muted,
                        transition: "all 0.15s",
                    }}>{t}</button>
                ))}
            </div>

            {/* Cards */}
            {filtered.map((col: any) => {
                const dotColor = TYPE_DOTS[col.type] ?? T.muted;
                const roleStyle = ROLE_BG[col.suggested_role] ?? { bg: T.loaderBg, color: T.muted };
                return (
                    <Accordion key={col.name} title={col.name}>
                        {/* Card header meta */}
                        <div style={{
                            display: "flex", gap: "0.375rem", marginBottom: "0.375rem",
                            alignItems: "center", flexWrap: "wrap"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                                <span style={{
                                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em",
                                    color: dotColor, textTransform: "uppercase",
                                    background: dotColor + "15", padding: "1px 6px", borderRadius: 4,
                                }}>{TYPE_LABEL[col.type] ?? col.type}</span>
                            </div>
                            <Pill
                                label={col.suggested_role?.replace(/_/g, " ") || "—"}
                                color={roleStyle.color}
                                bg={roleStyle.bg}
                            />
                            <span style={{
                                fontSize: "0.65rem", fontFamily: "monospace",
                                color: T.muted, background: T.loaderBg,
                                padding: "1px 5px", borderRadius: 4
                            }}>{col.dtype}</span>
                            <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: T.muted }}>
                                {col.uniqueCount?.toLocaleString()} unique
                            </span>
                        </div>

                        {/* Null bar */}
                        {col.nullPercentage > 0 && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                marginBottom: "0.375rem"
                            }}>
                                <span style={{ fontSize: "0.6rem", color: T.muted, width: 40 }}>
                                    nulls
                                </span>
                                <Bar value={col.nullPercentage} max={100}
                                    color={col.nullPercentage > 30 ? T.error : col.nullPercentage > 10 ? T.warning : T.mutedMd}
                                    height={3} />
                                <span style={{
                                    fontSize: "0.65rem", fontWeight: 600,
                                    color: col.nullPercentage > 30 ? T.error : T.muted, width: 32, textAlign: "right"
                                }}>
                                    {col.nullPercentage}%
                                </span>
                            </div>
                        )}

                        {col.type === "numeric" && <NumericStats col={col} />}
                        {(col.type === "categorical" || col.type === "boolean") && <CatStats col={col} />}
                        {col.type === "datetime" && <DateStats col={col} />}
                        {col.type === "categorical_numeric" && <CatStats col={col} />}
                    </Accordion>
                );
            })}
        </div>
    );
}

// ─── Section: Health ──────────────────────────────────────────────────────────

function HealthSection({ d }: { d: DataDNA }) {
    const h = (d.health || {}) as any;
    const ms = (d.missingSummary || {}) as any;
    const byCol = h.missingByCol || {};

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {[
                    { l: "Missing Cells", v: h.missingCells?.toLocaleString() ?? "0", warn: (h.missingCells || 0) > 0 },
                    { l: "Duplicate Rows", v: h.duplicateRows?.toLocaleString() ?? "0", warn: (h.duplicateRows || 0) > 0 },
                    { l: "Completeness", v: `${h.completeness ?? 0}%`, warn: false },
                    { l: "Const. Cols", v: h.constantCols?.length ?? 0, warn: (h.constantCols?.length || 0) > 0 },
                ].map(({ l, v, warn }) => (
                    <div key={l} style={{
                        background: T.loaderBg, borderRadius: "0.75rem",
                        padding: "0.875rem 1rem", border: `1px solid ${T.stroke}`,
                    }}>
                        <div style={{
                            fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: "0.07em", color: T.muted, marginBottom: "0.25rem"
                        }}>{l}</div>
                        <div style={{ fontSize: "1.125rem", fontWeight: 600, color: warn ? T.warning : T.fg }}>{v}</div>
                    </div>
                ))}
            </div>

            {Object.keys(byCol).length > 0 && (
                <div>
                    <div style={{
                        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: T.muted, marginBottom: "0.625rem"
                    }}>
                        Missing by Column
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {Object.entries(byCol)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([col, pct]) => (
                                <div key={col} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                    <span style={{
                                        fontSize: "0.7rem", color: T.mutedMd, flex: 1,
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                    }}>{col}</span>
                                    <Bar value={pct as number} max={100}
                                        color={(pct as number) > 50 ? T.error : (pct as number) > 20 ? T.warning : T.mutedMd}
                                        height={4} />
                                    <span style={{
                                        fontSize: "0.65rem", fontWeight: 600,
                                        color: (pct as number) > 30 ? T.warning : T.muted,
                                        width: 36, textAlign: "right"
                                    }}>{pct as number}%</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {ms.coMissingPairs?.length > 0 && (
                <div style={{
                    background: T.loaderBg, borderRadius: "0.75rem",
                    padding: "1rem", border: `1px solid ${T.stroke}`
                }}>
                    <div style={{
                        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: T.muted, marginBottom: "0.625rem"
                    }}>
                        Co-missing Pairs
                    </div>
                    {ms.coMissingPairs.map((p: any, i: number) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", padding: "0.375rem 0",
                            borderBottom: i < ms.coMissingPairs.length - 1 ? `1px solid ${T.stroke}` : "none"
                        }}>
                            <span style={{ fontSize: "0.7rem", color: T.mutedMd }}>
                                {p.colA} + {p.colB}
                            </span>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: T.warning }}>
                                {p.coMissingCount}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {h.constantCols?.length > 0 && (
                <div style={{
                    background: "rgba(217,119,6,0.06)", borderRadius: "0.75rem",
                    padding: "0.875rem 1rem", border: `1px solid rgba(217,119,6,0.2)`
                }}>
                    <div style={{
                        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: T.warning, marginBottom: "0.5rem"
                    }}>
                        Constant Columns — Drop Candidates
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                        {h.constantCols.map((c: string) => (
                            <Pill key={c} label={c} color={T.warning} bg="rgba(217,119,6,0.1)" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Section: Correlations ────────────────────────────────────────────────────

function CorrelationsSection({ d }: { d: DataDNA }) {
    const corrs = d.correlations || [];
    if (!corrs.length) return <Empty msg="No significant correlations." />;

    const strengthColor = { strong: T.info, moderate: "#4f46e5", weak: T.muted };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {corrs.map((c: any, i: number) => {
                const abs = Math.abs(c.pearsonR);
                const sc = (strengthColor as any)[c.strength] ?? T.muted;
                const dirColor = c.direction === "positive" ? T.success : T.error;
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                            background: T.loaderBg, borderRadius: "0.75rem",
                            padding: "0.875rem 1rem", border: `1px solid ${T.stroke}`,
                            borderLeft: `3px solid ${sc}`,
                        }}
                    >
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", marginBottom: "0.625rem"
                        }}>
                            <div>
                                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: T.fg }}>{c.colA}</div>
                                <div style={{ fontSize: "0.65rem", color: T.muted }}>↕ {c.colB}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{
                                    fontSize: "1.25rem", fontWeight: 700, color: dirColor,
                                    lineHeight: 1, letterSpacing: "-0.02em"
                                }}>
                                    {c.pearsonR > 0 ? "+" : ""}{c.pearsonR}
                                </div>
                                <div style={{
                                    fontSize: "0.55rem", color: T.muted, textTransform: "uppercase",
                                    letterSpacing: "0.06em"
                                }}>Pearson r</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                            <Bar value={abs * 100} max={100} color={sc} height={3} />
                            <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                                <Pill label={c.strength} color={sc} bg={sc + "15"} />
                                {c.nonlinear && <Pill label="nonlinear" color={T.warning} bg="rgba(217,119,6,0.1)" />}
                            </div>
                        </div>
                        <div style={{ fontSize: "0.62rem", color: T.muted, marginTop: "0.375rem" }}>
                            Spearman: {c.spearmanR}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── Section: Outliers ────────────────────────────────────────────────────────

function OutliersSection({ d }: { d: DataDNA }) {
    const outliers = d.outlierSummary || [];
    if (!outliers.length) return <Empty msg="No significant outliers." />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {outliers.map((o: any, i: number) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                        background: "rgba(185,28,28,0.04)", borderRadius: "0.75rem",
                        padding: "0.875rem 1rem",
                        border: `1px solid rgba(185,28,28,0.15)`,
                    }}
                >
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: "0.5rem"
                    }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: T.fg }}>{o.column}</span>
                        <span style={{ fontSize: "1rem", fontWeight: 700, color: T.error }}>
                            {o.iqrOutlierPct}%
                        </span>
                    </div>
                    <Bar value={o.iqrOutlierPct} max={100} color={T.error} height={3} />
                    <div style={{
                        display: "flex", gap: "1rem", marginTop: "0.5rem",
                        fontSize: "0.65rem", color: T.muted
                    }}>
                        <span>IQR: <b style={{ color: T.fg }}>{o.iqrOutliers}</b></span>
                        <span>Extreme: <b style={{ color: T.fg }}>{o.extremeOutliers}</b></span>
                    </div>
                    <div style={{ fontSize: "0.62rem", color: T.muted, marginTop: "0.25rem" }}>
                        Fence [{o.lowerFence}, {o.upperFence}]
                        {o.minOutlier != null && ` · Range [${o.minOutlier}, ${o.maxOutlier}]`}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// ─── Section: Patterns ────────────────────────────────────────────────────────

function PatternsSection({ d }: { d: DataDNA }) {
    const patterns = d.patterns || [];
    const insights = d.accumulatedInsights || [];

    const icon = (p: string) => {
        if (p.includes("outlier") || p.includes("skew")) return "↘";
        if (p.includes("duplicate")) return "◈";
        if (p.includes("missing") || p.includes("null")) return "○";
        if (p.includes("correlation")) return "↔";
        if (p.includes("Peak") || p.includes("peak")) return "◎";
        if (p.includes("fail") || p.includes("error")) return "⚑";
        if (p.includes("success") || p.includes("complete")) return "✓";
        if (p.includes("cardinality")) return "⊞";
        if (p.includes("constant") || p.includes("variance")) return "⊝";
        return "→";
    };

    const isWarn = (p: string) =>
        p.includes("fail") || p.includes("error") || p.includes("missing") ||
        p.includes("outlier") || p.includes("duplicate");

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {patterns.map((p: string, i: number) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                        display: "flex", gap: "0.75rem", alignItems: "flex-start",
                        padding: "0.75rem 0.875rem",
                        background: isWarn(p) ? "rgba(217,119,6,0.05)" : T.loaderBg,
                        borderLeft: `3px solid ${isWarn(p) ? T.warning : T.stroke}`,
                        borderRadius: "0 0.5rem 0.5rem 0",
                        border: `1px solid ${isWarn(p) ? "rgba(217,119,6,0.2)" : T.stroke}`,
                        borderLeftWidth: 3,
                        borderLeftColor: isWarn(p) ? T.warning : T.fg,
                    }}
                >
                    <span style={{
                        fontSize: "0.75rem", color: isWarn(p) ? T.warning : T.muted,
                        flexShrink: 0, marginTop: 1, fontWeight: 700
                    }}>{icon(p)}</span>
                    <p style={{
                        margin: 0, fontSize: "0.72rem", color: T.mutedMd,
                        lineHeight: 1.55, fontFamily: "'PP Neue Montreal', system-ui, sans-serif"
                    }}>{p}</p>
                </motion.div>
            ))}

            {insights.length > 0 && (
                <>
                    <div style={{ height: 1, background: T.stroke, margin: "0.25rem 0" }} />
                    <div style={{
                        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: T.muted, margin: "0.25rem 0"
                    }}>
                        Accumulated Insights
                    </div>
                    {insights.map((p: string, i: number) => (
                        <div key={i} style={{
                            display: "flex", gap: "0.75rem", alignItems: "flex-start",
                            padding: "0.75rem 0.875rem",
                            background: "rgba(79,70,229,0.05)",
                            border: `1px solid rgba(79,70,229,0.15)`,
                            borderLeftColor: T.accent, borderLeftWidth: 3,
                            borderRadius: "0 0.5rem 0.5rem 0",
                        }}>
                            <TrendingUp size={12} style={{ color: T.accent, flexShrink: 0, marginTop: 2 }} />
                            <p style={{
                                margin: 0, fontSize: "0.72rem", color: T.mutedMd,
                                lineHeight: 1.55
                            }}>{p}</p>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

// ─── Section: Segments ────────────────────────────────────────────────────────

function SegmentsSection({ d }: { d: DataDNA }) {
    const segs = d.segmentBreakdown || [];
    if (!segs.length) return <Empty msg="No segment breakdowns available." />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {segs.map((seg: any, i: number) => {
                const maxMean = Math.max(...seg.data.map((r: any) => Math.abs(r.mean || 0)));
                return (
                    <Accordion key={i} title={`${seg.dimension} → ${seg.metric}`}>
                        <div style={{ paddingTop: "0.375rem" }}>
                            {seg.data.map((row: any, j: number) => (
                                <div key={j} style={{ marginBottom: "0.625rem" }}>
                                    <div style={{
                                        display: "flex", justifyContent: "space-between",
                                        marginBottom: "0.25rem"
                                    }}>
                                        <span style={{
                                            fontSize: "0.7rem", color: T.fg,
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            maxWidth: "65%"
                                        }}>{row[seg.dimension]}</span>
                                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: T.accent }}>
                                            {Number(row.mean)?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <Bar value={Math.abs(row.mean || 0)} max={maxMean || 1} color={T.accent} height={3} />
                                    <div style={{ fontSize: "0.58rem", color: T.muted, marginTop: 2 }}>
                                        n={row.count} · med={row.median}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Accordion>
                );
            })}
        </div>
    );
}

// ─── Section: Baselines ───────────────────────────────────────────────────────

function BaselinesSection({ d }: { d: DataDNA }) {
    const baselines = d.baselines || {};
    const rates = Object.entries(baselines).filter(([k]) => k.includes("__"));
    const numerics = Object.entries(baselines).filter(([k]) => !k.includes("__"));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {rates.length > 0 && (
                <div>
                    <div style={{
                        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: T.muted, marginBottom: "0.625rem"
                    }}>Status Rates</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                        {rates.map(([k, v]) => {
                            const isFailure = k.includes("failure");
                            const color = isFailure ? T.error : T.success;
                            return (
                                <div key={k} style={{
                                    background: color + "0d",
                                    border: `1px solid ${color}30`,
                                    borderRadius: "0.75rem", padding: "0.875rem 1rem",
                                }}>
                                    <div style={{
                                        fontSize: "0.58rem", textTransform: "uppercase",
                                        letterSpacing: "0.06em", color, opacity: 0.8, marginBottom: "0.375rem",
                                        lineHeight: 1.4
                                    }}>
                                        {k.replace(/__/g, " ").replace(/_/g, " ")}
                                    </div>
                                    <div style={{
                                        fontSize: "1.5rem", fontWeight: 700, color,
                                        letterSpacing: "-0.02em", lineHeight: 1
                                    }}>{v as number}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {numerics.length > 0 && (
                <div>
                    <div style={{
                        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: T.muted, marginBottom: "0.375rem"
                    }}>
                        Numeric Baselines
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
                        {numerics.map(([col, stats]) => (
                            <Accordion key={col} title={col}>
                                <div style={{
                                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                                    gap: "0.375rem", paddingTop: "0.375rem"
                                }}>
                                    {Object.entries(stats as Record<string, number>).map(([k, v]) => (
                                        <div key={k} style={{
                                            background: T.loaderBg, borderRadius: "0.5rem",
                                            padding: "0.4rem 0.5rem"
                                        }}>
                                            <div style={{
                                                fontSize: "0.55rem", textTransform: "uppercase",
                                                letterSpacing: "0.06em", color: T.muted
                                            }}>{k}</div>
                                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: T.accent, marginTop: 1 }}>
                                                {Number(v)?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Accordion>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Section: DateTime ────────────────────────────────────────────────────────

function DatetimeSection({ d }: { d: DataDNA }) {
    const dt = (d.datetimeInfo || {}) as any;
    if (!dt.column) return <Empty msg="No datetime column detected." />;

    const hourDist = dt.hourDistribution || {};
    const maxH = Math.max(1, ...Object.values(hourDist) as number[]);
    const dayDist = dt.dayDistribution || {};
    const maxD = Math.max(1, ...Object.values(dayDist) as number[]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                {[
                    { l: "Peak Hour", v: `${dt.peakHour}:00` },
                    { l: "Peak Day", v: dt.peakDay },
                    { l: "Span", v: `${dt.spanDays} days` },
                    { l: "Biz Hours", v: `${dt.businessHoursPct}%` },
                ].map(({ l, v }) => (
                    <div key={l} style={{
                        background: T.loaderBg, borderRadius: "0.75rem",
                        padding: "0.875rem 1rem", border: `1px solid ${T.stroke}`
                    }}>
                        <div style={{
                            fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: "0.07em", color: T.muted, marginBottom: "0.25rem"
                        }}>{l}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 600, color: T.fg }}>{v || "—"}</div>
                    </div>
                ))}
            </div>

            {/* Hourly distribution */}
            {Object.keys(hourDist).length > 0 && (
                <div style={{
                    background: T.loaderBg, borderRadius: "0.75rem",
                    padding: "1rem", border: `1px solid ${T.stroke}`
                }}>
                    <div style={{
                        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: T.muted, marginBottom: "0.75rem"
                    }}>Hourly Distribution</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: 36 }}>
                        {Array.from({ length: 24 }, (_, h) => {
                            const count = (hourDist[h] as number) || 0;
                            const pct = count / maxH;
                            const isPeak = h === dt.peakHour;
                            return (
                                <motion.div
                                    key={h}
                                    title={`${h}:00 — ${count}`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(4, pct * 100)}%` }}
                                    transition={{ delay: h * 0.02, duration: 0.5, ease: "easeOut" }}
                                    style={{
                                        flex: 1, borderRadius: "2px 2px 0 0",
                                        background: isPeak ? T.fg : T.strokeMd,
                                        cursor: "default",
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: "0.55rem", color: T.muted, marginTop: 4
                    }}>
                        <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
                    </div>
                </div>
            )}

            {/* Day of week */}
            {Object.keys(dayDist).length > 0 && (
                <div style={{
                    background: T.loaderBg, borderRadius: "0.75rem",
                    padding: "1rem", border: `1px solid ${T.stroke}`
                }}>
                    <div style={{
                        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: T.muted, marginBottom: "0.625rem"
                    }}>Day of Week</div>
                    {Object.entries(dayDist)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([day, count]) => (
                            <div key={day} style={{
                                display: "flex", alignItems: "center",
                                gap: "0.625rem", marginBottom: "0.375rem"
                            }}>
                                <span style={{ fontSize: "0.65rem", color: T.muted, width: 28, flexShrink: 0 }}>
                                    {day.slice(0, 3)}
                                </span>
                                <Bar value={count as number} max={maxD} color={T.fg} height={4} />
                                <span style={{
                                    fontSize: "0.65rem", fontWeight: 600,
                                    color: T.mutedMd, width: 44, textAlign: "right"
                                }}>
                                    {(count as number)?.toLocaleString()}
                                </span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

// ─── Section: Queries ─────────────────────────────────────────────────────────

function QueriesSection({ d }: { d: DataDNA }) {
    const queries = d.insights || [];
    const [copied, setCopied] = useState<number | null>(null);

    const copy = (q: string, i: number) => {
        navigator.clipboard.writeText(q).then(() => {
            setCopied(i);
            setTimeout(() => setCopied(null), 1500);
        });
    };

    if (!queries.length) return <Empty msg="No suggested queries." />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {queries.map((q: string, i: number) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => copy(q, i)}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0.75rem 0.875rem",
                        background: T.loaderBg, border: `1px solid ${T.stroke}`,
                        borderRadius: "0.75rem", cursor: "pointer",
                        transition: "border-color 0.15s, background 0.15s",
                    }}
                    whileHover={{ borderColor: T.strokeMd, backgroundColor: "#d8d6ce" }}
                    whileTap={{ scale: 0.99 }}
                >
                    <ArrowUpRight size={12} style={{ color: T.muted, flexShrink: 0 }} />
                    <p style={{
                        margin: 0, fontSize: "0.72rem", color: T.fg, flex: 1,
                        lineHeight: 1.5, fontFamily: "'PP Neue Montreal', system-ui, sans-serif"
                    }}>{q}</p>
                    <span style={{ flexShrink: 0, color: T.muted }}>
                        {copied === i
                            ? <Check size={12} style={{ color: T.success }} />
                            : <Copy size={12} />
                        }
                    </span>
                </motion.div>
            ))}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function Empty({ msg }: { msg: string }) {
    return (
        <div style={{
            padding: "1.5rem", textAlign: "center",
            fontSize: "0.75rem", color: T.muted
        }}>
            {msg}
        </div>
    );
}

// ─── Drag Scroll Hook ─────────────────────────────────────────────────────────

function useDragScroll<T extends HTMLElement>(ref: React.RefObject<T>) {
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        const handleMouseDown = (e: MouseEvent) => {
            isDown = true;
            setIsDragging(false);
            startX = e.pageX - element.offsetLeft;
            scrollLeft = element.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDown = false;
            setIsDragging(false);
        };

        const handleMouseUp = () => {
            isDown = false;
            setIsDragging(false);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - element.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed multiplier

            // Only set dragging state if moved more than 5px
            if (Math.abs(walk) > 5) {
                setIsDragging(true);
            }

            element.scrollLeft = scrollLeft - walk;
        };

        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('mouseup', handleMouseUp);
        element.addEventListener('mousemove', handleMouseMove);

        return () => {
            element.removeEventListener('mousedown', handleMouseDown);
            element.removeEventListener('mouseleave', handleMouseLeave);
            element.removeEventListener('mouseup', handleMouseUp);
            element.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return isDragging;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DataDNAPanel({ dataDNA }: DataDNAPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const tabBarRef = useRef<HTMLDivElement>(null);

    // Enable drag scrolling on the tab bar and get dragging state
    const isDragging = useDragScroll(tabBarRef as any);

    if (!dataDNA) return (
        <div style={{
            padding: "3rem 1.5rem", textAlign: "center",
            fontFamily: "'PP Neue Montreal', system-ui, sans-serif"
        }}>
            <Database size={24} style={{ color: T.muted, margin: "0 auto 0.75rem" }} />
            <div style={{ fontSize: "0.8rem", color: T.muted }}>No dataset loaded.</div>
        </div>
    );

    const h = (dataDNA.health || {}) as any;
    const gradeMap: Record<string, string> = { A: T.success, B: "#16803c", C: T.warning, D: "#ea580c", F: T.error };
    const gradeColor = gradeMap[h.grade] ?? T.fg;

    const tabCounts: Partial<Record<TabId, string | number>> = {
        columns: dataDNA.columnCount,
        correlations: dataDNA.correlations?.length,
        outliers: dataDNA.outlierSummary?.length,
        patterns: dataDNA.patterns?.length,
        segments: dataDNA.segmentBreakdown?.length,
        queries: dataDNA.insights?.length,
    };

    const renderSection = () => {
        switch (activeTab) {
            case "overview": return <OverviewSection d={dataDNA} />;
            case "columns": return <ColumnsSection d={dataDNA} />;
            case "health": return <HealthSection d={dataDNA} />;
            case "correlations": return <CorrelationsSection d={dataDNA} />;
            case "outliers": return <OutliersSection d={dataDNA} />;
            case "patterns": return <PatternsSection d={dataDNA} />;
            case "segments": return <SegmentsSection d={dataDNA} />;
            case "baselines": return <BaselinesSection d={dataDNA} />;
            case "datetime": return <DatetimeSection d={dataDNA} />;
            case "queries": return <QueriesSection d={dataDNA} />;
        }
    };

    return (
        <div style={{
            width: "100%", height: "100%", background: T.bg,
            display: "flex", flexDirection: "column",
            fontFamily: "'PP Neue Montreal', system-ui, sans-serif",
            color: T.fg,
        }}>
            {/* ── Panel Header ── */}
            <div style={{
                padding: "0 1.5rem",
                borderBottom: `1px solid ${T.stroke}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                height: "3.5rem", flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <Database size={15} style={{ color: T.muted }} />
                    <span style={{
                        fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.1em", color: T.fg
                    }}>Data DNA</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span style={{ fontSize: "0.65rem", color: T.muted }}>
                        {dataDNA.rowCount?.toLocaleString()} × {dataDNA.columnCount}
                    </span>
                    <span style={{
                        fontSize: "0.65rem", fontWeight: 800, padding: "2px 7px",
                        background: gradeColor + "18", color: gradeColor,
                        border: `1px solid ${gradeColor}35`, borderRadius: "0.375rem",
                    }}>{h.grade || "—"}</span>
                </div>
            </div>

            {/* ── Tab Bar with Drag Scroll ── */}
            <div
                ref={tabBarRef}
                style={{
                    borderBottom: `1px solid ${T.stroke}`,
                    overflowX: "auto",
                    flexShrink: 0,
                    scrollbarWidth: "none",
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: isDragging ? 'none' : 'auto',
                }}
            >
                <div style={{ display: "flex", padding: "0 0.75rem", minWidth: "max-content" }}>
                    {TABS.map(({ id, Icon, label }) => {
                        const isActive = activeTab === id;
                        const count = tabCounts[id];
                        return (
                            <button
                                key={id}
                                onClick={(e) => {
                                    if (!isDragging) {
                                        setActiveTab(id);
                                    }
                                }}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.3rem",
                                    padding: "0.625rem 0.625rem",
                                    border: "none", background: "none",
                                    cursor: isDragging ? 'grabbing' : 'pointer',
                                    pointerEvents: isDragging ? 'none' : 'auto',
                                    borderBottom: `2px solid ${isActive ? T.fg : "transparent"}`,
                                    color: isActive ? T.fg : T.muted,
                                    transition: "all 0.15s",
                                    fontSize: "0.65rem", fontWeight: 700,
                                    letterSpacing: "0.05em", textTransform: "uppercase",
                                    fontFamily: "'PP Neue Montreal', system-ui, sans-serif",
                                    whiteSpace: "nowrap",
                                }}
                                onMouseEnter={e => { if (!isActive && !isDragging) e.currentTarget.style.color = T.mutedMd; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = T.muted; }}
                            >
                                <Icon size={11} />
                                <span>{label}</span>
                                {count !== undefined && count !== null && (
                                    <span style={{
                                        fontSize: "0.55rem", background: isActive ? T.fg : T.loaderBg,
                                        color: isActive ? T.bg : T.muted,
                                        padding: "1px 5px", borderRadius: 9999,
                                        fontWeight: 700,
                                    }}>{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Scrollable Content ── */}
            <div style={{
                flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem",
                scrollbarWidth: "thin", scrollbarColor: `${T.stroke} transparent`,
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {renderSection()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div style={{
                padding: "0.625rem 1.5rem",
                borderTop: `1px solid ${T.stroke}`,
                display: "flex", gap: "1rem", alignItems: "center",
            }}>
                <div style={{ fontSize: "0.62rem", color: T.muted }}>
                    Health: <b style={{ color: gradeColor }}>{h.score}/100</b>
                </div>
                <div style={{ fontSize: "0.62rem", color: T.muted }}>
                    Completeness: <b style={{ color: T.fg }}>{h.completeness}%</b>
                </div>
                {(h.duplicateRows || 0) > 0 && (
                    <div style={{ fontSize: "0.62rem", color: T.warning }}>
                        ⚠ {h.duplicateRows} dupes
                    </div>
                )}
            </div>
        </div>
    );
}