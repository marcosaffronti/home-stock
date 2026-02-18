export interface BenefitItem {
  title: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TestimonialItem {
  id: number;
  name: string;
  initials: string;
  role: string;
  content: string;
  rating: number;
}

export interface LandingConfig {
  hero: {
    backgroundImage: string;
    label: string;
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryHref: string;
    ctaSecondaryText: string;
    ctaSecondaryHref: string;
  };
  catalog: {
    sectionLabel: string;
    title: string;
    description: string;
  };
  gallery: {
    sectionLabel: string;
    title: string;
    description: string;
  };
  benefits: {
    sectionLabel: string;
    title: string;
    description: string;
    stats: StatItem[];
    items: BenefitItem[];
  };
  testimonials: {
    sectionLabel: string;
    title: string;
    description: string;
    items: TestimonialItem[];
  };
  featuredProductIds: number[];
}

export const defaultLandingConfig: LandingConfig = {
  hero: {
    backgroundImage: "/images/hero-bg.jpeg",
    label: "Muebles de Diseño",
    title: "Transformamos espacios en experiencias únicas",
    subtitle:
      "Descubrí nuestra colección de muebles exclusivos, diseñados para quienes buscan calidad, estilo y personalidad en cada rincón de su hogar.",
    ctaPrimaryText: "Ver Catálogo",
    ctaPrimaryHref: "#catalogo",
    ctaSecondaryText: "Ver Proyectos",
    ctaSecondaryHref: "#galeria",
  },
  catalog: {
    sectionLabel: "Nuestros Productos",
    title: "Catálogo de Muebles",
    description:
      "Explorá nuestra selección de muebles de diseño, creados con los mejores materiales y pensados para transformar tu hogar.",
  },
  gallery: {
    sectionLabel: "Proyectos Realizados",
    title: "Galería de Proyectos",
    description:
      "Conocé algunos de los espacios que hemos transformado con nuestros muebles de diseño. Cada proyecto es único.",
  },
  benefits: {
    sectionLabel: "¿Por Qué Elegirnos?",
    title: "Más que muebles, creamos experiencias",
    description:
      "En Home Stock entendemos que cada espacio cuenta una historia. Por eso nos dedicamos a crear muebles que no solo sean funcionales y estéticamente hermosos, sino que también reflejen la personalidad de quienes los habitan.",
    stats: [
      { value: "15+", label: "Años de experiencia" },
      { value: "500+", label: "Proyectos realizados" },
      { value: "98%", label: "Clientes satisfechos" },
    ],
    items: [
      {
        title: "Diseño Exclusivo",
        description:
          "Piezas únicas creadas por diseñadores locales e internacionales, pensadas para espacios con personalidad.",
      },
      {
        title: "Calidad Premium",
        description:
          "Materiales de primera calidad y terminaciones impecables que garantizan durabilidad y elegancia.",
      },
      {
        title: "Asesoramiento Personalizado",
        description:
          "Nuestro equipo de interioristas te acompaña en cada paso para encontrar los muebles perfectos.",
      },
      {
        title: "Envío e Instalación",
        description:
          "Entrega profesional y armado incluido en todo el país. Tu mueble listo para usar.",
      },
      {
        title: "Garantía Extendida",
        description:
          "Respaldamos nuestros productos con garantía de hasta 5 años en estructura y tapicería.",
      },
      {
        title: "Proyectos a Medida",
        description:
          "Fabricamos muebles personalizados según tus necesidades y dimensiones específicas.",
      },
    ],
  },
  testimonials: {
    sectionLabel: "Testimonios",
    title: "Lo que dicen nuestros clientes",
    description:
      "La satisfacción de nuestros clientes es nuestra mayor recompensa. Conocé las experiencias de quienes ya confiaron en nosotros.",
    items: [
      {
        id: 1,
        name: "María García",
        initials: "MG",
        role: "Arquitecta de Interiores",
        content:
          "Trabajar con Home Stock fue una experiencia excepcional. La calidad de sus muebles y el asesoramiento personalizado superaron todas mis expectativas. Mis clientes quedaron encantados.",
        rating: 5,
      },
      {
        id: 2,
        name: "Roberto Fernández",
        initials: "RF",
        role: "Empresario",
        content:
          "Amoblamos toda nuestra casa de fin de semana con Home Stock. El proceso fue simple, la entrega puntual y los muebles son exactamente lo que buscábamos. Calidad premium.",
        rating: 5,
      },
      {
        id: 3,
        name: "Carolina López",
        initials: "CL",
        role: "Diseñadora",
        content:
          "La atención al detalle de Home Stock es impresionante. Cada pieza que compramos es una obra de arte funcional. Definitivamente seguiremos siendo clientes.",
        rating: 5,
      },
      {
        id: 4,
        name: "Martín Ruiz",
        initials: "MR",
        role: "Hotelero",
        content:
          "Equipamos nuestro hotel boutique con muebles de Home Stock. El resultado fue espectacular y nuestros huéspedes no dejan de elogiar la decoración.",
        rating: 5,
      },
    ],
  },
  featuredProductIds: [],
};
