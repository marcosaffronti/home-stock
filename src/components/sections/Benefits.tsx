import { Container } from "@/components/ui/Container";
import { Truck, Shield, Palette, Users, Award, Wrench } from "lucide-react";

const benefits = [
  {
    icon: Palette,
    title: "Diseño Exclusivo",
    description: "Piezas únicas creadas por diseñadores locales e internacionales, pensadas para espacios con personalidad.",
  },
  {
    icon: Award,
    title: "Calidad Premium",
    description: "Materiales de primera calidad y terminaciones impecables que garantizan durabilidad y elegancia.",
  },
  {
    icon: Users,
    title: "Asesoramiento Personalizado",
    description: "Nuestro equipo de interioristas te acompaña en cada paso para encontrar los muebles perfectos.",
  },
  {
    icon: Truck,
    title: "Envío e Instalación",
    description: "Entrega profesional y armado incluido en todo el país. Tu mueble listo para usar.",
  },
  {
    icon: Shield,
    title: "Garantía Extendida",
    description: "Respaldamos nuestros productos con garantía de hasta 5 años en estructura y tapicería.",
  },
  {
    icon: Wrench,
    title: "Proyectos a Medida",
    description: "Fabricamos muebles personalizados según tus necesidades y dimensiones específicas.",
  },
];

export function Benefits() {
  return (
    <section id="nosotros" className="py-20 md:py-32 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
              ¿Por Qué Elegirnos?
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-6"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Más que muebles, creamos experiencias
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              En Home Stock entendemos que cada espacio cuenta una historia. Por
              eso nos dedicamos a crear muebles que no solo sean funcionales y
              estéticamente hermosos, sino que también reflejen la personalidad
              de quienes los habitan.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <p
                  className="text-4xl font-semibold text-[var(--primary)]"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  15+
                </p>
                <p className="text-gray-600 text-sm">Años de experiencia</p>
              </div>
              <div className="w-[1px] h-12 bg-[var(--border)]" />
              <div>
                <p
                  className="text-4xl font-semibold text-[var(--primary)]"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  500+
                </p>
                <p className="text-gray-600 text-sm">Proyectos realizados</p>
              </div>
              <div className="w-[1px] h-12 bg-[var(--border)]" />
              <div>
                <p
                  className="text-4xl font-semibold text-[var(--primary)]"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  98%
                </p>
                <p className="text-gray-600 text-sm">Clientes satisfechos</p>
              </div>
            </div>
          </div>

          {/* Right Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 border border-[var(--border)] hover:border-[var(--primary)] transition-colors group"
              >
                <div className="w-12 h-12 bg-[var(--muted)] flex items-center justify-center mb-4 group-hover:bg-[var(--primary)] transition-colors">
                  <benefit.icon
                    size={24}
                    className="text-[var(--primary)] group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
