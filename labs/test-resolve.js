import fs from 'fs';
import yaml from 'js-yaml';
import { resolverService, sanitizeSpec } from './packages/core/src/utils/spec-resolver.js';
import path from 'path';

function loadFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      loadFiles(filePath, fileList);
    } else if (filePath.endsWith('.yaml') || filePath.endsWith('.json') || filePath.endsWith('.md')) {
      fileList.push({
        path: path.relative('.examples/openapi', filePath).replace(/\\/g, '/'),
        type: 'file',
        content: fs.readFileSync(filePath, 'utf8')
      });
    }
  }
  return fileList;
}

const files = loadFiles('.examples/openapi');
const result = resolverService.resolve(files, 'openapi.yaml');
console.log('Errors:', result.errors);
const sanitized = sanitizeSpec(JSON.parse(JSON.stringify(result.spec)));
const jsonStr = JSON.stringify(sanitized, null, 2);
console.log('Contains NotFound:', jsonStr.includes('errors/NotFound'));
console.log('Contains PointerNotFound:', jsonStr.includes('errors/PointerNotFound'));
console.log('Contains ParseError:', jsonStr.includes('errors/ParseError'));
