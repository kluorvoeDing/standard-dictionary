const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const catalogPath = path.join(__dirname, '../../data/catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Filter for standards that are not the latest version
const targetStandards = catalog.filter(obj => obj.is_latest === false);

if (targetStandards.length === 0) {
    console.log("No outdated standards found. Crawler exiting.");
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

async function searchDDG(query) {
    const encodedQuery = encodeURIComponent(query);
    // Use HTML duckduckgo to bypass JS requirement and some bot checks
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
    
    try {
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
        const response = await fetch(url, {
            headers: {
                'User-Agent': randomUA,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });
        
        if (!response.ok) {
            console.error(`Failed to fetch from DuckDuckGo for query: ${query}. Status: ${response.status}`);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        
        const results = [];
        $('.result__url').each((i, el) => {
            if (i >= 5) return; // Only top 5
            const link = $(el).attr('href');
            // DuckDuckGo obfuscates links through its redirector. We need to extract the target.
            // Example: //duckduckgo.com/l/?uddg=https://...
            if (link && link.includes('uddg=')) {
                const params = new URLSearchParams(link.split('?')[1]);
                const targetUrl = params.get('uddg');
                if (targetUrl) {
                    results.push(decodeURIComponent(targetUrl));
                }
            }
        });
        
        return results;
    } catch (e) {
        console.error(`Error crawling DDG for ${query}:`, e);
        return [];
    }
}

async function main() {
    let issueContent = "自動爬蟲找到了以下過期標準的潛在最新版本 PDF 下載連結：\n\n";
    let foundAnything = false;

    for (const std of targetStandards) {
        console.log(`Searching for: ${std.document_id}...`);
        const query = `"${std.document_id}" battery standard filetype:pdf`;
        
        const links = await searchDDG(query);
        
        if (links.length > 0) {
            foundAnything = true;
            issueContent += `### ${std.document_id} (${std.display_name})\n`;
            links.forEach((link, idx) => {
                issueContent += `${idx + 1}. [${link}](${link})\n`;
            });
            issueContent += "\n";
        } else {
            console.log(`No results found for ${std.document_id}.`);
        }
        
        // Delay to avoid aggressive rate limiting
        await delay(3000);
    }

    if (foundAnything) {
        // Output the result to a file so GitHub Actions can read it and create an issue
        const outputPath = path.join(__dirname, 'crawler_results.md');
        fs.writeFileSync(outputPath, issueContent, 'utf8');
        console.log("Crawler finished. Results saved to crawler_results.md");
    } else {
        console.log("Crawler finished. No useful links found.");
    }
}

main();
