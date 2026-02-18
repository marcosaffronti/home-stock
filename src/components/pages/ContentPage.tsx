"use client";

import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface ContentPageProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  htmlContent: string;
}

export function ContentPage({
  title,
  subtitle,
  breadcrumbs,
  htmlContent,
}: ContentPageProps) {
  return (
    <>
      <Header />
      <PageHero title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />

      <section className="py-12 md:py-20 bg-white">
        <Container>
          <div
            className="content-body max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </Container>
      </section>

      <Footer />
      <WhatsAppButton />

      <style jsx global>{`
        .content-body h2 {
          font-family: var(--font-playfair), serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--foreground);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .content-body h2:first-child {
          margin-top: 0;
        }

        .content-body p {
          color: #4a4a4a;
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .content-body a {
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }

        .content-body a:hover {
          color: var(--primary-dark);
        }

        .content-body strong {
          color: var(--foreground);
          font-weight: 600;
        }

        .content-body ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .content-body ul ul {
          list-style: circle;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .content-body li {
          color: #4a4a4a;
          line-height: 1.8;
          margin-bottom: 0.5rem;
        }

        .content-body ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </>
  );
}
