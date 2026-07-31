import chokidar from "chokidar";
import { resolve } from "node:path";
import { build } from "./build.mjs";

const homeDirectory = resolve(import.meta.dirname, "..");
const javascriptDirectory = resolve(homeDirectory, "js");
const cssFile = resolve(homeDirectory, "css", "home.css");
const htmlFile = resolve(homeDirectory, "index.html");
const watchedPaths = [
  javascriptDirectory,
  cssFile,
  htmlFile,
];

let building = false;
let buildQueued = false;

function currentTime() {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

async function rebuild() {
  if (building) {
    buildQueued = true;
    return;
  }

  building = true;
  do {
    buildQueued = false;
    try {
      await build();
      console.log(`✓ Bundle actualizado - ${currentTime()}`);
    } catch (error) {
      console.error(`✗ Error durante el build - ${currentTime()}`);
      console.error(error);
    }
  } while (buildQueued);
  building = false;
}

await rebuild();

const watcher = chokidar.watch(watchedPaths, {
  ignoreInitial: true,
  depth: 0,
  awaitWriteFinish: {
    stabilityThreshold: 150,
    pollInterval: 25,
  },
});

watcher.on("all", (_event, changedPath) => {
  if (changedPath !== cssFile && changedPath !== htmlFile && !changedPath.endsWith(".js")) return;
  console.log(`Cambio detectado: ${changedPath}`);
  void rebuild();
});

watcher.on("error", (error) => {
  console.error("Error del watcher:", error);
});

console.log("Vigilando home/index.html, home/js/*.js y home/css/home.css (Ctrl+C para salir)");
