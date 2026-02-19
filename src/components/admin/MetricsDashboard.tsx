"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Eye, ShoppingCart, Phone, TrendingUp, TrendingDown, Minus,
  RefreshCw, Users, MessageSquare, Star, Calendar, Zap,
  Activity, Award,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type DayData = {
  date: string;
  pv: number; sv: number; ca: number; wa: number; cs: number;
  pv_products: Record<string, number>;
};

type AnalyticsData = {
  days: DayData[];
  totals: { pv: number; sv: number; ca: number; wa: number; cs: number };
  week: { sv: number; ca: number; wa: number };
  prevWeek: { sv: number; ca: number; wa: number };
  topProducts: { name: string; count: number }[];
  activeDays: number;
  totalDays: number;
};

type LeadTypeCounts = Record<string, number>;

const TYPE_LABELS: Record<string, string> = {
  contact: "Contacto", appointment: "Turno", quiz: "Quiz", cart: "Carrito",
};

// ── Period options ────────────────────────────────────────────────────────────
type Period = "1" | "7" | "15" | "30" | "custom";
const PERIODS: { id: Period; label: string }[] = [
  { id: "1",  label: "Hoy" },
  { id: "7",  label: "7 días" },
  { id: "15", label: "15 días" },
  { id: "30", label: "30 días" },
  { id: "custom", label: "Rango" },
];

// ── Business Score (0-100) ────────────────────────────────────────────────────
function calcScore(data: AnalyticsData, totalLeads: number): number {
  if (!data.totals.sv) return 0;
  const convCart  = Math.min((data.totals.ca / data.totals.sv) * 100, 20) * 1.5; // max 30
  const convWA    = Math.min((data.totals.wa / data.totals.sv) * 100, 20) * 1.5; // max 30
  const leadsNorm = Math.min(totalLeads / Math.max(data.activeDays, 1), 3) / 3 * 20; // max 20
  const activity  = (data.activeDays / Math.max(data.totalDays, 1)) * 20; // max 20
  return Math.round(convCart + convWA + leadsNorm + activity);
}

function scoreColor(score: number) {
  if (score >= 70) return { text: "text-emerald-600", bg: "bg-emerald-50", label: "Excelente" };
  if (score >= 45) return { text: "text-amber-600",   bg: "bg-amber-50",   label: "En crecimiento" };
  return                 { text: "text-red-500",       bg: "bg-red-50",     label: "Mejorable" };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function Trend({ curr, prev }: { curr: number; prev: number }) {
  const delta = pct(curr, prev);
  if (delta === null) return <span className="text-xs text-gray-400">—</span>;
  if (delta === 0)    return <span className="flex items-center gap-0.5 text-xs text-gray-400"><Minus className="w-3 h-3" /> igual</span>;
  const up = delta > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{delta}%
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        <div className="w-12 h-3 bg-gray-100 rounded" />
      </div>
      <div className="w-16 h-6 bg-gray-100 rounded mb-1" />
      <div className="w-24 h-3 bg-gray-100 rounded" />
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString("es-AR"); }

// ── Component ─────────────────────────────────────────────────────────────────
export default function MetricsDashboard() {
  const [period, setPeriod]         = useState<Period>("7");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");
  const [data, setData]             = useState<AnalyticsData | null>(null);
  const [leadTypes, setLeadTypes]   = useState<LeadTypeCounts>({});
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive]         = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buildUrl = useCallback(() => {
    if (period === "custom" && customFrom && customTo) {
      return `/api/track?from=${customFrom}&to=${customTo}`;
    }
    if (period === "1") {
      const d = new Date().toISOString().slice(0, 10);
      return `/api/track?from=${d}&to=${d}`;
    }
    return `/api/track?days=${period}`;
  }, [period, customFrom, customTo]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [analyticsRes, leadsRes] = await Promise.all([
        fetch(buildUrl()),
        fetch("/api/leads"),
      ]);
      const analytics: AnalyticsData = await analyticsRes.json();
      const leadsData = await leadsRes.json();

      setData(analytics);
      setLastUpdated(new Date());

      const leads: Array<{ formType: string }> = leadsData.leads || [];
      setTotalLeads(leads.length);
      const counts: LeadTypeCounts = {};
      for (const l of leads) counts[l.formType] = (counts[l.formType] || 0) + 1;
      setLeadTypes(counts);
    } catch { /* silent */ }
    if (!silent) setLoading(false);
  }, [buildUrl]);

  // Initial fetch
  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 30s when isLive
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isLive) {
      intervalRef.current = setInterval(() => fetchData(true), 30000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive, fetchData]);

  // Derived metrics
  const conversion  = data && data.totals.sv > 0 ? ((data.totals.ca / data.totals.sv) * 100).toFixed(1) : "—";
  const waRate      = data && data.totals.sv > 0 ? ((data.totals.wa / data.totals.sv) * 100).toFixed(1) : "—";
  const score       = data ? calcScore(data, totalLeads) : 0;
  const scoreMeta   = scoreColor(score);
  const leadVelocity = data ? (totalLeads / Math.max(data.activeDays, 1)).toFixed(1) : "—";

  const chartDays   = data?.days ?? [];
  const maxSv       = Math.max(...chartDays.map((d) => d.sv), 1);
  const todayStr    = new Date().toISOString().slice(0, 10);

  // Formatted last updated
  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Métricas
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En vivo
              </span>
            )}
            {updatedStr && (
              <span className="text-xs text-gray-400">· actualizado {updatedStr}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            title={isLive ? "Pausar actualizaciones" : "Activar actualizaciones en vivo"}
            className={`p-2 rounded-xl border transition-colors ${isLive ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "border-[var(--border)] text-gray-400 hover:bg-[var(--muted)]"}`}
          >
            <Activity className="w-4 h-4" />
          </button>
          {/* Manual refresh */}
          <button
            onClick={() => fetchData()}
            className="p-2 text-gray-500 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Period selector ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              period === p.id
                ? "bg-[var(--primary)] text-white"
                : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            {p.id === "custom" && <Calendar className="w-3.5 h-3.5 inline mr-1" />}
            {p.label}
          </button>
        ))}

        {/* Custom date range */}
        {period === "custom" && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <span className="text-sm text-gray-400">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            {customFrom && customTo && (
              <button
                onClick={() => fetchData()}
                className="px-3 py-1.5 text-sm bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
              >
                Ver
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── KPI Cards Row 1 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : data ? (
          <>
            {/* Visitas */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <Trend curr={data.week.sv} prev={data.prevWeek.sv} />
              </div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{fmt(data.totals.sv)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Visitas únicas</p>
            </div>

            {/* Carrito */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <Trend curr={data.week.ca} prev={data.prevWeek.ca} />
              </div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{fmt(data.totals.ca)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Agregados al carrito</p>
            </div>

            {/* WhatsApp */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <Trend curr={data.week.wa} prev={data.prevWeek.wa} />
              </div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{fmt(data.totals.wa)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Clicks WhatsApp</p>
            </div>

            {/* Conversión carrito */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">
                {conversion}{conversion !== "—" ? "%" : ""}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Conversión → carrito</p>
            </div>
          </>
        ) : null}
      </div>

      {/* ── KPI Cards Row 2 (nuevas métricas) ── */}
      {!loading && data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Score del negocio */}
          <div className={`border border-[var(--border)] rounded-xl p-4 ${scoreMeta.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Award className={`w-4 h-4 ${scoreMeta.text}`} />
              <span className={`text-xs font-semibold ${scoreMeta.text}`}>{scoreMeta.label}</span>
            </div>
            <p className={`text-3xl font-bold ${scoreMeta.text}`}>{score}</p>
            <p className="text-xs text-gray-500 mt-0.5">Score del negocio /100</p>
          </div>

          {/* Tasa WhatsApp */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">
              {waRate}{waRate !== "—" ? "%" : ""}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Tasa conversión WA</p>
          </div>

          {/* Lead velocity */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{leadVelocity}</p>
            <p className="text-xs text-gray-500 mt-0.5">Leads / día activo</p>
          </div>

          {/* Días activos */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">
              {data.activeDays}<span className="text-sm text-gray-400 font-normal">/{data.totalDays}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Días con visitas</p>
          </div>
        </div>
      )}

      {/* ── Bar Chart + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            Visitas diarias
            {period === "1" && " · hoy"}
          </h3>
          {loading ? (
            <div className="h-24 bg-gray-50 rounded-lg animate-pulse" />
          ) : chartDays.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin datos para este período</p>
          ) : (
            <>
              <div className="flex items-end gap-0.5 sm:gap-1 h-24 w-full">
                {chartDays.map((day) => {
                  const heightPct = (day.sv / maxSv) * 100;
                  const isToday = day.date === todayStr;
                  const d = new Date(day.date + "T00:00:00");
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end gap-0.5 group cursor-default min-w-0"
                      title={`${day.date}: ${day.sv} visitas, ${day.ca} carrito, ${day.wa} WA`}
                    >
                      <div
                        className={`w-full rounded-t transition-all ${isToday ? "bg-[var(--primary)]" : "bg-[var(--primary)]/30 group-hover:bg-[var(--primary)]/60"}`}
                        style={{ height: `${Math.max(heightPct, 3)}%` }}
                      />
                      {/* Only show date label if <= 15 days */}
                      {chartDays.length <= 15 && (
                        <span className="text-[8px] sm:text-[9px] text-gray-400 leading-none hidden sm:block">
                          {d.getDate()}/{d.getMonth() + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[var(--primary)]" />
                  <span className="text-xs text-gray-500">Hoy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[var(--primary)]/30" />
                  <span className="text-xs text-gray-500">Días anteriores</span>
                </div>
                {data && (
                  <span className="text-xs text-gray-400 ml-auto">
                    Máx: {maxSv} visitas/día
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Productos más vistos</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-5 bg-gray-100 rounded" />
                  <div className="flex-1 h-3 bg-gray-100 rounded" />
                  <div className="w-6 h-3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : data && data.topProducts.length > 0 ? (
            <div className="space-y-2.5">
              {data.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: i === 0 ? "#FEF3C7" : "#F3F4F6", color: i === 0 ? "#D97706" : "#6B7280" }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-[var(--foreground)] truncate">{p.name}</span>
                  <span className="text-xs text-gray-400 font-medium flex-shrink-0">{p.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Sin datos todavía</p>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leads by type */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Consultas por tipo</h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : totalLeads === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Sin consultas todavía</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(leadTypes).map(([type, count]) => {
                const pctVal = Math.round((count / totalLeads) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--foreground)]">{TYPE_LABELS[type] ?? type}</span>
                      <span className="text-xs text-gray-500">{count} ({pctVal}%)</span>
                    </div>
                    <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${pctVal}%` }} />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 pt-1">Total: {totalLeads} consultas</p>
            </div>
          )}
        </div>

        {/* Engagement summary */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Resumen de engagement</h3>
          </div>
          {loading || !data ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between animate-pulse">
                  <div className="w-32 h-3 bg-gray-100 rounded" />
                  <div className="w-10 h-3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Páginas vistas",     value: data.totals.pv, icon: Eye,           color: "#2563EB" },
                { label: "Visitas únicas",      value: data.totals.sv, icon: Users,         color: "#7C3AED" },
                { label: "Clicks WhatsApp",     value: data.totals.wa, icon: MessageSquare, color: "#16A34A" },
                { label: "Inicios de pedido",   value: data.totals.cs, icon: ShoppingCart,  color: "var(--primary)" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon size={13} style={{ color }} />
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">{fmt(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Score explanation ── */}
      {!loading && data && (
        <div className={`rounded-xl p-4 border ${scoreMeta.bg} border-[var(--border)]`}>
          <div className="flex items-start gap-3">
            <Award className={`w-5 h-5 ${scoreMeta.text} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`text-sm font-semibold ${scoreMeta.text} mb-1`}>
                Score del negocio: {score}/100 — {scoreMeta.label}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Calculado en base a: conversión a carrito ({conversion}%), tasa WhatsApp ({waRate}%),
                velocidad de leads ({leadVelocity}/día) y consistencia de visitas ({data.activeDays}/{data.totalDays} días activos).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
