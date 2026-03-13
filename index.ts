import { chromium } from 'playwright';
import { Vendoo } from './src/Vendoo';
import { Vinted } from './src/Vinted';
import type { BaseSite } from './src/BaseSite';

async function main() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const siteType = (process.env.SITE_TYPE || 'vendoo').toLowerCase();
  let site: BaseSite;

  if (siteType === 'vinted') {
    site = new Vinted(browser);
  } else {
    site = new Vendoo(browser);
  }

  try {
    await site.openSite();
    const loggedIn = await site.isLoggedIn();
    console.log({ loggedIn });

    if (!loggedIn) {
      const isOnLogInPage = await site.isOnLogInPage();
      console.log({ isOnLogInPage })

      if (isOnLogInPage) {
        await site.logIn();
      }
    }
  } catch (error) {
    console.error(`Failed to open site ${siteType}:`, error);
    await browser.close();
    process.exit(1);
  }

  const intervalMs = parseInt(process.env.REFRESH_INTERVAL_MS || '5000', 10);
  console.log(`Automation running for ${siteType}. Refreshing every ${intervalMs}ms. Press Ctrl+C to stop.`);

  let isRunning = true;
  let timeoutId: Timer | null = null;

  async function runLoop() {
    if (!isRunning) return;

    try {
      const loggedIn = await site.isLoggedIn();
      if (loggedIn) {
        console.log(`${new Date().toISOString()} - [${siteType}] Refreshing...`);
        await site.refresh();
        console.log('...refreshed!')
      } else {
        console.log(`[${siteType}] Not logged in, skipping refresh.`);
      }
    } catch (error) {
      console.error(`Error during refresh for ${siteType}:`, error);
    } finally {
      if (isRunning) {
        timeoutId = setTimeout(runLoop, intervalMs);
      }
    }
  }

  runLoop();

  const cleanup = async () => {
    console.log('\nStopping automation...');
    isRunning = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    await browser.close();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Keep the script running
  await new Promise(() => { });
}

await main();
