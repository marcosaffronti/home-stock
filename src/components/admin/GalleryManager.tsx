"use client";

import { useState, useEffect, useRef } from "react";
import {
  allProjects as defaultProjects,
  galleryCategories as defaultGalleryCategories,
  GalleryProject,
} from "@/data/gallery";
import { getStoredValue, setStoredValue, STORAGE_KEYS } from "@/lib/storage";
import { uploadImage } from "@/lib/upload";
import {
  Plus,
  Trash2,
  Save,
  X,
  Edit,
  Upload,
  Image as ImageIcon,
  Tags,
  FolderOpen,
} from "lucide-react";

export function getGalleryProjects(): GalleryProject[] {
  return getStoredValue<GalleryProject[]>(STORAGE_KEYS.GALLERY, defaultProjects);
}

export function getGalleryCategories(): string[] {
  return getStoredValue<string[]>(STORAGE_KEYS.GALLERY_CATEGORIES, defaultGalleryCategories);
}

type GallerySubTab = "projects" | "categories";

export default function GalleryManager() {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<string[]>([]);
  const [subTab, setSubTab] = useState<GallerySubTab>("projects");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<GalleryProject>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState<Omit<GalleryProject, "id">>({
    title: "",
    category: "",
    image: "",
  });
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryIdx, setEditingCategoryIdx] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const newImageRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProjects(getGalleryProjects());
    setGalleryCategories(getGalleryCategories());
  }, []);

  const saveProjects = (updated: GalleryProject[]) => {
    setProjects(updated);
    setStoredValue(STORAGE_KEYS.GALLERY, updated);
  };

  const saveGalleryCategories = (updated: string[]) => {
    setGalleryCategories(updated);
    setStoredValue(STORAGE_KEYS.GALLERY_CATEGORIES, updated);
  };

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // --- Projects CRUD ---
  const handleNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadImage(file, "gallery");
      setNewProject({ ...newProject, image: path });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadImage(file, "gallery");
      setEditForm({ ...editForm, image: path });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const addProject = () => {
    if (!newProject.title.trim() || !newProject.image) return;
    const maxId = projects.reduce((max, p) => Math.max(max, p.id), 0);
    const project: GalleryProject = {
      ...newProject,
      id: maxId + 1,
    };
    saveProjects([...projects, project]);
    setNewProject({ title: "", category: "", image: "" });
    setShowAddForm(false);
    showMsg("Proyecto agregado");
  };

  const startEditing = (p: GalleryProject) => {
    setEditingId(p.id);
    setEditForm({ title: p.title, category: p.category, image: p.image });
  };

  const saveEdit = () => {
    if (editingId === null) return;
    const updated = projects.map((p) =>
      p.id === editingId ? { ...p, ...editForm } : p
    );
    saveProjects(updated);
    setEditingId(null);
    setEditForm({});
    showMsg("Proyecto actualizado");
  };

  const deleteProject = (id: number) => {
    if (!confirm("¿Eliminar este proyecto de la galería?")) return;
    saveProjects(projects.filter((p) => p.id !== id));
    showMsg("Proyecto eliminado");
  };

  const resetProjects = () => {
    if (!confirm("¿Restaurar la galería a los valores originales?")) return;
    saveProjects(defaultProjects);
    showMsg("Galería restaurada");
  };

  // --- Categories CRUD ---
  const addGalleryCategory = () => {
    if (!newCategoryName.trim()) return;
    if (galleryCategories.includes(newCategoryName.trim())) {
      showMsg("Ya existe esa categoría");
      return;
    }
    saveGalleryCategories([...galleryCategories, newCategoryName.trim()]);
    setNewCategoryName("");
    showMsg("Categoría agregada");
  };

  const saveEditCategory = () => {
    if (editingCategoryIdx === null || !editCategoryName.trim()) return;
    const oldName = galleryCategories[editingCategoryIdx];
    const updated = galleryCategories.map((c, i) =>
      i === editingCategoryIdx ? editCategoryName.trim() : c
    );
    saveGalleryCategories(updated);
    // Also update projects that used the old category name
    const updatedProjects = projects.map((p) =>
      p.category === oldName ? { ...p, category: editCategoryName.trim() } : p
    );
    saveProjects(updatedProjects);
    setEditingCategoryIdx(null);
    setEditCategoryName("");
    showMsg("Categoría renombrada");
  };

  const deleteGalleryCategory = (idx: number) => {
    const name = galleryCategories[idx];
    if (name === "Todos") return;
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    saveGalleryCategories(galleryCategories.filter((_, i) => i !== idx));
    showMsg("Categoría eliminada");
  };

  const resetCategories = () => {
    if (!confirm("¿Restaurar categorías de galería a los valores originales?")) return;
    saveGalleryCategories(defaultGalleryCategories);
    showMsg("Categorías restauradas");
  };

  const availableCategories = galleryCategories.filter((c) => c !== "Todos");

  return (
    <div className="space-y-6">
      {/* Sub-tab switcher */}
      <div className="flex gap-1 bg-white border border-[var(--border)] rounded-xl p-1">
        <button
          onClick={() => setSubTab("projects")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
            subTab === "projects"
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <FolderOpen className="w-4 h-4" />
          Proyectos
        </button>
        <button
          onClick={() => setSubTab("categories")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
            subTab === "categories"
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <Tags className="w-4 h-4" />
          Categorías
        </button>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-sm text-green-800" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{message}</p>
        </div>
      )}

      {/* ===== CATEGORIES TAB ===== */}
      {subTab === "categories" && (
        <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Categorías de Galería
            </h3>
            <button
              onClick={resetCategories}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              Restaurar
            </button>
          </div>

          <div className="space-y-1">
            {galleryCategories.map((cat, idx) => (
              <div key={cat} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--muted)] transition-colors group">
                {editingCategoryIdx === idx ? (
                  <>
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-[var(--primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      onKeyDown={(e) => e.key === "Enter" && saveEditCategory()}
                      autoFocus
                    />
                    <button onClick={saveEditCategory} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Save className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingCategoryIdx(null)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{cat}</span>
                    {cat === "Todos" ? (
                      <span className="text-[10px] text-gray-400 italic">fijo</span>
                    ) : (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingCategoryIdx(idx); setEditCategoryName(cat); }} className="p-1.5 text-[var(--primary)] hover:bg-[var(--muted)] rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteGalleryCategory(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              placeholder="Nueva categoría..."
              onKeyDown={(e) => e.key === "Enter" && addGalleryCategory()}
            />
            <button
              onClick={addGalleryCategory}
              disabled={!newCategoryName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>
        </div>
      )}

      {/* ===== PROJECTS TAB ===== */}
      {subTab === "projects" && (
        <>
          {/* Actions bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
              {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
              <button
                onClick={resetProjects}
                className="px-4 py-2 text-sm text-gray-600 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Restaurar
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Agregar Proyecto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Título</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                    placeholder="Título del proyecto"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Categoría</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Imagen</label>
                  <input ref={newImageRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleNewImage} className="hidden" />
                  <button
                    onClick={() => newImageRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-3 w-full text-sm border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Subiendo..." : newProject.image ? "Imagen subida" : "Subir imagen"}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowAddForm(false); setNewProject({ title: "", category: "", image: "" }); }}
                  className="px-4 py-2.5 text-sm text-gray-600 border border-[var(--border)] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addProject}
                  disabled={!newProject.title.trim() || !newProject.image}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden group">
                {editingId === project.id ? (
                  <div className="p-4 space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 cursor-pointer" onClick={() => editImageRef.current?.click()}>
                      {editForm.image ? (
                        <img src={editForm.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <input ref={editImageRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleEditImage} className="hidden" />
                    <input
                      type="text"
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="Título"
                    />
                    <select
                      value={editForm.category || ""}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="">Sin categoría</option>
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors">
                        <Save className="w-3.5 h-3.5" /> Guardar
                      </button>
                      <button onClick={() => { setEditingId(null); setEditForm({}); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-600 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors">
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-video">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                      {project.category && (
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">{project.category}</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-[var(--foreground)] truncate" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => startEditing(project)}
                          className="flex-1 py-1.5 text-xs text-[var(--primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12 bg-white border border-[var(--border)] rounded-xl">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                No hay proyectos en la galería.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
