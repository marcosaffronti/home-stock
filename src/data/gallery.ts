export interface GalleryProject {
  id: number;
  title: string;
  category: string;
  image: string;
  span?: string;
}

export const galleryCategories = [
  "Todos",
  "Comedores",
  "Ambientes",
  "Productos",
  "Showroom",
  "Producción",
];

export const allProjects: GalleryProject[] = [
  {
    id: 1,
    title: "Comedor con Sillas Ibiza",
    category: "Comedores",
    image: "/images/gallery/comedor-ibiza.jpg",
  },
  {
    id: 2,
    title: "Cabecera & Silla Ibiza",
    category: "Productos",
    image: "/images/gallery/cabecera-silla-ibiza.jpeg",
  },
  {
    id: 3,
    title: "Mesa Redonda Exterior",
    category: "Ambientes",
    image: "/images/gallery/mesa-redonda-exterior.jpg",
  },
  {
    id: 4,
    title: "Showroom Home Stock",
    category: "Showroom",
    image: "/images/gallery/showroom-mesa.jpg",
  },
  {
    id: 5,
    title: "Producción Artesanal",
    category: "Producción",
    image: "/images/gallery/produccion-sillas.jpg",
  },
  {
    id: 6,
    title: "Comedor Completo",
    category: "Comedores",
    image: "/images/gallery/comedor-ibiza-2.jpg",
  },
  {
    id: 7,
    title: "Showroom Telas",
    category: "Showroom",
    image: "/images/gallery/showroom-telas.jpg",
  },
  {
    id: 8,
    title: "Comedor de Diseño",
    category: "Comedores",
    image: "/images/gallery/comedor-completo.jpeg",
  },
];

export const featuredProjects: GalleryProject[] = [
  {
    ...allProjects[0],
    span: "col-span-2 row-span-2",
  },
  {
    ...allProjects[1],
    span: "col-span-1 row-span-1",
  },
  {
    ...allProjects[2],
    span: "col-span-1 row-span-1",
  },
  {
    ...allProjects[3],
    span: "col-span-1 row-span-1",
  },
  {
    ...allProjects[4],
    span: "col-span-1 row-span-2",
  },
  {
    ...allProjects[5],
    span: "col-span-1 row-span-1",
  },
];
