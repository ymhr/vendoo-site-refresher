import { chromium } from 'playwright';

/**
 * Connects to an already running browser instance.
 * 
 * IMPORTANT: You must start your browser with the remote debugging flag:
 * --remote-debugging-port=9222
 */
async function main() {
  const endpointURL = 'http://localhost:9222';

  try {
    console.log(`Attempting to connect to browser at ${endpointURL}...`);
    
    // Connect to the existing browser instance via CDP
    const browser = await chromium.connectOverCDP(endpointURL);
    console.log('Successfully connected to the browser!');

    const contexts = browser.contexts();
    console.log(`Found ${contexts.length} browser context(s).`);

    for (const [contextIdx, context] of contexts.entries()) {
      const pages = context.pages();
      console.log(`Context ${contextIdx} has ${pages.length} tab(s):`);

      for (const [pageIdx, page] of pages.entries()) {
        try {
          const title = await page.title();
          const url = page.url();
          console.log(`  [Tab ${pageIdx}] Title: "${title}" | URL: ${url}`);
        } catch (e) {
          console.log(`  [Tab ${pageIdx}] (Could not read tab details)`);
        }
      }
    }

    console.log('\nDisconnecting script from browser...');
    await browser.close();

  } catch (error: any) {
    console.error('\n--- CONNECTION FAILED ---');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting steps for Linux:');
    console.error('1. The browser MUST be started with a fresh user-data-dir to enable the port.');
    console.error('2. Run this exact command:');
    console.error('   google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug');
    console.error('\n3. Keep that terminal/browser open and run this script in a new terminal.');
  }
}

main();
