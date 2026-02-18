import { Metadata } from "next";
import { ContentPage } from "@/components/pages/ContentPage";
import { defaultContent } from "@/data/content";

export const metadata: Metadata = {
  title: "Terminos y Condiciones | Home Stock",
  description:
    "Conoce los terminos y condiciones de compra en Home Stock. Politica de cambios, devoluciones y condiciones generales.",
};

export default function Page() {
  const { title, body } = defaultContent.termsAndConditions;

  return (
    <ContentPage
      title={title}
      subtitle="Informacion importante sobre tu compra en Home Stock."
      breadcrumbs={[{ label: "Terminos y Condiciones" }]}
      htmlContent={body}
    />
  );
}
