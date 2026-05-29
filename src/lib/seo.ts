export type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  keywords?: string[];
  schema?: object | object[];
};

export const SEO_DEFAULTS = {
  siteName: "CivIQ Demo",
  siteUrl:
    (import.meta.env.VITE_SITE_URL as string | undefined) || "https://demo.civiqguide.com",
  defaultTitle: "CivIQ Demo | Government AI Assistant",
  titleTemplate: "%s | CivIQ Demo",
  defaultDescription:
    "CivIQ Demo showcases a government AI assistant with source-grounded answers, service routing, and resident experience flows.",
  defaultOgImage: "https://demo.civiqguide.com/demo-og-logo-1200x630.png?v=20260227a",
  twitterHandle: "@CivIQGuide",
  locale: "en_US",
  themeColor: "#0A0F1C",
};

export function toAbsoluteUrl(urlOrPath?: string) {
  if (!urlOrPath) return "";
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    return urlOrPath;
  }
  const normalizedPath = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
  return `${SEO_DEFAULTS.siteUrl}${normalizedPath}`;
}

export function buildSeo(input: SeoInput = {}) {
  const title = input.title
    ? SEO_DEFAULTS.titleTemplate.replace("%s", input.title)
    : SEO_DEFAULTS.defaultTitle;
  const description = input.description?.trim() || SEO_DEFAULTS.defaultDescription;

  return {
    title,
    description,
    canonical: toAbsoluteUrl(input.path || "/"),
    imageAbs: toAbsoluteUrl(input.image || SEO_DEFAULTS.defaultOgImage),
    noindex: Boolean(input.noindex),
    type: input.type || "website",
    publishedTime: input.publishedTime,
    modifiedTime: input.modifiedTime,
    authorName: input.authorName,
    keywords: input.keywords || [],
    schema: input.schema,
  };
}
