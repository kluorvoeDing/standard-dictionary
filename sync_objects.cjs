const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const catalogPath = path.join(dataDir, 'catalog.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
let updatedCount = 0;

for (const entry of catalog) {
  if (entry.schema_v2_json) {
    const jsonPath = path.join(__dirname, entry.schema_v2_json);
    if (fs.existsSync(jsonPath)) {
      const v2Data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const testObjectsSet = new Set();
      
      if (v2Data.tests && Array.isArray(v2Data.tests)) {
        v2Data.tests.forEach(test => {
          if (test.test_objects && Array.isArray(test.test_objects)) {
            test.test_objects.forEach(obj => testObjectsSet.add(obj));
          }
        });
      }
      
      // Sort them to be deterministic
      const availableObjects = Array.from(testObjectsSet).sort();
      
      // Check if it's different from what we have in catalog
      const oldObjectsStr = JSON.stringify(entry.available_objects || []);
      const newObjectsStr = JSON.stringify(availableObjects);
      
      if (oldObjectsStr !== newObjectsStr) {
        console.log(`Updating ${entry.document_id}: ${oldObjectsStr} -> ${newObjectsStr}`);
        entry.available_objects = availableObjects;
        updatedCount++;
      }
    }
  }
}

if (updatedCount > 0) {
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`Sync complete. Updated ${updatedCount} catalog entries.`);
} else {
  console.log('Sync complete. No updates needed.');
}
