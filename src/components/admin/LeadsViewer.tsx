"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mail, Phone, MessageSquare, Calendar, Star, Trash2, CheckCheck,
  RefreshCw, Filter, Inbox, ChevronDown, ChevronUp,
  StickyNote, Send, ExternalLink,
} from "lucide-react";
import type { Lead } from "@/app/api/leads/route";

const FORM_TYPE_META: Record<string, { label: string; color: string; bg: string; icon: typeof Mail }> = {
  contact:     { label: "Contacto",       color: "#2563EB", bg: "#DBEAFE", icon: Mail },
  appointment: { label: "Turno",          color: "#7C3AED", bg: "#EDE9FE", icon: Calendar },
  quiz:        { label: "Quiz de estilo", color: "#D97706", bg: "#FEF3C7", icon: Star },
  cart:        { label: "Carrito",        color: "#16A34A", bg: "#DCFCE7", icon: MessageSquare },
};

const DEFAULT_META = { label: "Consulta", color: "#6B7280", bg: "#F3F4F6", icon: Mail };

function typeMeta(formType: string) {
  return FORM_TYPE_META[formType] ?? DEFAULT_META;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 1)  return `hace ${Math.round(diffMs / 60000)} min`;
  if (diffH < 24) return `hace ${Math.round(diffH)} h`;
  if (diffH < 48) return "ayer";
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default function LeadsViewer() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const noteRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/leads");
    const data = await res.json();
    const fetchedLeads: Lead[] = data.leads || [];
    setLeads(fetchedLeads);
    // Sync notes
    const initialNotes: Record<string, string> = {};
    for (const l of fetchedLeads) {
      initialNotes[l.id] = l.notes ?? "";
    }
    setNotes(initialNotes);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const markRead = async (id: string, read: boolean) => {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, read } : l));
  };

  const deleteLead = async (id: string) => {
    if (!confirm("¿Eliminar esta consulta?")) return;
    setDeleting(id);
    await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  };

  const markAllRead = async () => {
    const unread = leads.filter((l) => !l.read);
    await Promise.all(unread.map((l) =>
      fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: l.id, read: true }),
      })
    ));
    setLeads((prev) => prev.map((l) => ({ ...l, read: true })));
  };

  const saveNote = async (id: string) => {
    setSavingNote(id);
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes: notes[id] ?? "" }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, notes: notes[id] } : l));
    setSavingNote(null);
  };

  const markReplied = async (id: string, method: "email" | "whatsapp") => {
    const repliedAt = new Date().toISOString();
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, repliedAt, read: true }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, repliedAt, read: true } : l));
    // Auto-add a note
    const noteText = `Respondido por ${method === "email" ? "email" : "WhatsApp"} el ${new Date().toLocaleDateString("es-AR")}`;
    const currentNote = notes[id] ?? "";
    const updated = currentNote ? `${currentNote}\n${noteText}` : noteText;
    setNotes((prev) => ({ ...prev, [id]: updated }));
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes: updated }),
    });
  };

  const allTypes = Array.from(new Set(leads.map((l) => l.formType)));
  const unreadCount = leads.filter((l) => !l.read).length;

  const filtered = leads.filter((l) => {
    if (filter === "all")    return true;
    if (filter === "unread") return !l.read;
    return l.formType === filter;
  });

  const toggleExpand = (id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (lead && !lead.read) markRead(id, true);
    setExpanded((prev) => prev === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Consultas
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {leads.length} consultas recibidas
            {unreadCount > 0 && (
              <> · <span className="text-[var(--primary)] font-medium">{unreadCount} sin leer</span></>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--primary)] border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Marcar todo leído</span>
            </button>
          )}
          <button
            onClick={fetchLeads}
            className="p-2 text-gray-500 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: "all",    label: `Todos (${leads.length})` },
          { id: "unread", label: `Sin leer (${unreadCount})` },
          ...allTypes.map((t) => ({
            id: t,
            label: `${typeMeta(t).label} (${leads.filter((l) => l.formType === t).length})`,
          })),
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap flex-shrink-0 ${
              filter === opt.id
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)] bg-white"
            }`}
          >
            <Filter className="w-3 h-3 flex-shrink-0" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Lead List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[var(--border)] rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-xl py-16 text-center">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {filter === "all" ? "No hay consultas todavía." : "No hay consultas con este filtro."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const meta = typeMeta(lead.formType);
            const Icon = meta.icon;
            const isExpanded = expanded === lead.id;
            const hasNote = !!lead.notes;
            const hasReplied = !!lead.repliedAt;

            return (
              <div
                key={lead.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  !lead.read
                    ? "border-[var(--primary)]/40 shadow-sm"
                    : "border-[var(--border)]"
                }`}
              >
                {/* Lead Header */}
                <div
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer hover:bg-[var(--muted)]/40 transition-colors"
                  onClick={() => toggleExpand(lead.id)}
                >
                  {/* Unread dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${!lead.read ? "bg-[var(--primary)]" : "bg-transparent"}`} />

                  {/* Type badge */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium truncate ${!lead.read ? "text-[var(--foreground)]" : "text-gray-600"}`}>
                        {lead.name || "Sin nombre"}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      {hasReplied && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium hidden sm:inline">
                          ✓ Respondido
                        </span>
                      )}
                      {hasNote && !hasReplied && (
                        <StickyNote className="w-3 h-3 text-amber-500 hidden sm:block" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-0.5 flex-wrap">
                      {lead.email && (
                        <span className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[140px]">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </span>
                      )}
                      {lead.phone && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" /> {lead.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time + toggle */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">{formatDate(lead.timestamp)}</span>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] p-3 sm:p-4 bg-[var(--muted)]/30 space-y-4">
                    {/* Date on mobile */}
                    <div className="flex items-center justify-between sm:hidden">
                      <span className="text-xs text-gray-400">{formatDate(lead.timestamp)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Message */}
                    {lead.message && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mensaje</p>
                        <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap bg-white border border-[var(--border)] rounded-lg p-3">
                          {lead.message}
                        </p>
                      </div>
                    )}

                    {/* Form data */}
                    {Object.keys(lead.data).filter((k) => !["message","mensaje"].includes(k)).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Datos del formulario</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(lead.data)
                            .filter(([k]) => !["message","mensaje"].includes(k))
                            .map(([k, v]) => (
                              <div key={k} className="bg-white border border-[var(--border)] rounded-lg px-3 py-2">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{k}</p>
                                <p className="text-sm text-[var(--foreground)] truncate">{String(v) || "—"}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* ── Contact Actions ── */}
                    <div className="bg-white border border-[var(--border)] rounded-xl p-3 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contactar</p>
                      <div className="flex flex-wrap gap-2">
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}?subject=Re: Tu consulta en Home Stock`}
                            onClick={() => markReplied(lead.id, "email")}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--primary)] border border-[var(--border)] rounded-xl hover:bg-[var(--primary)]/5 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> Responder email
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${lead.name || ""}! Te contactamos desde Home Stock.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => markReplied(lead.id, "whatsapp")}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#25D366] border border-[var(--border)] rounded-xl hover:bg-[#25D366]/5 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" /> WhatsApp
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone.replace(/\D/g, "")}`}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" /> Llamar
                          </a>
                        )}
                        {hasReplied && (
                          <span className="flex items-center gap-1.5 px-3 py-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <Send className="w-3 h-3" />
                            Respondido {new Date(lead.repliedAt!).toLocaleDateString("es-AR")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Internal Notes ── */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                        Notas internas
                      </p>
                      <textarea
                        ref={(el) => { noteRefs.current[lead.id] = el; }}
                        value={notes[lead.id] ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                        placeholder="Escribí una nota interna (no visible para el cliente)..."
                        rows={3}
                        className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                        style={{ fontFamily: "var(--font-inter), sans-serif" }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">Solo visible para el equipo</span>
                        <button
                          onClick={() => saveNote(lead.id)}
                          disabled={savingNote === lead.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          {savingNote === lead.id ? "Guardando..." : "Guardar nota"}
                        </button>
                      </div>
                    </div>

                    {/* ── Meta actions ── */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[var(--border)]">
                      <button
                        onClick={() => markRead(lead.id, !lead.read)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-[var(--border)] rounded-lg hover:bg-white transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        {lead.read ? "Marcar sin leer" : "Marcar leído"}
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        disabled={deleting === lead.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleting === lead.id ? "Eliminando…" : "Eliminar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
