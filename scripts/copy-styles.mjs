import { mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const base = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(base, 'dist'), { recursive: true });
copyFileSync(join(base, 'styles', 'naviox.css'), join(base, 'dist', 'styles.css'));
