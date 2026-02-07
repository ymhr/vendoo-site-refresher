import { type Browser, type BrowserContext, type Page } from "playwright";
import type { BaseSite } from "./BaseSite";
import { ensureEnvString } from "./utils";


export class Vendoo implements BaseSite {
    url = ensureEnvString('VENDOO_URL');
    username = ensureEnvString('VENDOO_USERNAME');
    password = ensureEnvString('VENDOO_PASSWORD');
    browser: Browser;
    page!: Page;
    context!: BrowserContext

    constructor(browser: Browser) {
        this.browser = browser;
    }

    async openSite(): Promise<void> {
        const context = await this.browser.newContext();
        const page = await context.newPage();
        await page.goto(this.url);
        console.log(`Opened ${this.url} in a new window`);
        this.page = page;
        this.context = context;
    }

    async logIn(): Promise<void> {
        await this.fillUsernameField();
        await this.fillPasswordField()
    }
    async isLoggedIn(): Promise<boolean> {
        const loginButtonLocator = this.page.getByRole('button').getByText('Login');
        const isLoginButtonVisible = await loginButtonLocator.isVisible();

        const emailTextLocator = this.page.getByLabel('Email').and(this.page.locator('input'));
        const emailTextCount = await emailTextLocator.count();

        const passwordTextLocator = this.page.getByLabel('Password').and(this.page.locator('input'));
        const passwordTextCount = await passwordTextLocator.count();

        console.log({ isLoginButtonVisible, emailTextCount, passwordTextCount })

        if (isLoginButtonVisible && emailTextCount > 0 && passwordTextCount > 0) {
            return false;
        }

        return true;
    }
    async refresh(): Promise<void> {
        await this.page.reload()
    }

    todo: refactor so that these selectors are not duplicated.
    todo: why is the password truncated?
    async fillUsernameField() {
        const emailTextLocator = this.page.getByLabel('Email').and(this.page.locator('input'));
        await emailTextLocator.fill(this.username)
    }

    async fillPasswordField() {
        const passwordFieldLocator = this.page.getByLabel('Password').and(this.page.locator('input'));
        await passwordFieldLocator.fill(this.password);
        console.log(this.password)
    }
}