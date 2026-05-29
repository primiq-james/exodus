import fs from "node:fs";
import path from "node:path";

const siteUrl = process.env.VITE_SITE_URL || "https://demo.civiqguide.com";
const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const sitemapFile = path.join(publicDir, "sitemap.xml");

const routes = [
  "/demo",
  "/demo/311",
  "/demo/utilities",
  "/demo/permits",
  "/demo/services",
  "/demo/departments",
  "/demo/accessibility",
  "/demo/privacy-policy",
  "/demo/terms-of-service",
];

function toAbsoluteUrl(route) {
  const normalized = route.startsWith("/") ? route : `/${route}`;
  return `${siteUrl}${normalized}`;
}

function buildSitemapXml(routeList) {
  const uniqueRoutes = [...new Set(routeList)];
  const today = new Date().toISOString().slice(0, 10);
  const entries = uniqueRoutes
    .map(
      (route) => `  <url>
    <loc>${toAbsoluteUrl(route)}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

const xml = buildSitemapXml(routes);
fs.writeFileSync(sitemapFile, xml, "utf8");
console.log(`Generated sitemap with ${routes.length} routes at public/sitemap.xml`);
