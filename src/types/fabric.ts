export interface FabricColor {
  name: string;
  hex: string;
}

export interface FabricType {
  id: string;
  name: string;
  colors: FabricColor[];
}

export interface FabricSelection {
  fabricType: string;
  colorName: string;
  colorHex: string;
}
