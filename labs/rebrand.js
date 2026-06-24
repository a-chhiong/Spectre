const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, '../web-page'),
  path.join(__dirname, '../vscode-ext'),
  path.join(__dirname, '../packages/core')
];

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'out', '.DS_Store'];

const REPLACEMENTS = [
  { regex: /doctheatre/g, replacement: 'spectre' },
  { regex: /DocTheatre/g, replacement: 'Spectre' },
  { regex: /DOCTHEATRE/g, replacement: 'SPECTRE' },
  { regex: /doc-theatre/g, replacement: 'spectre' },
  { regex: /Doc-Theatre/g, replacement: 'Spectre' },
  { regex: /doc_theatre/g, replacement: 'spectre' },
  { regex: /Doc_Theatre/g, replacement: 'Spectre' }
];

let filesModified = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    if (IGNORE_DIRS.includes(file)) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    
    for (const { regex, replacement } of REPLACEMENTS) {
      newContent = newContent.replace(regex, replacement);
    }
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Modified: ${filePath}`);
      filesModified++;
    }
  } catch (error) {
    // Ignore files that can't be read as utf-8 (e.g. binary files)
    if (error.code !== 'EISDIR' && !error.message.includes('EBUSY')) {
      // console.error(`Error processing ${filePath}:`, error.message);
    }
  }
}

console.log('Starting rebranding process...');
for (const dir of DIRECTORIES) {
  if (fs.existsSync(dir)) {
    console.log(`Scanning ${dir}...`);
    walkDir(dir);
  } else {
    console.warn(`Directory not found: ${dir}`);
  }
}
console.log(`\nRebranding complete. Modified ${filesModified} files.`);
