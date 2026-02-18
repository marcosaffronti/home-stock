import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Home Stock",
  description: "Panel de administración de Home Stock",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
