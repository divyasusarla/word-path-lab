// Runs the browser checks in tests/index.html headlessly and exits non-zero if any fail.
// Used by GitHub Actions (.github/workflows/site.yml). Locally: serve the site on port 8765, then
//   npm install --no-save playwright && node tests/run-checks.mjs
// BROWSER=webkit runs them in Safari's engine instead of Chrome.
import { chromium, webkit } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:8765';
const browser = process.env.BROWSER === 'webkit'
  ? await webkit.launch()
  : await chromium.launch({ channel: process.env.CHROME_CHANNEL || undefined });
console.log(`Running in ${process.env.BROWSER === 'webkit' ? 'WebKit (Safari engine)' : 'Chrome'}`);
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));

await page.goto(`${base}/tests/?run`);
await page.waitForFunction(() => window.testResult, null, { timeout: 10 * 60 * 1000 });
const rows = await page.$$eval('#results li', lis => lis.map(li => ({
  ok: li.classList.contains('pass'),
  name: li.childNodes[1]?.textContent || '',
  detail: li.querySelector('.detail')?.textContent || ''
})));
const { passed, failed } = await page.evaluate(() => window.testResult);
await browser.close();

for (const r of rows) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${!r.ok && r.detail ? `\n    ${r.detail.replace(/\n/g, '\n    ')}` : ''}`);
if (pageErrors.length) console.log(`\nPage errors:\n  ${pageErrors.join('\n  ')}`);
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed || pageErrors.length ? 1 : 0);
