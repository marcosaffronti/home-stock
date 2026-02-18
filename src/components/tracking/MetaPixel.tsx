"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";

// Only allow numeric pixel IDs
function sanitizePixelId(id: string): string {
  return id.replace(/[^0-9]/g, "");
}

export function MetaPixel() {
  const [pixelId, setPixelId] = useState("");

  useEffect(() => {
    fetchFromServer<string>(STORAGE_KEYS.META_PIXEL_ID, "").then((raw) => {
      setPixelId(sanitizePixelId(raw));
    });
  }, []);

  if (!pixelId) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}
