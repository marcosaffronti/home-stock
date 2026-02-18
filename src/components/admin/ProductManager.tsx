"use client";

import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { allProducts, categories } from "@/data/products";
import { formatPrice } from "@/lib/formatters";
import { Product, ProductSpecs } from "@/types/product";
import { uploadImage } from "@/lib/upload";
import {
  Search,
  Edit,
  Save,
  X,
  Package,
  Star,
  StarOff,
  Info,
  Plus,
  Trash2,
  LayoutGrid,
  LayoutList,
  Upload,
  ImagePlus,
  Tags,
  Paintbrush,
} from "lucide-react";
import CategoryManager, { getCategories, CategoryItem } from "./CategoryManager";
import MaskPainter from "./MaskPainter";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "hs-admin-products";

const tagOptions: (Product["tag"] | "")[] = [
  "",
  "Nuevo",
  "Destacado",
  "Oferta",
  "Agotado",
];

const defaultNewProduct: Omit<Product, "id"> = {
  name: "",
  slug: "",
  category: "sillas",
  price: 0,
  image: "/images/products/placeholder.jpg",
  images: [],
  stock: 0,
};

type ProductSubTab = "list" | "categories";

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [saveMessage, setSaveMessage] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState(defaultNewProduct);
  const [uploading, setUploading] = useState(false);
  const [subTab, setSubTab] = useState<ProductSubTab>("list");
  const [dynamicCategories, setDynamicCategories] = useState<CategoryItem[]>([]);
  const [maskPainterId, setMaskPainterId] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImageInputRef = useRef<HTMLInputElement>(null);

  const refreshCategories = () => setDynamicCategories(getCategories());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch {
        setProducts([...allProducts]);
      }
    } else {
      setProducts([...allProducts]);
    }
    refreshCategories();
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category,
      tag: product.tag,
      featured: product.featured,
      upholstered: product.upholstered,
      fabricMask: product.fabricMask,
      stock: product.stock,
      image: product.image,
      images: product.images ? [...product.images] : [],
      description: product.description || "",
      specs: product.specs ? { ...product.specs, customFields: product.specs.customFields ? [...product.specs.customFields] : [] } : { customFields: [] },
      dimensions: product.dimensions ? { ...product.dimensions } : undefined,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveProduct = () => {
    if (editingId === null) return;
    const updatedProducts = products.map((p) =>
      p.id === editingId ? { ...p, ...editForm } : p
    );
    saveProducts(updatedProducts);
    setEditingId(null);
    setEditForm({});
    showMessage("Producto actualizado correctamente");
  };

  const deleteProduct = (id: number) => {
    if (!confirm("¿Estás seguro de que querés eliminar este producto?")) return;
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
    showMessage("Producto eliminado");
  };

  const addProduct = () => {
    if (!newProduct.name.trim()) return;
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
    const slug =
      newProduct.slug ||
      newProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const product: Product = {
      ...newProduct,
      id: maxId + 1,
      slug,
    };
    const updated = [...products, product];
    saveProducts(updated);
    setNewProduct({ ...defaultNewProduct });
    setShowAddForm(false);
    showMessage("Producto agregado correctamente");
  };

  const handleNewProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadImage(file, "products");
      setNewProduct({ ...newProduct, image: path, images: [path, ...(newProduct.images || [])] });
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
      const path = await uploadImage(file, "products");
      setEditForm({ ...editForm, image: path });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleAddAdditionalImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadImage(file, "products");
      setEditForm({ ...editForm, images: [...(editForm.images || []), path] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const imgs = [...(editForm.images || [])];
    imgs.splice(index, 1);
    setEditForm({ ...editForm, images: imgs });
  };

  const handleSaveMask = async (productId: number, maskDataUrl: string) => {
    try {
      // Convert data URL to blob
      const res = await fetch(maskDataUrl);
      const blob = await res.blob();
      const file = new File([blob], `mask-${productId}.png`, { type: "image/png" });
      const path = await uploadImage(file, "masks");

      // Update product with mask path
      const updated = products.map((p) =>
        p.id === productId ? { ...p, fabricMask: path } : p
      );
      saveProducts(updated);
      setMaskPainterId(null);
      showMessage("Máscara guardada correctamente");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar máscara");
    }
  };

  const resetToDefaults = () => {
    if (
      window.confirm(
        "¿Estás seguro de que querés restaurar todos los productos a sus valores originales? Se perderán todos los cambios."
      )
    ) {
      setProducts([...allProducts]);
      localStorage.removeItem(STORAGE_KEY);
      showMessage("Productos restaurados a los valores originales");
    }
  };

  const showMessage = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  // Use dynamic categories everywhere instead of static ones
  const activeCategories = dynamicCategories.length > 0 ? dynamicCategories : categories;

  return (
    <div className="space-y-6">
      {/* Sub-tab switcher */}
      <div className="flex gap-1 bg-white border border-[var(--border)] rounded-xl p-1">
        <button
          onClick={() => setSubTab("list")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
            subTab === "list"
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <Package className="w-4 h-4" />
          Productos
        </button>
        <button
          onClick={() => { setSubTab("categories"); refreshCategories(); }}
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

      {/* Categories sub-tab */}
      {subTab === "categories" && <CategoryManager />}

      {/* Products sub-tab */}
      {subTab === "list" && <>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p
          className="text-sm text-blue-800"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Los cambios en los productos se guardan en el almacenamiento local del
          navegador. Para reflejarlos permanentemente en el sitio, contactá al
          equipo de desarrollo.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
            <Package className="w-4 h-4" />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              Total
            </span>
          </div>
          <p className="text-2xl font-semibold text-[var(--foreground)]">
            {products.length}
          </p>
        </div>
        {activeCategories
          .filter((c) => c.id !== "all")
          .map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-[var(--border)] rounded-xl p-4"
            >
              <span
                className="text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {cat.label}
              </span>
              <p className="text-2xl font-semibold text-[var(--foreground)]">
                {categoryCounts[cat.id] || 0}
              </p>
            </div>
          ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-white text-sm"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-sm"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          {activeCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label} ({categoryCounts[cat.id] || 0})
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="p-2.5 border border-[var(--border)] rounded-xl hover:bg-gray-50 transition-colors"
            title={viewMode === "table" ? "Vista grilla" : "Vista tabla"}
          >
            {viewMode === "table" ? (
              <LayoutGrid className="w-4 h-4 text-gray-600" />
            ) : (
              <LayoutList className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-[var(--primary-dark)] transition-colors whitespace-nowrap"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-4 py-2.5 text-sm text-gray-600 border border-[var(--border)] rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Restaurar originales
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
          <h3
            className="text-lg font-semibold text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Agregar Producto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Nombre
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="Nombre del producto"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Slug (opcional)
              </label>
              <input
                type="text"
                value={newProduct.slug}
                onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="se-genera-automaticamente"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Categoría
              </label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {activeCategories
                  .filter((c) => c.id !== "all")
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Precio
              </label>
              <input
                type="number"
                value={newProduct.price || ""}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Stock
              </label>
              <input
                type="number"
                value={newProduct.stock || ""}
                onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Imagen
              </label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleNewProductImage}
                className="hidden"
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-3 w-full text-sm border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Subiendo..." : newProduct.image !== defaultNewProduct.image ? "Imagen subida" : "Subir imagen"}
              </button>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewProduct({ ...defaultNewProduct });
              }}
              className="px-4 py-2.5 text-sm text-gray-600 border border-[var(--border)] rounded-xl hover:bg-gray-50 transition-colors"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              Cancelar
            </button>
            <button
              onClick={addProduct}
              disabled={!newProduct.name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              <Save className="w-4 h-4" /> Guardar
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {saveMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p
            className="text-sm text-green-800"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            {saveMessage}
          </p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-[var(--border)] rounded-xl overflow-hidden group"
            >
              <div className="relative aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.tag && (
                  <span className="absolute top-2 left-2 bg-[var(--accent)] text-white text-[10px] px-2 py-0.5 font-medium rounded">
                    {product.tag}
                  </span>
                )}
                {product.featured && (
                  <Star className="absolute top-2 right-2 w-4 h-4 text-[var(--accent)] fill-current" />
                )}
              </div>
              <div className="p-3">
                <h4
                  className="text-sm font-medium text-[var(--foreground)] truncate"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {product.name}
                </h4>
                <p className="text-sm text-[var(--primary)] font-semibold">
                  {formatPrice(product.price)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => startEditing(product)}
                    className="flex-1 py-1.5 text-xs text-[var(--primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                  <th
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Producto
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Categoría
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Precio
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Stock
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Etiqueta
                  </th>
                  <th
                    className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Destacado
                  </th>
                  <th
                    className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredProducts.map((product) => (
                  <Fragment key={product.id}>
                  <tr
                    className="hover:bg-[var(--muted)] transition-colors"
                  >
                    {editingId === product.id ? (
                      <>
                        {/* Editing Row */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 cursor-pointer relative group"
                              onClick={() => editImageInputRef.current?.click()}
                            >
                              <img
                                src={editForm.image || product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <input
                              ref={editImageInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleEditImage}
                              className="hidden"
                            />
                            <input
                              type="text"
                              value={editForm.name || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="px-2 py-1 border border-[var(--primary)] rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                              style={{
                                fontFamily: "var(--font-inter), sans-serif",
                              }}
                            />
                          </div>
                          {/* Additional Images */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(editForm.images || []).map((img, idx) => (
                              <div key={idx} className="relative w-8 h-8 rounded overflow-hidden group">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => removeAdditionalImage(idx)}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                            <input
                              ref={additionalImageInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleAddAdditionalImage}
                              className="hidden"
                            />
                            <button
                              onClick={() => additionalImageInputRef.current?.click()}
                              className="w-8 h-8 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
                            >
                              <ImagePlus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editForm.category || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                category: e.target.value,
                              })
                            }
                            className="px-2 py-1 border border-[var(--primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            style={{
                              fontFamily: "var(--font-inter), sans-serif",
                            }}
                          >
                            {activeCategories
                              .filter((c) => c.id !== "all")
                              .map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.label}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editForm.price || 0}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                price: Number(e.target.value),
                              })
                            }
                            className="px-2 py-1 border border-[var(--primary)] rounded-lg text-sm w-28 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            style={{
                              fontFamily: "var(--font-inter), sans-serif",
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editForm.stock ?? 0}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                stock: Number(e.target.value),
                              })
                            }
                            className="px-2 py-1 border border-[var(--primary)] rounded-lg text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            style={{
                              fontFamily: "var(--font-inter), sans-serif",
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editForm.tag || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                tag: (e.target.value as Product["tag"]) || undefined,
                              })
                            }
                            className="px-2 py-1 border border-[var(--primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            style={{
                              fontFamily: "var(--font-inter), sans-serif",
                            }}
                          >
                            {tagOptions.map((tag) => (
                              <option key={tag || "none"} value={tag}>
                                {tag || "Sin etiqueta"}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              setEditForm({
                                ...editForm,
                                featured: !editForm.featured,
                              })
                            }
                            className="text-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                          >
                            {editForm.featured ? (
                              <Star className="w-5 h-5 fill-current" />
                            ) : (
                              <StarOff className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={saveProduct}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Guardar"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Display Row */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span
                              className="text-sm font-medium text-[var(--foreground)]"
                              style={{
                                fontFamily: "var(--font-inter), sans-serif",
                              }}
                            >
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block px-2.5 py-1 bg-[var(--muted)] rounded-full text-xs font-medium text-[var(--primary)] capitalize"
                            style={{
                              fontFamily: "var(--font-inter), sans-serif",
                            }}
                          >
                            {product.category}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-[var(--foreground)]"
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
                        >
                          {formatPrice(product.price)}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-[var(--foreground)]"
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
                        >
                          {product.stock}
                        </td>
                        <td className="px-4 py-3">
                          {product.tag ? (
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                product.tag === "Nuevo"
                                  ? "bg-green-100 text-green-800"
                                  : product.tag === "Destacado"
                                  ? "bg-amber-100 text-amber-800"
                                  : product.tag === "Oferta"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                              style={{
                                fontFamily: "var(--font-inter), sans-serif",
                              }}
                            >
                              {product.tag}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {product.featured ? (
                            <Star className="w-4 h-4 text-[var(--accent)] fill-current mx-auto" />
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEditing(product)}
                              className="p-2 text-[var(--primary)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  {/* Specs editing row - appears below the main row when editing */}
                  {editingId === product.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="text-sm font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                              Descripción y Especificaciones
                            </h4>
                            <div className="flex items-center gap-4">
                              {/* Mask painter button */}
                              {editForm.upholstered !== false && (
                                <button
                                  type="button"
                                  onClick={() => setMaskPainterId(product.id)}
                                  className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors",
                                    product.fabricMask
                                      ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                      : "border-[var(--border)] text-[var(--primary)] hover:bg-[var(--muted)]"
                                  )}
                                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                                >
                                  <Paintbrush className="w-3.5 h-3.5" />
                                  {product.fabricMask ? "Máscara creada" : "Crear máscara de tela"}
                                </button>
                              )}
                              <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                                  Tapizado
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditForm({ ...editForm, upholstered: editForm.upholstered === false ? undefined : false })}
                                  className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                    editForm.upholstered !== false ? "bg-[var(--primary)]" : "bg-gray-300"
                                  )}
                                >
                                  <span className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    editForm.upholstered !== false ? "translate-x-6" : "translate-x-1"
                                  )} />
                                </button>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                              Descripción
                            </label>
                            <textarea
                              value={editForm.description || ""}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                              style={{ fontFamily: "var(--font-inter), sans-serif" }}
                              placeholder="Descripción del producto..."
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Madera</label>
                              <input type="text" value={editForm.specs?.woodType || ""} onChange={(e) => setEditForm({ ...editForm, specs: { ...editForm.specs, woodType: e.target.value } })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Ej: Petiribi macizo" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Terminación</label>
                              <input type="text" value={editForm.specs?.finish || ""} onChange={(e) => setEditForm({ ...editForm, specs: { ...editForm.specs, finish: e.target.value } })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Ej: Laqueado poliuretánico" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Tapizado</label>
                              <input type="text" value={editForm.specs?.upholstery || ""} onChange={(e) => setEditForm({ ...editForm, specs: { ...editForm.specs, upholstery: e.target.value } })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Ej: A elección del cliente" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Alto asiento</label>
                              <input type="text" value={editForm.specs?.seatHeight || ""} onChange={(e) => setEditForm({ ...editForm, specs: { ...editForm.specs, seatHeight: e.target.value } })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Ej: 46 cm" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Peso</label>
                              <input type="text" value={editForm.specs?.weight || ""} onChange={(e) => setEditForm({ ...editForm, specs: { ...editForm.specs, weight: e.target.value } })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Ej: 4.5 kg" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                              Medidas (ancho x prof. x alto cm)
                            </label>
                            <div className="flex gap-2 items-center">
                              <input type="number" value={editForm.dimensions?.width || ""} onChange={(e) => setEditForm({ ...editForm, dimensions: { width: Number(e.target.value), depth: editForm.dimensions?.depth || 0, height: editForm.dimensions?.height || 0 } })} className="w-24 px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Ancho" />
                              <span className="text-gray-400">x</span>
                              <input type="number" value={editForm.dimensions?.depth || ""} onChange={(e) => setEditForm({ ...editForm, dimensions: { width: editForm.dimensions?.width || 0, depth: Number(e.target.value), height: editForm.dimensions?.height || 0 } })} className="w-24 px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Prof." />
                              <span className="text-gray-400">x</span>
                              <input type="number" value={editForm.dimensions?.height || ""} onChange={(e) => setEditForm({ ...editForm, dimensions: { width: editForm.dimensions?.width || 0, depth: editForm.dimensions?.depth || 0, height: Number(e.target.value) } })} className="w-24 px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Alto" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Campos personalizados</label>
                              <button onClick={() => { const specs = editForm.specs || {}; const fields = specs.customFields || []; setEditForm({ ...editForm, specs: { ...specs, customFields: [...fields, { label: "", value: "" }] } }); }} className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                                <Plus className="w-3 h-3" /> Agregar campo
                              </button>
                            </div>
                            {(editForm.specs?.customFields || []).map((field, idx) => (
                              <div key={idx} className="flex gap-2 mb-2">
                                <input type="text" value={field.label} onChange={(e) => { const fields = [...(editForm.specs?.customFields || [])]; fields[idx] = { ...fields[idx], label: e.target.value }; setEditForm({ ...editForm, specs: { ...editForm.specs, customFields: fields } }); }} className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Etiqueta" />
                                <input type="text" value={field.value} onChange={(e) => { const fields = [...(editForm.specs?.customFields || [])]; fields[idx] = { ...fields[idx], value: e.target.value }; setEditForm({ ...editForm, specs: { ...editForm.specs, customFields: fields } }); }} className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white" placeholder="Valor" />
                                <button onClick={() => { const fields = [...(editForm.specs?.customFields || [])]; fields.splice(idx, 1); setEditForm({ ...editForm, specs: { ...editForm.specs, customFields: fields } }); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p
                className="text-gray-500 text-sm"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                No se encontraron productos con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      )}

      </>}

      {/* Mask Painter Modal */}
      {maskPainterId && (() => {
        const p = products.find((pr) => pr.id === maskPainterId);
        if (!p) return null;
        return (
          <MaskPainter
            productImage={p.image}
            existingMask={p.fabricMask}
            onSave={(dataUrl) => handleSaveMask(p.id, dataUrl)}
            onClose={() => setMaskPainterId(null)}
          />
        );
      })()}
    </div>
  );
}
