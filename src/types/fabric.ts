export interface FabricColor {
  name: string;
  hex: string;
  image?: string;
}

export interface FabricType {
  id: string;
  name: string;
  description?: string;
  features?: string[];
  colors: FabricColor[];
}

export interface FabricSelection {
  fabricType: string;
  colorName: string;
  colorHex: string;
  colorImage?: string;
}
