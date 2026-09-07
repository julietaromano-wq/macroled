import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const homeDirectory = resolve(import.meta.dirname, '..');

// Only renders the local preview. dist stays frozen until Webflow migrates.
export async function build() {
  const component = await readFile(resolve(homeDirectory, 'webflow-embed.html'), 'utf8');
  const newsletterPopup = await readFile(resolve(homeDirectory, 'newsletter.html'), 'utf8');
  const page = `<!doctype html>
<!-- Generated preview. Edit webflow-embed.html, then run npm run build. -->
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Prototipo de la nueva home de Macroled.">
  <title>Macroled — Iluminación que transforma</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="home.css">
  <link rel="stylesheet" href="../global/floating-ui.css">
  <link rel="stylesheet" href="newsletter.css">
</head>
<body>
${component.trim()}
  ${newsletterPopup.trim()}
  <script src="home.js"></script>
  <script src="newsletter.js"></script>
  <script src="../global/floating-ui.js"></script>
</body>
</html>
`;
  await writeFile(resolve(homeDirectory, 'index.html'), page, 'utf8');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build();
  console.log('Local preview updated. Existing dist/CDN files preserved.');
}