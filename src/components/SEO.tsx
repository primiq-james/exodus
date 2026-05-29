import { Helmet } from "react-helmet-async";
import { SEO_DEFAULTS, type SeoInput, buildSeo } from "../lib/seo";

export default function SEO(props: SeoInput) {
  const seo = buildSeo(props);
  const schemaArray = Array.isArray(seo.schema)
    ? seo.schema
    : seo.schema
      ? [seo.schema]
      : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.canonical} />

      {seo.noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      <meta name="theme-color" content={SEO_DEFAULTS.themeColor} />

      <meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
      <meta property="og:type" content={seo.type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.canonical} />
      <meta property="og:image" content={seo.imageAbs} />
      <meta property="og:locale" content={SEO_DEFAULTS.locale} />

      {seo.type === "article" && seo.publishedTime ? (
        <meta property="article:published_time" content={seo.publishedTime} />
      ) : null}
      {seo.type === "article" && seo.modifiedTime ? (
        <meta property="article:modified_time" content={seo.modifiedTime} />
      ) : null}
      {seo.type === "article" && seo.authorName ? (
        <meta property="article:author" content={seo.authorName} />
      ) : null}

      <meta name="twitter:card" content="summary_large_image" />
      {SEO_DEFAULTS.twitterHandle ? (
        <meta name="twitter:site" content={SEO_DEFAULTS.twitterHandle} />
      ) : null}
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.imageAbs} />

      {schemaArray.map((obj, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
