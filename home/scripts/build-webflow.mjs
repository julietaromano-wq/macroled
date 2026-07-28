import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const project = resolve(import.meta.dirname, "..");
const dist = resolve(project, "webflow-dist");
await mkdir(dist, { recursive: true });

const html = await readFile(resolve(project, "index.html"), "utf8");
const start = html.indexOf('  <div id="macroled-home"');
const end = html.indexOf("\n  <script src=", start);
if (start < 0 || end < 0) throw new Error("No se encontró el markup de la Home.");
await writeFile(resolve(dist, "macroled-home-embed.html"), `${html.slice(start, end).trim()}\n`);
await copyFile(resolve(project, "css/home.css"), resolve(dist, "macroled-home.css"));

const modules = ["config.js", "products.js", "featured.js", "project-lines-concept.js", "home.js"];
const javascript = await Promise.all(modules.map(name => readFile(resolve(project, "js", name), "utf8")));
await writeFile(resolve(dist, "macroled-home.js"), `/* Macroled Home · archivo generado. Editar fuentes en /js y regenerar. */\n${javascript.join("\n")}\n`);

// Versión autocontenida para un único Code Embed de Webflow.
const svg = await readFile(resolve(project, "assets/images/editorial-placeholder.svg"), "utf8");
const svgData = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
const streetAmbientData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/project-street-ambient.png"))).toString("base64")}`;
const streetAmbientDarkData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/project-street-ambient-dark.png"))).toString("base64")}`;
const highbayAmbientData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/project-highbay-ambient.png"))).toString("base64")}`;
const invictusAmbientData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/project-invictus-ambient.png"))).toString("base64")}`;
const conversionLightingData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/conversion-lighting-background.png"))).toString("base64")}`;
const streetProductData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/project-street-product.png"))).toString("base64")}`;
const highbayProductData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/project-highbay-product.png"))).toString("base64")}`;
const invictusProductData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/project-invictus-product.png"))).toString("base64")}`;
const highbayProductSourceData = `data:image/webp;base64,${(await readFile(resolve(project, "assets/images/project-highbay-product-source.webp"))).toString("base64")}`;
const streetProductSourceData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/project-street-product-source.png"))).toString("base64")}`;
const casaFoaData = `data:image/png;base64,${(await readFile(resolve(project, "assets/images/casa-foa-banner-generated.png"))).toString("base64")}`;
const inlineMarkup = html.slice(start, end).trim()
  .replaceAll("assets/images/editorial-placeholder.svg", svgData)
  .replaceAll("assets/images/project-street-ambient.png", streetAmbientData)
  .replaceAll("assets/images/project-street-ambient-dark.png", streetAmbientDarkData)
  .replaceAll("assets/images/project-highbay-ambient.png", highbayAmbientData)
  .replaceAll("assets/images/project-invictus-ambient.png", invictusAmbientData)
  .replaceAll("assets/images/project-street-product.png", streetProductData)
  .replaceAll("assets/images/project-highbay-product.png", highbayProductData)
  .replaceAll("assets/images/project-invictus-product.png", invictusProductData)
  .replaceAll("assets/images/project-highbay-product-source.webp", highbayProductSourceData)
  .replaceAll("assets/images/project-street-product-source.png", streetProductSourceData)
  .replace(' poster="assets/images/hero-poster.webp"', "")
  .replace(/\s*<source src="assets\/video\/macroled-hero\.(?:webm|mp4)"[^>]*>/g, "");
const inlineCss = (await readFile(resolve(project, "css/home.css"), "utf8"))
  .replaceAll("../assets/images/editorial-placeholder.svg", svgData)
  .replaceAll("../assets/images/casa-foa-banner-generated.png", casaFoaData)
  .replaceAll("../assets/images/project-invictus-ambient.png", invictusAmbientData)
  .replaceAll("../assets/images/conversion-lighting-background.png", conversionLightingData)
  .replace("url('../assets/images/hero-poster.webp')", "none");
const inlineJs = javascript.join("\n")
  .replaceAll('"assets/images/editorial-placeholder.svg"', JSON.stringify(svgData))
  .replaceAll('"assets/images/project-street-ambient.png"', JSON.stringify(streetAmbientData))
  .replaceAll('"assets/images/project-street-ambient-dark.png"', JSON.stringify(streetAmbientDarkData))
  .replaceAll('"assets/images/project-highbay-ambient.png"', JSON.stringify(highbayAmbientData))
  .replaceAll('"assets/images/project-invictus-ambient.png"', JSON.stringify(invictusAmbientData))
  .replaceAll('"assets/images/project-street-product.png"', JSON.stringify(streetProductData))
  .replaceAll('"assets/images/project-highbay-product.png"', JSON.stringify(highbayProductData))
  .replaceAll('"assets/images/project-invictus-product.png"', JSON.stringify(invictusProductData))
  .replaceAll('"assets/images/project-highbay-product-source.webp"', JSON.stringify(highbayProductSourceData))
  .replaceAll('"assets/images/project-street-product-source.png"', JSON.stringify(streetProductSourceData));
const notoSansImport = '@import url("https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap");';
const allInOne = `${inlineMarkup}\n<style>\n${notoSansImport}\n${inlineCss}\n</style>\n<script>\n${inlineJs}\n</script>\n`;
await writeFile(resolve(dist, "macroled-home-all-in-one.html"), allInOne);
console.log("webflow-dist generado correctamente.");
