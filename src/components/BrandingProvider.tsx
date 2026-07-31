"use client";

import { useEffect } from "react";

type Branding = Record<string, string>;

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch("/api/branding")
      .then((r) => r.json())
      .then((d: { branding: Branding }) => {
        const b = d.branding;
        if (!b) return;
        if (b.brand_primary_color) document.documentElement.style.setProperty("--brand-primary", b.brand_primary_color);
        if (b.brand_secondary_color) document.documentElement.style.setProperty("--brand-secondary", b.brand_secondary_color);
        if (b.app_name) document.title = b.app_name;
      })
      .catch(() => null);
  }, []);

  return <>{children}</>;
}
