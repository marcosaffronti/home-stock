import { FabricSelection } from "./fabric";

export interface ProductSpecs {
  woodType?: string;
  finish?: string;
  upholstery?: string;
  seatHeight?: string;
  weight?: string;
  customFields?: { label: string; value: string }[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description?: string;
  specs?: ProductSpecs;
  features?: string[];
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  materials?: string[];
  colors?: string[];
  stock: number;
  tag?: "Nuevo" | "Destacado" | "Oferta" | "Agotado";
  featured?: boolean;
  upholstered?: boolean; // default true — set false for wood-only / hilo kraft products
  createdAt?: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  fabric?: FabricSelection;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}
