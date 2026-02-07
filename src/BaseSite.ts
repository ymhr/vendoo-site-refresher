import type { Browser } from "playwright";

export interface BaseSite {
    url: string;
    username?: string;
    password?: string;
    browser: Browser;

    openSite(): Promise<void>;

    logIn(): Promise<void>

    isLoggedIn(): Promise<boolean>;

    refresh(): Promise<void>;
}