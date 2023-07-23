const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["./src/index.ts"],
  outfile: "dist/index.js",
  platform: "node",
  target: "node14",
  bundle: true,
  minify: true,
});
