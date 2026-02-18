import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Catalog } from "@/components/sections/Catalog";
import { Gallery } from "@/components/sections/Gallery";
import { Benefits } from "@/components/sections/Benefits";
import { Testimonials } from "@/components/sections/Testimonials";
import { AppointmentBooking } from "@/components/sections/AppointmentBooking";
import { ContactForm } from "@/components/sections/ContactForm";
import { Footer } from "@/components/sections/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Catalog />
      <Gallery />
      <Benefits />
      <Testimonials />
      <AppointmentBooking />
      <ContactForm />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
