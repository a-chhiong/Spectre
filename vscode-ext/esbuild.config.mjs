import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch');

// ─── 1. Extension Host (Node.js CJS) ─────────────────────────────────────────
const hostConfig = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'out/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  minify: false,
};

// ─── 2. Webview Bundle (Browser ESM) ─────────────────────────────────────────
const webviewConfig = {
  entryPoints: ['src/webview/main.js'],
  bundle: true,
  outfile: 'out/webview/main.js',
  format: 'esm',
  platform: 'browser',
  target: ['es2020', 'chrome102'],
  sourcemap: true,
  minify: false,
  // CSS imported from JS is emitted as out/webview/main.css
  loader: { '.css': 'css' },
};

if (isWatch) {
  const [hostCtx, webviewCtx] = await Promise.all([
    esbuild.context(hostConfig),
    esbuild.context(webviewConfig),
  ]);
  await Promise.all([hostCtx.watch(), webviewCtx.watch()]);
  console.log('[esbuild] Watching for changes…');
} else {
  await Promise.all([
    esbuild.build(hostConfig),
    esbuild.build(webviewConfig),
  ]);
  console.log('[esbuild] Build complete.');
}

// ─── 3. Copy Assets ────────────────────────────────────────────────────────
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const swaggerBundlePath = require.resolve('swagger-ui-dist/swagger-ui-bundle.js');
const swaggerDist = path.dirname(swaggerBundlePath);
const swaggerOut = 'out/webview/vendor/swagger';
fs.mkdirSync(swaggerOut, { recursive: true });
fs.copyFileSync(path.join(swaggerDist, 'swagger-ui-bundle.js'), path.join(swaggerOut, 'swagger-ui-bundle.js'));
fs.copyFileSync(path.join(swaggerDist, 'swagger-ui.css'), path.join(swaggerOut, 'swagger-ui.css'));

const rapipdfPath = require.resolve('rapipdf/dist/rapipdf-min.js');
const rapipdfDist = path.dirname(rapipdfPath);
const rapipdfOut = 'out/webview/vendor/rapipdf';
fs.mkdirSync(rapipdfOut, { recursive: true });
fs.copyFileSync(path.join(rapipdfDist, 'rapipdf-min.js'), path.join(rapipdfOut, 'rapipdf-min.js'));

console.log('[esbuild] Copied vendor assets.');
