"use client";

import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, ShoppingBag, Trash2, MessageCircle } from "lucide-react";
import { Button } from "./Button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { formatPrice } from "@/lib/formatters";

export function CartSidebar() {
  const { items, isOpen, closeCart, total, itemCount, updateQuantity, removeItem, getItemKey } = useCart();

  const handleCheckout = () => {
    const itemsList = items
      .map((item) => {
        const fabricInfo = item.fabric
          ? ` (${item.fabric.fabricType} - ${item.fabric.colorName})`
          : "";
        return `- ${item.product.name}${fabricInfo} x${item.quantity} (${formatPrice(item.product.price * item.quantity)})`;
      })
      .join("\n");
    const message = `Hola! Me gustaría hacer el siguiente pedido:\n\n${itemsList}\n\n*Total: ${formatPrice(total)}*\n\n¿Podrían confirmarme disponibilidad y forma de envío?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-[var(--primary)]" />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Tu Carrito
            </h2>
            {itemCount > 0 && (
              <span className="bg-[var(--primary)] text-white text-xs px-2 py-1 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">Tu carrito está vacío</p>
              <p className="text-gray-400 text-sm mb-6">
                Explorá nuestro catálogo y agregá productos
              </p>
              <Button href="/catalogo" onClick={closeCart}>
                Ver Catálogo
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                const key = getItemKey(item);
                return (
                  <div
                    key={key}
                    className="flex gap-4 pb-6 border-b border-[var(--border)] last:border-0"
                  >
                    {/* Image */}
                    <div className="relative w-24 h-24 bg-[var(--muted)] flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--foreground)] mb-1 truncate">
                        {item.product.name}
                      </h3>
                      {item.fabric && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.fabric.colorHex }}
                          />
                          <span className="text-xs text-gray-500">
                            {item.fabric.fabricType} - {item.fabric.colorName}
                          </span>
                        </div>
                      )}
                      <p className="text-[var(--primary)] font-semibold mb-3">
                        {formatPrice(item.product.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[var(--border)]">
                          <button
                            onClick={() => updateQuantity(key, item.quantity - 1)}
                            aria-label="Reducir cantidad"
                            className="p-2 hover:bg-[var(--muted)] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 py-2 text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(key, item.quantity + 1)}
                            aria-label="Aumentar cantidad"
                            className="p-2 hover:bg-[var(--muted)] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(key)}
                          aria-label="Eliminar producto"
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 p-6 bg-white border-t border-[var(--border)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl font-semibold text-[var(--foreground)]">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Envío calculado en el checkout
            </p>
            <Button size="lg" className="w-full mb-2" onClick={handleCheckout}>
              <MessageCircle size={20} className="mr-2" />
              Finalizar por WhatsApp
            </Button>
            <button
              onClick={closeCart}
              className="w-full py-3 text-[var(--primary)] font-medium hover:underline"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
