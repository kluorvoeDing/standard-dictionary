const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const catalogPath = path.join(__dirname, '../../data/catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Filter for standards that are CURRENTLY marked as latest
const targetStandards = catalog.filter(obj => obj.is_latest === true);

if (targetStandards.length === 0) {
    console.log("No active standards to check. Exiting.");
    process.exit(0);
}

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
];

async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function extractMaxYear(text) {
    if (!text) return 0;
    const matches = text.match(/20[1-3][0-9]/g);
    if (!matches) return 0;
    return Math.max(...matches.map(Number));
}

async function searchDDGSnippets(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
    
    try {
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
        const response = await fetch(url, {
            headers: {
                'User-Agent': randomUA,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });
        
        if (!response.ok) return [];

        const html = await response.text();
        const $ = cheerio.load(html);
        
        const snippets = [];
        $('.result__snippet').each((i, el) => {
            if (i >= 5) return;
            snippets.push($(el).text());
        });
        
        return snippets;
    } catch (e) {
        return [];
    }
}

async function main() {
    let issueContent = "哨兵爬蟲 (Version Checker) 巡邏結果：發現以下標準在網路上出現了比資料庫更新的年份，請人工確認是否需要將 `is_latest` 標記為 `false`。\n\n";
    let foundAnything = false;
    const currentYear = new Date().getFullYear();

    for (const std of targetStandards) {
        console.log(`Checking version for: ${std.document_id}...`);
        
        const knownYearStr = (std.latest_version || "") + " " + (std.publication_date || "");
        const knownYear = extractMaxYear(knownYearStr);
        
        if (knownYear === 0) {
            console.log(`  Cannot determine current year for ${std.document_id}, skipping.`);
            continue;
        }

        const query = `"${std.document_id}" latest active version year`;
        const snippets = await searchDDGSnippets(query);
        const combinedSnippets = snippets.join(" ");
        
        const snippetMaxYear = extractMaxYear(combinedSnippets);
        
        // If we found a year greater than known year, and it's a realistic release year (not far future)
        if (snippetMaxYear > knownYear && snippetMaxYear <= currentYear + 1) {
            foundAnything = true;
            console.log(`  [ALERT] Found newer year ${snippetMaxYear} (Known: ${knownYear})`);
            issueContent += `### ${std.document_id} (${std.display_name})\n`;
            issueContent += `- **目前資料庫紀錄最新版**：${std.latest_version}\n`;
            issueContent += `- **網路上偵測到的新年份**：${snippetMaxYear}\n\n`;
            
            // Output top 2 snippets for context
            issueContent += `> **網路摘要參考**：\n`;
            snippets.slice(0, 2).forEach(snip => {
                issueContent += `> - ${snip.replace(/\n/g, ' ')}\n`;
            });
            issueContent += "\n";
        } else {
            console.log(`  [OK] Max found: ${snippetMaxYear}, Known: ${knownYear}`);
        }
        
        await delay(3000);
    }

    if (foundAnything) {
        const outputPath = path.join(__dirname, 'version_alerts.md');
        fs.writeFileSync(outputPath, issueContent, 'utf8');
        console.log("Checker finished. Alerts saved to version_alerts.md");
    } else {
        console.log("Checker finished. No new versions detected.");
    }
}

main();
