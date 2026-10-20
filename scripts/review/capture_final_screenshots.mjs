import { spawn } from 'child_process';
import { chromium } from '/Users/Openclaw/.claude/skills/gstack/node_modules/playwright/index.mjs';
import path from 'path';

const outDir = '/Users/Openclaw/.gemini/antigravity/brain/34cdcd69-ba22-477d-a2bd-5f708b841684';

async function main() {
  const srv = spawn('npm', ['--prefix', 'frontend', 'run', 'preview', '--', '--port', '4175', '--host', '127.0.0.1'], {
    stdio: 'pipe',
  });

  await new Promise((resolve) => {
    srv.stdout.on('data', (d) => {
      if (String(d).includes('4175')) resolve();
    });
    setTimeout(resolve, 2500);
  });

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    const page = await context.newPage();

    // 1. IEC62133-2 vs IEC62619
    console.log('Capturing IEC62133-2 vs IEC62619...');
    await page.goto('http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
    await page.locator('.sm-row', { hasText: 'IEC62133-2' }).first().click();
    await page.locator('.sm-row', { hasText: 'IEC62619' }).first().click();
    await page.locator('button', { hasText: '確認比對' }).click();
    await page.waitForSelector('.cmp-group');
    await page.waitForTimeout(300);

    const scIntGroup = page.locator('.cmp-group').filter({ hasText: 'ELEC-SC-INT' }).first();
    await scIntGroup.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await scIntGroup.screenshot({ path: path.join(outDir, 'D3_IEC62133_IEC62619_SC_INT.png') });

    const dropGroup = page.locator('.cmp-group').filter({ hasText: 'MECH-DROP' }).first();
    await dropGroup.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await dropGroup.screenshot({ path: path.join(outDir, 'D3_IEC62133_IEC62619_DROP.png') });

    // 2. GB31241 vs IEC62133-2
    console.log('Capturing GB31241 vs IEC62133-2...');
    await page.goto('http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
    await page.locator('.sm-row', { hasText: 'GB31241' }).first().click();
    await page.locator('.sm-row', { hasText: 'IEC62133-2' }).first().click();
    await page.locator('button', { hasText: '確認比對' }).click();
    await page.waitForSelector('.cmp-group');
    await page.waitForTimeout(300);

    const gbIecCrush = page.locator('.cmp-group').filter({ hasText: 'MECH-CRUSH' }).first();
    await gbIecCrush.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await gbIecCrush.screenshot({ path: path.join(outDir, 'D3_GB31241_IEC62133_CRUSH.png') });

    const gbIecAbuse = page.locator('.cmp-group').filter({ hasText: 'THERM-ABUSE' }).first();
    await gbIecAbuse.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await gbIecAbuse.screenshot({ path: path.join(outDir, 'D3_GB31241_IEC62133_THERM_ABUSE.png') });

    // 3. UL1642 vs UN38.3
    console.log('Capturing UL1642 vs UN38.3...');
    await page.goto('http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
    await page.locator('.sm-row', { hasText: 'UL1642' }).first().click();
    await page.locator('.sm-row', { hasText: 'UN38.3' }).first().click();
    await page.locator('button', { hasText: '確認比對' }).click();
    await page.waitForSelector('.cmp-group');
    await page.waitForTimeout(300);

    const ulUnCycle = page.locator('.cmp-group').filter({ hasText: 'THERM-CYCLE' }).first();
    await ulUnCycle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await ulUnCycle.screenshot({ path: path.join(outDir, 'D3_UL1642_UN38_3_CYCLE.png') });

    const ulUnShock = page.locator('.cmp-group').filter({ hasText: 'MECH-SHOCK' }).first();
    await ulUnShock.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await ulUnShock.screenshot({ path: path.join(outDir, 'D3_UL1642_UN38_3_SHOCK.png') });

    // 4. GB38031 vs IEC62660-3
    console.log('Capturing GB38031 vs IEC62660-3...');
    await page.goto('http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
    await page.locator('.sm-row', { hasText: 'GB38031' }).first().click();
    await page.locator('.sm-row', { hasText: 'IEC62660-3' }).first().click();
    await page.locator('button', { hasText: '確認比對' }).click();
    await page.waitForSelector('.cmp-group');
    await page.waitForTimeout(300);

    const gbIec6Crush = page.locator('.cmp-group').filter({ hasText: 'MECH-CRUSH' }).first();
    await gbIec6Crush.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await gbIec6Crush.screenshot({ path: path.join(outDir, 'D3_GB38031_IEC62660_3_CRUSH.png') });

    await context.close();
    console.log('All D3 screenshots captured successfully!');
  } finally {
    await browser.close();
    srv.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
