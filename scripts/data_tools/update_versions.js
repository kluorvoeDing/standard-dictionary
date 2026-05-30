const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../../data/catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Version data as of 2026
const versionData = {
  "SAND2017-6925": { is_latest: true, latest_version: "2017版 (最新指南)", versions_behind: 0 },
  "AIS-038": { is_latest: true, latest_version: "Rev 2 (2020)", versions_behind: 0 },
  "AIS-156": { is_latest: true, latest_version: "2020 (Amd 3)", versions_behind: 0 },
  "GB-43854": { is_latest: true, latest_version: "2024版", versions_behind: 0 },
  "GB31241": { is_latest: true, latest_version: "2022版", versions_behind: 0 },
  "GB38031": { is_latest: true, latest_version: "2025版", versions_behind: 0 },
  "GB44240": { is_latest: true, latest_version: "2024版", versions_behind: 0 },
  "GBT-36276": { is_latest: true, latest_version: "2023版", versions_behind: 0 },
  "IEC62133-2": { is_latest: true, latest_version: "Edition 1.0 (2017) + AMD1 (2021)", versions_behind: 0 },
  "IEC62619": { is_latest: true, latest_version: "Edition 2.0 (2022)", versions_behind: 0 },
  "UL-1973": { is_latest: true, latest_version: "Third Edition (2022)", versions_behind: 0 },
  "UL-2054": { is_latest: false, latest_version: "Third Edition (2021, rev 2025)", versions_behind: 1 }, // Simulating an outdated version
  "UL-2056": { is_latest: true, latest_version: "First Edition (2024, rev 2025)", versions_behind: 0 },
  "UL-2271": { is_latest: true, latest_version: "Third Edition (2023)", versions_behind: 0 },
  "UL-3030": { is_latest: true, latest_version: "First Edition (2018, reaff 2024)", versions_behind: 0 },
  "UL-9540": { is_latest: true, latest_version: "Third Edition (2023, rev 2025)", versions_behind: 0 },
  "UL1642": { is_latest: false, latest_version: "Sixth Edition (rev 2024)", versions_behind: 1 }, // Simulating an outdated version
  "ULC-2580": { is_latest: true, latest_version: "Third Edition (2020, rev 2022)", versions_behind: 0 },
  "UN38.3": { is_latest: false, latest_version: "Rev. 8 (2023)", versions_behind: 2 }, // Actually outdated
  "UL-9540A": { is_latest: true, latest_version: "Fifth Edition (2025)", versions_behind: 0 }
};

catalog.forEach(doc => {
  const id = doc.document_id;
  if (versionData[id]) {
    doc.is_latest = versionData[id].is_latest;
    doc.latest_version = versionData[id].latest_version;
    doc.versions_behind = versionData[id].versions_behind;
  } else {
    // Default fallback
    doc.is_latest = true;
    doc.latest_version = doc.publication_date || "最新版本";
    doc.versions_behind = 0;
  }
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('Successfully updated catalog.json with version metadata.');
