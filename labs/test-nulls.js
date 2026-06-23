import fs from 'fs';
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
const sanitized = sanitizeSpec(JSON.parse(JSON.stringify(result.spec)));

function findNulls(obj, path = '') {
  if (obj === null) {
    console.log('Found null at', path);
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((val, i) => findNulls(val, `${path}[${i}]`));
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      findNulls(obj[key], `${path}.${key}`);
    }
  }
}
findNulls(sanitized);
console.log('Done looking for nulls.');
