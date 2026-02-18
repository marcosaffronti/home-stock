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
  createdAt?: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}
