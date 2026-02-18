import { Metadata } from "next";
import { ContentPage } from "@/components/pages/ContentPage";
import { defaultContent } from "@/data/content";

export const metadata: Metadata = {
  title: "Politica de Envios | Home Stock",
  description:
    "Toda la informacion sobre envios, plazos de entrega, costos y retiro en showroom de Home Stock.",
};

export default function Page() {
  const { title, body } = defaultContent.shippingPolicy;

  return (
    <ContentPage
      title={title}
      subtitle="Todo lo que necesitas saber sobre como recibir tu pedido."
      breadcrumbs={[{ label: "Politica de Envios" }]}
      htmlContent={body}
    />
  );
}
