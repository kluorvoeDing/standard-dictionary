import { defineConfig } from '@playwright/test';
import path from 'node:path';

// 每個工作目錄用不同的埠，避免多個工作目錄同時驗收時互相干擾。
const root = path.resolve(import.meta.dirname, '..');
let h = 0;
for (const ch of root) h = (h * 31 + ch.charCodeAt(0)) % 500;
const port = Number(process.env.SD_PORT) || 4200 + h;

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.mjs',
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${port}`, viewport: { width: 1440, height: 900 } },
  webServer: {
    command: `cd frontend && npm run build && npx vite preview --port ${port} --strictPort`,
    cwd: root,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
