"use client";

import { useEffect, useState } from "react";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig, ThemeConfig, DEFAULT_THEME } from "@/types/landing";

function googleFontsUrl(headingFont: string, bodyFont: string): string | null {
  const families: string[] = [];
  if (headingFont !== "Playfair Display") {
    families.push(`family=${encodeURIComponent(headingFont)}:wght@400;500;600;700`);
  }
  if (bodyFont !== "Inter") {
    families.push(`family=${encodeURIComponent(bodyFont)}:wght@300;400;500;600`);
  }
  if (families.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

export function ThemeInjector() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((config) => {
        if (config.theme) setTheme(config.theme);
      });
  }, []);

  // Listen for real-time theme updates from admin preview
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "hs-theme-update" && e.data.theme) {
        setTheme(e.data.theme);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!theme) return null;

  const isDefault = JSON.stringify(theme) === JSON.stringify(DEFAULT_THEME);
  if (isDefault) return null;

  const fontsUrl = googleFontsUrl(theme.headingFont, theme.bodyFont);

  const cssOverrides = `:root {
${theme.primary !== DEFAULT_THEME.primary ? `  --primary: ${theme.primary};` : ""}
${theme.primaryDark !== DEFAULT_THEME.primaryDark ? `  --primary-dark: ${theme.primaryDark};` : ""}
${theme.accent !== DEFAULT_THEME.accent ? `  --accent: ${theme.accent};` : ""}
${theme.secondary !== DEFAULT_THEME.secondary ? `  --secondary: ${theme.secondary};` : ""}
${theme.muted !== DEFAULT_THEME.muted ? `  --muted: ${theme.muted};` : ""}
${theme.border !== DEFAULT_THEME.border ? `  --border: ${theme.border};` : ""}
${theme.foreground !== DEFAULT_THEME.foreground ? `  --foreground: ${theme.foreground};` : ""}
${theme.background !== DEFAULT_THEME.background ? `  --background: ${theme.background};` : ""}
${theme.headingFont !== DEFAULT_THEME.headingFont ? `  --font-playfair: '${theme.headingFont}', serif;` : ""}
${theme.bodyFont !== DEFAULT_THEME.bodyFont ? `  --font-inter: '${theme.bodyFont}', sans-serif;` : ""}
}
${theme.bodyFont !== DEFAULT_THEME.bodyFont ? `body { font-family: '${theme.bodyFont}', sans-serif !important; }` : ""}
`.replace(/^\s*\n/gm, "");

  return (
    <>
      {fontsUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={fontsUrl} />
      )}
      <style dangerouslySetInnerHTML={{ __html: cssOverrides }} />
    </>
  );
}
