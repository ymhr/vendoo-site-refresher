import { chromium } from 'playwright';
import { Vendoo } from './src/Vendoo';

async function main() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const vendoo = new Vendoo(browser);
  
  try {
    await vendoo.openSite();
    const loggedIn = await vendoo.isLoggedIn();
    console.log({ loggedIn });

    if (!loggedIn) {
      const isOnLogInPage = await vendoo.isOnLogInPage();
      console.log({ isOnLogInPage })

      if (isOnLogInPage) {
        await vendoo.logIn();
      }
    }
  } catch (error) {
    console.error('Failed to open site:', error);
    await browser.close();
    process.exit(1);
  }

  const intervalMs = parseInt(process.env.REFRESH_INTERVAL_MS || '5000', 10);
  console.log(`Automation running. Refreshing every ${intervalMs}ms. Press Ctrl+C to stop.`);

  const interval = setInterval(async () => {
    try {
      const loggedIn = await vendoo.isLoggedIn();
      if (loggedIn) {
        console.log(`${new Date().toISOString()} - Refreshing...`);
        await vendoo.refresh();
        console.log('...refreshed!')
      } else {
        console.log('Not logged in, skipping refresh.');
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    }
  }, intervalMs);

  const cleanup = async () => {
    console.log('\nStopping automation...');
    clearInterval(interval);
    await browser.close();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Keep the script running
  await new Promise(() => {}); 
}

await main();
