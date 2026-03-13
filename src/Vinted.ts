import { type Browser, type BrowserContext, type Page } from "playwright";
import type { BaseSite } from "./BaseSite";
import { ensureEnvString } from "./utils";


export class Vinted implements BaseSite {
    url = ensureEnvString('VINTED_URL');
    username = ensureEnvString('VINTED_USERNAME');
    password = ensureEnvString('VINTED_PASSWORD');
    browser: Browser;
    page!: Page;
    context!: BrowserContext

    private get loginLink() {
        return this.ensurePage().getByRole('link', { name: 'Sign up | Log in' });
    }

    private get emailButton() {
        return this.ensurePage().getByRole('button', { name: 'email' });
    }

    private get usernameInput() {
        return this.ensurePage().getByPlaceholder('Username or email').or(this.ensurePage().getByLabel('Username or email'));
    }

    private get passwordInput() {
        return this.ensurePage().getByPlaceholder('Password').or(this.ensurePage().getByLabel('Password'));
    }

    private get continueButton() {
        return this.ensurePage().getByRole('button', { name: 'Continue' });
    }

    private get userProfileIcon() {
        // This is an assumption, usually Vinted has a profile icon when logged in
        return this.ensurePage().getByRole('button', { name: /profile|account/i });
    }

    private get sellNowLink() {
        return this.ensurePage().getByRole('link', { name: 'Sell now', exact: true });
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
        const context = await this.browser.newContext();
        const page = await context.newPage();
        await page.goto(this.url);
        console.log(`Opened ${this.url} in a new window`);
        this.page = page;
        this.context = context;

        // Handle cookie banner if present
        try {
            const acceptAll = page.getByRole('button', { name: 'Accept all' });
            if (await acceptAll.isVisible({ timeout: 5000 })) {
                await acceptAll.click();
            }
        } catch (e) {
            // Ignore if not found
        }

        // Handle "Where do you live?" dialog if present
        try {
            const usLink = page.getByRole('link', { name: 'United States' });
            if (await usLink.isVisible({ timeout: 2000 })) {
                await usLink.click();
            }
        } catch (e) {
            // Ignore if not found
        }
    }

    async logIn(): Promise<void> {
        this.ensurePage();
        
        // Navigation to login selection
        if (await this.loginLink.isVisible()) {
            await this.loginLink.click();
        }

        // Handle "Where do you live?" again if it pops up after clicking login
        try {
            const usLink = this.page.getByRole('link', { name: 'United States' });
            if (await usLink.isVisible({ timeout: 2000 })) {
                await usLink.click();
            }
        } catch (e) { }

        // Vinted often has a intermediate choice for "Log in" vs "Sign up"
        const loginButton = this.page.getByRole('button', { name: 'Log in', exact: true });
        if (await loginButton.isVisible()) {
            await loginButton.click();
        }

        if (await this.emailButton.isVisible()) {
            await this.emailButton.click();
        }

        await this.fillUsernameField();
        await this.fillPasswordField();
        await this.continueButton.click();
    }

    async isOnLogInPage(): Promise<boolean> {
        this.ensurePage();
        const isContinueVisible = await this.continueButton.isVisible();
        const isUsernameVisible = await this.usernameInput.isVisible();
        return isContinueVisible && isUsernameVisible;
    }

    async isLoggedIn(): Promise<boolean> {
        this.ensurePage();
        // Vinted shows "Sell now" or profile icon when logged in
        // On the landing page, "Sell now" might be visible even if not logged in, 
        // but typically the header changes.
        const isProfileVisible = await this.userProfileIcon.isVisible();
        const isLogoutVisible = await this.page.getByText(/log out/i).isVisible();

        return isProfileVisible || isLogoutVisible;
    }

    async refresh(): Promise<void> {
        await this.ensurePage().reload()
    }

    async fillUsernameField() {
        await this.usernameInput.fill(this.username)
    }

    async fillPasswordField() {
        await this.passwordInput.fill(this.password);
    }
}