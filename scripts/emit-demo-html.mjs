import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const distDir = path.join(appRoot, "dist");
const indexPath = path.join(distDir, "index.html");
const routesConfigPath = path.join(appRoot, "demo-routes.config.json");

const routeConfig = JSON.parse(await readFile(routesConfigPath, "utf8"));
const indexHtml = await readFile(indexPath, "utf8");

const htmlRoutes = routeConfig
  .filter((route) => route?.serveAsHtml === true)
  .map((route) => String(route.path || "").trim())
  .filter((route) => route.startsWith("/"));

for (const route of htmlRoutes) {
  const routeDir = path.join(distDir, route.replace(/^\/+/, ""));
  await mkdir(routeDir, { recursive: true });
  await writeFile(path.join(routeDir, "index.html"), indexHtml, "utf8");
}

console.log(
  `Emitted static HTML for ${htmlRoutes.length} demo routes in ${distDir}`
);
