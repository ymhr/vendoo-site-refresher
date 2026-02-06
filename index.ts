import { chromium } from 'playwright';
import { Vendoo } from './src/Vendoo';

async function launchWindow(url: string) {
  const browser = await chromium.launch({
    headless: false,
    // Add some arguments to make them distinct or just launch normally
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);
  console.log(`Opened ${url} in a new window`);
  return { browser, page };
}

async function main() {
  const browser = await chromium.launch({
    headless: false,
    // Add some arguments to make them distinct or just launch normally
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const vendoo = new Vendoo(browser);
  await vendoo.openSite();

  console.log('Automation running. Press Ctrl+C to stop.');
  
  // Keep the script running so the windows don't close immediately
  // In a real automation you might have a loop or specific logic here
  await new Promise(() => {}); 
}

await main();
