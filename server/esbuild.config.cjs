// use esbuild to bundle all the .ts file to .js for production purpose
const { build } = require("esbuild");

build({
  entryPoints: ["api/server.ts"],
  outfile: "../dist/server/server.js",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  sourcemap: true,
}).catch(() => process.exit(1));
