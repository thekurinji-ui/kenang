import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageMetadataInput {
  title: string;
  description?: string;
  path?: string;
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
}: PageMetadataInput): Metadata {
  const url = `${siteConfig.url}${path}`;

  const fullTitle =
    path === "/" ? title : `${title} · ${siteConfig.name}`;

  return {
    title: fullTitle,

    description,

    // Next.js mengharapkan string[] biasa, bukan readonly tuple.
    keywords: [...siteConfig.keywords],

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: "id_ID",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
