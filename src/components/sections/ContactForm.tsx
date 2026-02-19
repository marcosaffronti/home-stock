"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { sendToCrm } from "@/lib/crm";
import { trackLead } from "@/lib/tracking";
import { LandingConfig, defaultLandingConfig, ContactInfoItem, SectionLayout } from "@/types/landing";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";

const ICON_MAP = {
  mapPin: MapPin,
  phone: Phone,
  mail: Mail,
  clock: Clock,
};

export function ContactForm({ layout }: { layout?: SectionLayout }) {
  const [config, setConfig] = useState(defaultLandingConfig.contact);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((landing) => { if (landing.contact) setConfig({ ...defaultLandingConfig.contact, ...landing.contact }); });
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Ingresá tu nombre";
    if (!formData.email.trim()) {
      newErrors.email = "Ingresá tu email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    if (formData.phone.trim() && formData.phone.replace(/\D/g, "").length < 8) {
      newErrors.phone = "El teléfono debe tener al menos 8 dígitos";
    }
    if (!formData.message.trim()) newErrors.message = "Escribí un mensaje";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    sendToCrm({ formType: "contact", data: { ...formData } });
    trackLead("contact");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
    setErrors({});

    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contacto" className="py-14 md:py-20 bg-[var(--muted)]" style={layout?.paddingY ? { paddingTop: layout.paddingY, paddingBottom: layout.paddingY } : undefined}>
      <Container>
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Contact Info */}
          <div>
            <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
              {config.sectionLabel}
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-6"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {config.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {config.description}
            </p>

            <div className="space-y-6 mb-8">
              {config.items.map((item, index) => {
                const Icon = ICON_MAP[item.icon] || MapPin;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(config.whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 font-medium hover:bg-[#20BD5A] transition-colors"
            >
              <MessageCircle size={20} />
              Escribinos por WhatsApp
            </a>
          </div>

          {/* Right - Form */}
          <div className="bg-white p-8 md:p-12">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} className="text-green-600" />
                </div>
                <h3
                  className="text-2xl font-semibold text-[var(--foreground)] mb-2"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  ¡Mensaje enviado!
                </h3>
                <p className="text-gray-600">
                  Gracias por contactarnos. Te responderemos a la brevedad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  id="name"
                  name="name"
                  label="Nombre completo"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    label="Teléfono (opcional)"
                    placeholder="+54 11 1234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[var(--foreground)] mb-2"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Contanos qué estás buscando..."
                    value={formData.message}
                    onChange={handleChange}
                    className={cn(
                      "w-full px-4 py-3 border bg-white focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-gray-400 resize-none",
                      errors.message ? "border-red-500" : "border-[var(--border)]"
                    )}
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
