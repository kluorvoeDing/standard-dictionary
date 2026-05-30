const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../../data/catalog.json');
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Define the prerequisites mapping
const prerequisitesMap = {
  "UL1973": {
    "CELL": ["UL 1642", "IEC 62133", "UL 2580"],
    "MODULE": ["UL 2580"]
  },
  "UL9540": {
    "CELL": ["UL 1642"],
    "MODULE": ["UL 1973"],
    "PACK": ["UL 1973"],
    "SYSTEM": ["UL 1973"]
  },
  "UL9540A": {
    "CELL": ["UL 1642"],
    "MODULE": ["UL 1973"],
    "PACK": ["UL 1973"],
    "SYSTEM": ["UL 1973"]
  },
  "UL2271": {
    "CELL": ["UL 1642", "UL 2271 (Cell tests)", "UL 2580"]
  },
  "UL2054": {
    "CELL": ["UL 1642"]
  },
  "UL2056": {
    "CELL": ["UL 1642"]
  },
  "UL3030": {
    "CELL": ["UL 1642"]
  },
  "ULC2580": {
    "CELL": ["UL 1642", "UL 2271"]
  },
  "AIS-038": {
    "CELL": ["AIS-038", "IS 16893"]
  },
  "AIS-156": {
    "CELL": ["IS 16893"]
  }
};

catalog.forEach(doc => {
  // Try to find if base_standard_id or document_id starts with the keys in prerequisitesMap
  const baseId = (doc.base_standard_id || doc.document_id).replace(/-/g, '');
  
  let pr = {};
  for (const [key, value] of Object.entries(prerequisitesMap)) {
    const cleanKey = key.replace(/-/g, '');
    if (baseId.startsWith(cleanKey)) {
      pr = value;
      break;
    }
  }
  
  doc.prerequisites = pr;
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('Updated catalog.json with prerequisites');
