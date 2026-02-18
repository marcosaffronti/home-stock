"use client";

import { useState, useEffect } from "react";
import { categories as defaultCategories } from "@/data/products";
import { getStoredValue, setStoredValue, saveToServer, STORAGE_KEYS } from "@/lib/storage";
import { Plus, Trash2, Save, X, Edit, GripVertical } from "lucide-react";

export interface CategoryItem {
  id: string;
  label: string;
}

export function getCategories(): CategoryItem[] {
  return getStoredValue<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, defaultCategories);
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [newId, setNewId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const saveCategories = (updated: CategoryItem[]) => {
    setCategories(updated);
    setStoredValue(STORAGE_KEYS.CATEGORIES, updated);
    saveToServer(STORAGE_KEYS.CATEGORIES, updated);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const startEditing = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
  };

  const saveEdit = () => {
    if (!editingId || !editLabel.trim()) return;
    const updated = categories.map((c) =>
      c.id === editingId ? { ...c, label: editLabel.trim() } : c
    );
    saveCategories(updated);
    setEditingId(null);
    setEditLabel("");
    showMessage("Categoría actualizada");
  };

  const addCategory = () => {
    const id = newId.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") || newLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!id || !newLabel.trim()) return;
    if (categories.some((c) => c.id === id)) {
      showMessage("Ya existe una categoría con ese ID");
      return;
    }
    const updated = [...categories, { id, label: newLabel.trim() }];
    saveCategories(updated);
    setNewId("");
    setNewLabel("");
    setShowAddForm(false);
    showMessage("Categoría agregada");
  };

  const deleteCategory = (id: string) => {
    if (id === "all") return;
    if (!confirm(`¿Eliminar la categoría? Los productos con esta categoría no se modificarán.`)) return;
    const updated = categories.filter((c) => c.id !== id);
    saveCategories(updated);
    showMessage("Categoría eliminada");
  };

  const resetToDefaults = () => {
    if (!confirm("¿Restaurar categorías a los valores originales?")) return;
    saveCategories(defaultCategories);
    showMessage("Categorías restauradas");
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-semibold text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Categorías
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </button>
          <button
            onClick={resetToDefaults}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Restaurar
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <p className="text-sm text-green-800" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{message}</p>
        </div>
      )}

      {showAddForm && (
        <div className="border border-[var(--border)] rounded-lg p-4 space-y-3 bg-[var(--muted)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Nombre
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                placeholder="Ej: Escritorios"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                ID (opcional)
              </label>
              <input
                type="text"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                placeholder="se-genera-automatico"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowAddForm(false); setNewId(""); setNewLabel(""); }}
              className="px-3 py-1.5 text-xs text-gray-600 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={addCategory}
              disabled={!newLabel.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Guardar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--muted)] transition-colors group"
          >
            <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
            {editingId === cat.id ? (
              <>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="flex-1 px-2 py-1 border border-[var(--primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  autoFocus
                />
                <button onClick={saveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setEditingId(null); setEditLabel(""); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  {cat.label}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{cat.id}</span>
                {cat.id !== "all" && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditing(cat)} className="p-1.5 text-[var(--primary)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {cat.id === "all" && (
                  <span className="text-[10px] text-gray-400 italic">fijo</span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
