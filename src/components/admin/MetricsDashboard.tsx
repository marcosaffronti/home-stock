"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  ShoppingCart,
  MessageSquare,
  Phone,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Users,
} from "lucide-react";

type DayData = {
  date: string;
  pv: number;
  sv: number;
  ca: number;
  wa: number;
  cs: number;
  pv_products: Record<string, number>;
};

type AnalyticsData = {
  days: DayData[];
  totals: { pv: number; sv: number; ca: number; wa: number; cs: number };
  week: { sv: number; ca: number; wa: number };
  prevWeek: { sv: number; ca: number; wa: number };
  topProducts: { name: string; count: number }[];
};

type LeadTypeCounts = Record<string, number>;

const TYPE_LABELS: Record<string, string> = {
  contact: "Contacto",
  appointment: "Turno",
  quiz: "Quiz de estilo",
  cart: "Carrito",
};

function pct(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function Trend({ curr, prev }: { curr: number; prev: number }) {
  const delta = pct(curr, prev);
  if (delta === null) return <span className="text-xs text-gray-400" style={{ fontFamily: "var(--font-inter), sans-serif" }}>—</span>;
  if (delta === 0) return (
    <span className="flex items-center gap-0.5 text-xs text-gray-400" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      <Minus className="w-3 h-3" /> igual
    </span>
  );
  const up = delta > 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{delta}% vs sem. ant.
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 bg-gray-100 rounded-lg" />
        <div className="w-16 h-3 bg-gray-100 rounded" />
      </div>
      <div className="w-20 h-7 bg-gray-100 rounded mb-1" />
      <div className="w-28 h-3 bg-gray-100 rounded" />
    </div>
  );
}

export default function MetricsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [leadTypes, setLeadTypes] = useState<LeadTypeCounts>({});
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, leadsRes] = await Promise.all([
        fetch("/api/track"),
        fetch("/api/leads"),
      ]);
      const analytics: AnalyticsData = await analyticsRes.json();
      const leadsData = await leadsRes.json();

      setData(analytics);

      const leads: Array<{ formType: string }> = leadsData.leads || [];
      setTotalLeads(leads.length);
      const counts: LeadTypeCounts = {};
      for (const l of leads) {
        counts[l.formType] = (counts[l.formType] || 0) + 1;
      }
      setLeadTypes(counts);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Conversion: sessions that added to cart / total sessions (30d)
  const conversion =
    data && data.totals.sv > 0
      ? ((data.totals.ca / data.totals.sv) * 100).toFixed(1)
      : "—";

  // Bar chart: last 14 days
  const chartDays = data?.days.slice(-14) ?? [];
  const maxSv = Math.max(...chartDays.map((d) => d.sv), 1);

  const formatDate = (str: string) => {
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-semibold text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Métricas
          </h2>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            Últimos 30 días · se actualiza en tiempo real
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-gray-500 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : data ? (
          <>
            {/* Visitas (Sesiones únicas) */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <Trend curr={data.week.sv} prev={data.prevWeek.sv} />
              </div>
              <p className="text-2xl font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                {data.totals.sv.toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Visitas únicas (30d)
              </p>
            </div>

            {/* Carrito */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <Trend curr={data.week.ca} prev={data.prevWeek.ca} />
              </div>
              <p className="text-2xl font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                {data.totals.ca.toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Agregados al carrito (30d)
              </p>
            </div>

            {/* WhatsApp */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <Trend curr={data.week.wa} prev={data.prevWeek.wa} />
              </div>
              <p className="text-2xl font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                {data.totals.wa.toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Clicks en WhatsApp (30d)
              </p>
            </div>

            {/* Conversión */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                {conversion}{conversion !== "—" ? "%" : ""}
              </p>
              <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Visitas → carrito (30d)
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart — 14d Visitors */}
        <div className="lg:col-span-2 bg-white border border-[var(--border)] rounded-xl p-5">
          <h3
            className="text-sm font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Visitas diarias (últimos 14 días)
          </h3>
          {loading ? (
            <div className="h-24 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-end gap-1 h-24">
              {chartDays.map((day) => {
                const heightPct = maxSv > 0 ? (day.sv / maxSv) * 100 : 0;
                const isToday = day.date === new Date().toISOString().slice(0, 10);
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end gap-1 group cursor-default"
                    title={`${formatDate(day.date)}: ${day.sv} visitas`}
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        isToday ? "bg-[var(--primary)]" : "bg-[var(--primary)]/30 group-hover:bg-[var(--primary)]/60"
                      }`}
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                    <span className="text-[9px] text-gray-400 leading-none hidden sm:block" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                      {new Date(day.date + "T00:00:00").getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[var(--primary)]" />
              <span className="text-xs text-gray-500" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Hoy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[var(--primary)]/30" />
              <span className="text-xs text-gray-500" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Días anteriores</span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-5">
          <h3
            className="text-sm font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Productos más vistos (30d)
          </h3>
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
                    style={{
                      background: i === 0 ? "#FEF3C7" : i === 1 ? "#F3F4F6" : "#FFF",
                      color: i === 0 ? "#D97706" : "#6B7280",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-[var(--foreground)] truncate" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                    {p.name}
                  </span>
                  <span className="text-xs text-gray-400 font-medium flex-shrink-0" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                    {p.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
              Sin datos todavía
            </p>
          )}
        </div>
      </div>

      {/* Leads Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leads totals */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[var(--primary)]" />
            <h3
              className="text-sm font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              Consultas por tipo
            </h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : totalLeads === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
              Sin consultas todavía
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(leadTypes).map(([type, count]) => {
                const pctVal = Math.round((count / totalLeads) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                        {TYPE_LABELS[type] ?? type}
                      </span>
                      <span className="text-xs text-gray-500" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                        {count} ({pctVal}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary)] rounded-full"
                        style={{ width: `${pctVal}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 pt-1" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Total: {totalLeads} consultas
              </p>
            </div>
          )}
        </div>

        {/* Page views vs sessions */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-[var(--primary)]" />
            <h3
              className="text-sm font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              Resumen de engagement (30d)
            </h3>
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
                { label: "Páginas vistas", value: data.totals.pv, icon: Eye, color: "text-blue-600" },
                { label: "Visitas únicas", value: data.totals.sv, icon: Users, color: "text-indigo-600" },
                { label: "Clicks en WhatsApp", value: data.totals.wa, icon: MessageSquare, color: "text-emerald-600" },
                { label: "Inicios de pedido", value: data.totals.cs, icon: ShoppingCart, color: "text-[var(--primary)]" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-gray-600" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                    {row.label}
                  </span>
                  <span className={`text-sm font-semibold ${row.color}`} style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                    {row.value.toLocaleString("es-AR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
