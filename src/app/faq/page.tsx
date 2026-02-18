import { Metadata } from "next";
import { FaqPage } from "@/components/pages/FaqPage";
import { defaultContent } from "@/data/content";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Home Stock",
  description:
    "Respuestas a las preguntas mas frecuentes sobre envios, formas de pago, cambios y mas en Home Stock.",
};

export default function Page() {
  return <FaqPage items={defaultContent.faq.items} />;
}
