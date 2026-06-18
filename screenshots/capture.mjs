import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// 1. Home / APS Calculator (default)
await page.screenshot({ path: join(OUT, '1_aps_calculator.png'), fullPage: false });
console.log('✅ APS Calculator screenshot saved');

// 2. Mentorship tab
await page.click('button:has-text("Mentorship")');
await page.waitForTimeout(800);
await page.screenshot({ path: join(OUT, '2_mentorship.png'), fullPage: false });
console.log('✅ Mentorship screenshot saved');

// 3. Career Guidance tab
await page.click('button:has-text("Career Guidance")');
await page.waitForTimeout(800);
await page.screenshot({ path: join(OUT, '3_careers.png'), fullPage: false });
console.log('✅ Career Guidance screenshot saved');

// 4. School Analytics tab
await page.click('button:has-text("School Analytics")');
await page.waitForTimeout(800);
await page.screenshot({ path: join(OUT, '4_schools.png'), fullPage: false });
console.log('✅ School Analytics screenshot saved');

// 5. Impact tab
await page.click('button:has-text("Impact")');
await page.waitForTimeout(2800);
await page.screenshot({ path: join(OUT, '5_impact_hub.png'), fullPage: false });
console.log('✅ Impact screenshot saved');

// 6. Scroll down on Impact to see more
await page.evaluate(() => window.scrollBy(0, 700));
await page.waitForTimeout(500);
await page.screenshot({ path: join(OUT, '6_impact_hub_scroll.png'), fullPage: false });
console.log('✅ Impact (scrolled) screenshot saved');

// 7. Open the Mpumi chatbot
await page.click('button:has-text("Ask Mpumi")');
await page.waitForTimeout(600);
await page.screenshot({ path: join(OUT, '7_chatbot.png'), fullPage: false });
console.log('✅ Chatbot screenshot saved');

await browser.close();
console.log('\n🎉 All screenshots captured!');
