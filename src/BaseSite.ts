import type { Browser } from "playwright";

export interface BaseSite {
    url: string;
    username: string;
    password: string;
    browser: Browser;

    openSite(): Promise<void>;

    logIn(): Promise<void>

    checkStatus(): Promise<void>;

    refresh(): Promise<void>;
}