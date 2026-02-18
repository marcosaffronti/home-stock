"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getStoredValue, STORAGE_KEYS } from "@/lib/storage";

// Only allow G-XXXXXXXXXX format
function sanitizeGa4Id(id: string): string {
  return id.replace(/[^a-zA-Z0-9-]/g, "");
}

export function GoogleAnalytics() {
  const [measurementId, setMeasurementId] = useState("");

  useEffect(() => {
    const raw = getStoredValue<string>(STORAGE_KEYS.GA4_MEASUREMENT_ID, "");
    setMeasurementId(sanitizeGa4Id(raw));
  }, []);

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  );
}
