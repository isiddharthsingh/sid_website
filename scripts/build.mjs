// Production build: compiles each JSX file to plain JS (classic scripts,
// same load order and global-scope semantics as the dev setup), swaps the
// React dev CDN builds for production ones, and drops Babel Standalone.
// Output goes to dist/, which Netlify publishes.
import { transformSync } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');

const JSX_FILES = [
  'tweaks-panel.jsx',
  ...fs.readdirSync(path.join(root, 'components')).filter(f => f.endsWith('.jsx')).map(f => `components/${f}`),
  'app.jsx',
];

const REACT_DEV_SCRIPTS = [
  /<script src="https:\/\/unpkg\.com\/react@[^"]+\/umd\/react\.development\.js"[^>]*><\/script>/,
  /<script src="https:\/\/unpkg\.com\/react-dom@[^"]+\/umd\/react-dom\.development\.js"[^>]*><\/script>/,
  /\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^"]+"[^>]*><\/script>/,
];

const REACT_PROD_SCRIPTS = [
  '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" integrity="sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z" crossorigin="anonymous"></script>',
  '<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" integrity="sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1" crossorigin="anonymous"></script>',
  '',
];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'components'), { recursive: true });

// 1. Compile JSX → JS (React.createElement, no identifier renaming so
//    cross-file globals keep their names)
for (const rel of JSX_FILES) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  const { code } = transformSync(src, {
    loader: 'jsx',
    jsx: 'transform',
    target: 'es2019',
    minifyWhitespace: true,
    minifySyntax: true,
  });
  fs.writeFileSync(path.join(dist, rel.replace(/\.jsx$/, '.js')), code);
}

// 2. Copy static files
for (const f of fs.readdirSync(root)) {
  if (f.endsWith('.css')) fs.copyFileSync(path.join(root, f), path.join(dist, f));
}
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
  fs.copyFileSync(path.join(root, f), path.join(dist, f));
}
fs.cpSync(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });

// 3. Rewrite index.html: production React, no Babel, .jsx → compiled .js
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
REACT_DEV_SCRIPTS.forEach((re, i) => {
  if (!re.test(html)) throw new Error(`index.html: expected script tag not found: ${re}`);
  html = html.replace(re, REACT_PROD_SCRIPTS[i]);
});
const jsxTags = html.match(/type="text\/babel" src="[^"]+\.jsx"/g) || [];
if (jsxTags.length !== JSX_FILES.length) {
  throw new Error(`index.html has ${jsxTags.length} JSX script tags but ${JSX_FILES.length} JSX files were compiled`);
}
html = html.replace(/type="text\/babel" src="([^"]+)\.jsx"/g, 'src="$1.js"');
fs.writeFileSync(path.join(dist, 'index.html'), html);

console.log(`Built ${JSX_FILES.length} JSX files → dist/`);
