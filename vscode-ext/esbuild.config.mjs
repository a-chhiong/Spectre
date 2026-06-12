import esbuild from 'esbuild';

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
