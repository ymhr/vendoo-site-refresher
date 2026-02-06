# Vendoo Site Refresher

This project uses Playwright to automate opening multiple browser windows.

## Prerequisites

- [Bun](https://bun.sh/) installed.

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

## Usage

To launch 3 Chrome (Chromium) windows browsing to different websites:

```bash
bun start
```

This will open 3 separate browser windows and navigate to Google, Bing, and DuckDuckGo. The script will keep the windows open until you terminate it (Ctrl+C).