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
    const status = await vendoo.isLoggedIn();
    console.log({status})

    if(!status) {
      await vendoo.logIn();
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
      console.log(`${new Date().toISOString()} - Refreshing...`);
      // await vendoo.refresh();
      // console.log('...refreshed!')
      // const status = await vendoo.checkStatus();
      // console.log(`status: ${status}`)
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
