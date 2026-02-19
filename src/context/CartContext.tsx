"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { Product, CartItem } from "@/types/product";
import { FabricSelection } from "@/types/fabric";
import { trackAddToCart } from "@/lib/tracking";
import { trackEvent } from "@/components/tracking/SiteTracker";

function getCartItemKey(productId: number, fabric?: FabricSelection): string {
  if (!fabric) return String(productId);
  return `${productId}-${fabric.fabricType}-${fabric.colorName}`;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; fabric?: FabricSelection; quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { key: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, fabric, quantity = 1 } = action.payload;
      const key = getCartItemKey(product.id, fabric);
      const existingItem = state.items.find(
        (item) => getCartItemKey(item.product.id, item.fabric) === key
      );

      if (existingItem) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((item) =>
            getCartItemKey(item.product.id, item.fabric) === key
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        isOpen: true,
        items: [...state.items, { product, quantity, fabric }],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => getCartItemKey(item.product.id, item.fabric) !== action.payload
        ),
      };

    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => getCartItemKey(item.product.id, item.fabric) !== action.payload.key
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          getCartItemKey(item.product.id, item.fabric) === action.payload.key
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "OPEN_CART":
      return { ...state, isOpen: true };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    case "LOAD_CART":
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  itemCount: number;
  addItem: (product: Product, fabric?: FabricSelection, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getItemKey: (item: CartItem) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("homestock-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: parsedCart });
      } catch {
        localStorage.removeItem("homestock-cart");
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("homestock-cart", JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (product: Product, fabric?: FabricSelection, quantity?: number) => {
    dispatch({ type: "ADD_ITEM", payload: { product, fabric, quantity } });
    trackAddToCart({ name: product.name, price: product.price, id: product.id });
    trackEvent("cart_add", { productId: product.id, productName: product.name });
  };

  const removeItem = (key: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: key });
  };

  const updateQuantity = (key: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { key, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const openCart = () => {
    dispatch({ type: "OPEN_CART" });
  };

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  const getItemKey = (item: CartItem) => getCartItemKey(item.product.id, item.fabric);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getItemKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
