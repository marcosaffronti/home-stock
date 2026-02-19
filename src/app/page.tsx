import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { LandingRenderer } from "@/components/landing/LandingRenderer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <LandingRenderer />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
