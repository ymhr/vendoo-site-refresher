import { type Browser, type BrowserContext, type Page } from "playwright";
import type { BaseSite } from "./BaseSite";
import { ensureEnvString } from "./utils";
import fs from "fs";
import path from "path";


export class Vendoo implements BaseSite {
    url = ensureEnvString('VENDOO_URL');
    username = ensureEnvString('VENDOO_USERNAME');
    password = ensureEnvString('VENDOO_PASSWORD');
    browser: Browser;
    page!: Page;
    context!: BrowserContext
    sessionPath = path.join(process.cwd(), 'session-vendoo.json');

    private get emailInput() {
        return this.ensurePage().getByLabel('Email').and(this.page.locator('input'));
    }

    private get passwordInput() {
        return this.ensurePage().getByLabel('Password').and(this.page.locator('input'));
    }

    private get loginButton() {
        return this.ensurePage().getByRole('button').getByText('Login');
    }

    private get inventoryHeading() {
        return this.ensurePage().getByRole('heading', { name: 'Inventory', exact: true });
    }

    private get newItemLink() {
        return this.ensurePage().getByRole('link', { name: 'New Item', exact: true });
    }

    constructor(browser: Browser) {
        this.browser = browser;
    }

    private ensurePage() {
        if (!this.page) {
            throw new Error('Page not initialized. Call openSite() first.');
        }
        return this.page;
    }

    async openSite(): Promise<void> {
        const contextOptions = fs.existsSync(this.sessionPath)
            ? { storageState: this.sessionPath }
            : {};
        const context = await this.browser.newContext(contextOptions);
        const page = await context.newPage();
        await page.goto(this.url);
        console.log(`Opened ${this.url} in a new window`);
        this.page = page;
        this.context = context;
    }

    async logIn(): Promise<void> {
        this.ensurePage();
        await this.fillUsernameField();
        await this.fillPasswordField();
        await this.loginButton.click();

        // Wait for login to complete and save session
        await this.inventoryHeading.waitFor({ state: 'visible' });
        await this.context.storageState({ path: this.sessionPath });
        console.log(`Saved session to ${this.sessionPath}`);
    }

    async isOnLogInPage(): Promise<boolean> {
        this.ensurePage();
        const isLoginButtonVisible = await this.loginButton.isVisible();

        const emailTextCount = await this.emailInput.count();

        const passwordTextCount = await this.passwordInput.count();

        if (isLoginButtonVisible && emailTextCount > 0 && passwordTextCount > 0) {
            return true;
        }

        return false;
    }

    async isLoggedIn(): Promise<boolean> {
        this.ensurePage();
        const isInventoryHeadingVisible = await this.inventoryHeading.isVisible();
        const isNewItemLinkVisible = await this.newItemLink.isVisible();

        return isInventoryHeadingVisible || isNewItemLinkVisible;
    }

    async refresh(): Promise<void> {
        await this.ensurePage().reload()
    }

    async fillUsernameField() {
        await this.emailInput.fill(this.username)
    }

    async fillPasswordField() {
        await this.passwordInput.fill(this.password);
    }
}