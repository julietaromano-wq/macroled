import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const homeDirectory = resolve(import.meta.dirname, "..");
const distDirectory = resolve(homeDirectory, "dist");
const javascriptFiles = [
  "config.js",
  "products.js",
  "featured.js",
  "project-lines-concept.js",
  "home.js",
  "asistente.js",
];

export async function build() {
  await mkdir(distDirectory, { recursive: true });

  const javascriptSources = await Promise.all(
    javascriptFiles.map(async (fileName) => {
      const source = await readFile(resolve(homeDirectory, "js", fileName), "utf8");
      return `/* Source: home/js/${fileName} */\n${source.trimEnd()}`;
    }),
  );

  const bundle = [
    "/* Generated file. Edit the sources in home/js and run npm run build. */",
    ...javascriptSources,
    "",
  ].join("\n\n");
  await writeFile(resolve(distDirectory, "home.bundle.js"), bundle, "utf8");

  const css = await readFile(resolve(homeDirectory, "css", "home.css"), "utf8");
  await writeFile(resolve(distDirectory, "home.css"), css, "utf8");

  const newsletterCss = await readFile(
    resolve(homeDirectory, "css", "newsletter.css"),
    "utf8",
  );
  await writeFile(
    resolve(distDirectory, "newsletter.css"),
    newsletterCss,
    "utf8",
  );

  const newsletterJavascript = await readFile(
    resolve(homeDirectory, "js", "newsletter.js"),
    "utf8",
  );
  await writeFile(
    resolve(distDirectory, "newsletter.js"),
    newsletterJavascript,
    "utf8",
  );

  const page = await readFile(resolve(homeDirectory, "index.html"), "utf8");
  const componentStart = page.indexOf('<div id="macroled-home"');
  const scriptsStart = page.indexOf("<script src=", componentStart);

  if (componentStart === -1 || scriptsStart === -1) {
    throw new Error('No se pudo extraer el componente "#macroled-home" de home/index.html.');
  }

  const component = page.slice(componentStart, scriptsStart).trim();
  const embed = [
    "<!-- Generated file. Run npm run build after editing the Home. -->",
    component,
    "",
  ].join("\n");

  await writeFile(resolve(distDirectory, "webflow-embed.html"), embed, "utf8");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build();
  console.log("Build completed: home bundle, CSS, newsletter assets and Webflow embed");
}
