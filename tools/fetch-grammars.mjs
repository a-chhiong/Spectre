#!/usr/bin/env node

/**
 * fetch-grammars.mjs
 *
 * Fetches TextMate grammars from upstream repositories and writes them
 * to web-page/public/syntaxes/ for use by the Shiki highlighting engine.
 *
 * Dependencies: js-yaml (for YAML→JSON conversion of PlantUML grammar)
 * All other modules are Node.js built-ins (fs, path, https, zlib).
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import zlib from 'node:zlib';
import yaml from 'js-yaml';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'tools', 'syntaxes');

// --- Configuration ---

const PLANTUML_URL =
  'https://raw.githubusercontent.com/qjebbs/vscode-plantuml/master/syntaxes/plantuml.yaml-tmLanguage';

const MERMAID_BASE_URL =
  'https://raw.githubusercontent.com/Mermaid-Chart/vscode-mermaid-chart/main/syntaxes/';

const MERMAID_MASTER = 'mermaid.tmLanguage.json';

// Actual filenames in the mermaid-chart/vscode-mermaid-chart repo (24 sub-grammars)
const MERMAID_SUB_GRAMMARS = [
  'mermaid-architecture.tmLanguage.json',
  'mermaid-block.tmLanguage.json',
  'mermaid-c4Diagram.tmLanguage.json',
  'mermaid-classDiagram.tmLanguage.json',
  'mermaid-erDiagram.tmLanguage.json',
  'mermaid-flowchart.tmLanguage.json',
  'mermaid-gantt.tmLanguage.json',
  'mermaid-gitGraph.tmLanguage.json',
  'mermaid-info.tmLanguage.json',
  'mermaid-journey.tmLanguage.json',
  'mermaid-kanban.tmLanguage.json',
  'mermaid-markdown.json',
  'mermaid-mindmap.tmLanguage.json',
  'mermaid-packet.tmLanguage.json',
  'mermaid-pie.tmLanguage.json',
  'mermaid-quadrantChart.tmLanguage.json',
  'mermaid-radar.tmLanguage.json',
  'mermaid-requirementDiagram.tmLanguage.json',
  'mermaid-sankeyDiagram.tmLanguage.json',
  'mermaid-sequenceDiagram.tmLanguage.json',
  'mermaid-stateDiagram.tmLanguage.json',
  'mermaid-timeline.tmLanguage.json',
  'mermaid-xychart.tmLanguage.json',
  'mermaid-zenuml.tmLanguage.json',
];

const OPEN_VSX_DBML_API =
  'https://open-vsx.org/api/dbdiagram/dbdiagram-vscode/latest';

// --- Helpers ---

/**
 * Fetch a URL over HTTPS, following up to 5 redirects.
 * Returns a Buffer on success.
 * Throws with HTTP status and URL on failure.
 */
function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const doFetch = (currentUrl, redirectsLeft) => {
      https.get(currentUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectsLeft <= 0) {
            reject(new Error(`Too many redirects for ${url}`));
            return;
          }
          const redirectUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, currentUrl).href;
          doFetch(redirectUrl, redirectsLeft - 1);
          return;
        }

        if (res.statusCode !== 200) {
          // Consume response to free up resources
          res.resume();
          reject(
            Object.assign(
              new Error(`HTTP ${res.statusCode} fetching ${currentUrl}`),
              { statusCode: res.statusCode, url: currentUrl }
            )
          );
          return;
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    };

    doFetch(url, maxRedirects);
  });
}

/**
 * Parse a ZIP archive buffer and extract the content of a specific file entry.
 * Uses the Central Directory (at end of ZIP) to locate the file reliably,
 * then reads from the local file header. Handles STORED and DEFLATED methods.
 * VSIX files are standard ZIP archives.
 */
function extractFileFromZip(zipBuffer, targetPath) {
  const buf = zipBuffer;

  // Find End of Central Directory record (EOCD)
  // EOCD signature: PK\x05\x06 (0x06054b50)
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 65557; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Cannot find End of Central Directory record in ZIP');
  }

  const centralDirOffset = buf.readUInt32LE(eocdOffset + 16);
  const centralDirEntries = buf.readUInt16LE(eocdOffset + 10);

  // Walk the Central Directory to find our target file
  let offset = centralDirOffset;
  for (let i = 0; i < centralDirEntries; i++) {
    const sig = buf.readUInt32LE(offset);
    if (sig !== 0x02014b50) {
      throw new Error('Invalid central directory entry signature');
    }

    const compressionMethod = buf.readUInt16LE(offset + 10);
    const compressedSize = buf.readUInt32LE(offset + 20);
    const fileNameLen = buf.readUInt16LE(offset + 28);
    const extraFieldLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    const localHeaderOffset = buf.readUInt32LE(offset + 42);

    const fileName = buf.toString('utf8', offset + 46, offset + 46 + fileNameLen);

    if (fileName === targetPath) {
      // Read from the local file header to get actual data
      const localSig = buf.readUInt32LE(localHeaderOffset);
      if (localSig !== 0x04034b50) {
        throw new Error('Invalid local file header for ' + fileName);
      }
      const localFileNameLen = buf.readUInt16LE(localHeaderOffset + 26);
      const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localFileNameLen + localExtraLen;
      const rawData = buf.subarray(dataStart, dataStart + compressedSize);

      if (compressionMethod === 0) {
        return rawData;
      } else if (compressionMethod === 8) {
        return zlib.inflateRawSync(rawData);
      } else {
        throw new Error(
          `Unsupported compression method ${compressionMethod} for ${fileName}`
        );
      }
    }

    // Advance to next central directory entry
    offset += 46 + fileNameLen + extraFieldLen + commentLen;
  }

  throw new Error(`File "${targetPath}" not found in ZIP archive`);
}

// --- Fetchers ---

async function fetchPlantUML() {
  const buf = await fetchUrl(PLANTUML_URL);
  const yamlContent = buf.toString('utf8');
  const grammarObj = yaml.load(yamlContent);
  const jsonContent = JSON.stringify(grammarObj, null, 2);
  const outputFile = 'plantuml.tmLanguage.json';
  fs.writeFileSync(path.join(OUTPUT_DIR, outputFile), jsonContent, 'utf8');
  return { file: outputFile, source: PLANTUML_URL };
}

async function fetchMermaidGrammars() {
  const results = [];

  // Master grammar
  const masterUrl = MERMAID_BASE_URL + MERMAID_MASTER;
  const masterBuf = await fetchUrl(masterUrl);
  fs.writeFileSync(path.join(OUTPUT_DIR, MERMAID_MASTER), masterBuf);
  results.push({ file: MERMAID_MASTER, source: masterUrl });

  // Sub-grammars
  for (const fileName of MERMAID_SUB_GRAMMARS) {
    const url = MERMAID_BASE_URL + fileName;
    const buf = await fetchUrl(url);
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), buf);
    results.push({ file: fileName, source: url });
  }

  return results;
}

async function fetchDBML() {
  // Step 1: Get latest version metadata
  const metaBuf = await fetchUrl(OPEN_VSX_DBML_API);
  const meta = JSON.parse(metaBuf.toString('utf8'));

  // Step 2: Download the .vsix file
  // The metadata contains a "files" object with a "download" URL
  const version = meta.version;
  const downloadUrl =
    meta.files?.download ||
    `https://open-vsx.org/api/dbdiagram/dbdiagram-vscode/${version}/file/dbdiagram.dbdiagram-vscode-${version}.vsix`;

  const vsixBuf = await fetchUrl(downloadUrl);

  // Step 3: Extract the grammar from the ZIP archive
  const grammarContent = extractFileFromZip(
    vsixBuf,
    'extension/syntaxes/dbml.tmLanguage.json'
  );

  const outputFile = 'dbml.tmLanguage.json';
  fs.writeFileSync(path.join(OUTPUT_DIR, outputFile), grammarContent);
  return { file: outputFile, source: downloadUrl };
}

// --- Main ---

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const summary = [];

  try {
    // Fetch PlantUML
    console.log('Fetching PlantUML grammar...');
    const plantumlResult = await fetchPlantUML();
    summary.push(plantumlResult);
    console.log(`  ✓ ${plantumlResult.file}`);

    // Fetch Mermaid grammars
    console.log('Fetching Mermaid grammars...');
    const mermaidResults = await fetchMermaidGrammars();
    summary.push(...mermaidResults);
    for (const r of mermaidResults) {
      console.log(`  ✓ ${r.file}`);
    }

    // Fetch DBML
    console.log('Fetching DBML grammar...');
    const dbmlResult = await fetchDBML();
    summary.push(dbmlResult);
    console.log(`  ✓ ${dbmlResult.file}`);
  } catch (err) {
    const status = err.statusCode || 'unknown';
    const file = err.url || 'unknown';
    console.error(`\nFetch failed: HTTP ${status} — ${file}`);
    console.error(err.message);
    process.exit(1);
  }

  // Print summary
  console.log(`\n=== Grammar Fetch Summary ===`);
  console.log(`Total grammars written: ${summary.length}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);
  for (const { file, source } of summary) {
    console.log(`  ${file}`);
    console.log(`    ← ${source}`);
  }
  console.log('');
}

main();
