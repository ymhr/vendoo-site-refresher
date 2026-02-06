import { chromium, type Browser, type Page } from "playwright";
import type { BaseSite } from "./BaseSite";
import { ensureEnvString } from "./utils";


export class Vendoo implements BaseSite {
    url = ensureEnvString('VENDOO_URL');
    username = ensureEnvString('VENDOO_USERNAME');
    password = ensureEnvString('VENDOO_PASSWORD');
    browser: Browser;
    page: Page;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    async openSite(): Promise<void> {
        const browser = await chromium.launch({
            headless: false,
            // Add some arguments to make them distinct or just launch normally
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
          const context = await browser.newContext();
          const page = await context.newPage();
          await page.goto(this.url);
          console.log(`Opened ${this.url} in a new window`);
          this.page = page;
    }

    logIn(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    checkStatus(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    refresh(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}