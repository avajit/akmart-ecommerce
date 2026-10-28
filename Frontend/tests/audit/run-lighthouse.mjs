import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve(process.cwd(), '../design-audit/lighthouse');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const pagesToAudit = [
  { name: 'home', path: '/' },
  { name: 'collection', path: '/collection' },
  { name: 'product', path: '/product/apple-macbook-pro-16-m3-max' },
  { name: 'cart', path: '/cart' },
  { name: 'checkout', path: '/checkout' },
];

console.log('--- Starting Lighthouse Mobile Baseline Audit ---');
const results = {};

for (const p of pagesToAudit) {
  const url = `http://localhost:5173${p.path}`;
  const outPath = path.join(OUT_DIR, `${p.name}.json`);
  console.log(`Auditing ${p.name} at ${url}...`);

  try {
    const cmd = `npx lighthouse ${url} --chrome-flags="--headless --no-sandbox" --output=json --output-path="${outPath}" --only-categories=performance,accessibility,best-practices,seo --throttling-method=simulate --form-factor=mobile --screenEmulation.mobile=true --screenEmulation.width=360 --screenEmulation.height=640 --screenEmulation.deviceScaleFactor=2 --quiet`;
    execSync(cmd, { stdio: 'inherit', timeout: 60000 });

    if (fs.existsSync(outPath)) {
      const data = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
      results[p.name] = {
        performance: Math.round((data.categories.performance?.score || 0) * 100),
        accessibility: Math.round((data.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((data.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((data.categories.seo?.score || 0) * 100),
        lcp: data.audits['largest-contentful-paint']?.displayValue || 'N/A',
        cls: data.audits['cumulative-layout-shift']?.displayValue || 'N/A',
        tbt: data.audits['total-blocking-time']?.displayValue || 'N/A',
      };
      console.log(`✓ ${p.name}: Perf ${results[p.name].performance}, A11y ${results[p.name].accessibility}, BestPractices ${results[p.name].bestPractices}, SEO ${results[p.name].seo}`);
    }
  } catch (err) {
    console.warn(`Lighthouse run warning for ${p.name}:`, err.message);
    results[p.name] = { error: err.message, status: 'UNVERIFIED_SCORED_0' };
  }
}

fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(results, null, 2));
console.log('Lighthouse summary written to', path.join(OUT_DIR, 'summary.json'));
