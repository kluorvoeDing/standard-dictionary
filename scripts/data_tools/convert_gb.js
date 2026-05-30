const fs = require('fs');
const path = require('path');
const OpenCC = require('opencc-js');

// 建立簡體轉繁體的轉換器 (Simplified to Traditional Taiwan)
const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

function translateJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  console.log(`Processing ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  const translated = converter(content);
  fs.writeFileSync(filePath, translated, 'utf8');
  console.log(`Translated ${filePath}`);
}

const dataDir = path.join(__dirname, '../../data');
const files = fs.readdirSync(dataDir);

files.forEach(file => {
  if (file.startsWith('GB') && file.endsWith('.json')) {
    translateJsonFile(path.join(dataDir, file));
  }
});

// Also translate catalog.json specifically for the GB files' display names, full names, scope
const catalogPath = path.join(dataDir, 'catalog.json');
if (fs.existsSync(catalogPath)) {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  let modified = false;
  catalog.forEach(doc => {
    if (doc.document_id.startsWith('GB')) {
      if (doc.display_name) doc.display_name = converter(doc.display_name);
      if (doc.full_name_zh) doc.full_name_zh = converter(doc.full_name_zh);
      if (doc.publisher) doc.publisher = converter(doc.publisher);
      if (doc.scope) doc.scope = converter(doc.scope);
      modified = true;
    }
  });
  if (modified) {
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
    console.log('Translated GB entries in catalog.json');
  }
}

console.log('Done.');
