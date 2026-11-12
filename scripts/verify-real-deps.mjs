// Release gate: reject lightweight type shims and incomplete framework installations.
// Run after installing dependencies from the real package registry.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const requirements = {
  "vue": [
    "dist/vue.runtime.esm-bundler.js",
    "dist/vue.d.ts"
  ],
  "vite": [
    "dist/node/index.js"
  ]
};
let failed = false;
for (const [name, files] of Object.entries(requirements)) {
  const base = resolve('node_modules',name);
  if (!existsSync(resolve(base,'package.json'))) {
    console.error(`Missing actual package: ${name}`); failed = true; continue;
  }
  const p = JSON.parse(readFileSync(resolve(base,'package.json'),'utf8'));
  for (const file of files) {
    if (!existsSync(resolve(base,file))) {
      console.error(`${name}@${p.version ?? 'unknown'} does not contain ${file} (stub or incomplete install)`);
      failed = true;
    }
  }
  if (!failed) console.log(`${name}@${p.version}: validated package files`);
}
if (failed) process.exitCode = 1;
