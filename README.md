# Vendoo Site Refresher

This project uses Playwright to automate refreshing a website at a regular interval.

## Prerequisites

- [Bun](https://bun.sh/) installed.

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Install Playwright browsers:
   ```bash
   bunx playwright install chromium
   ```

3. Create a `.env` file in the root directory:
   ```env
   VENDOO_URL='https://example.com'
   VENDOO_USERNAME='your_username'
   VENDOO_PASSWORD='your_password'
   REFRESH_INTERVAL_MS=5000
   ```

## Usage

To start the refresher:

```bash
bun start
```

The script will open a Chromium window, navigate to the specified URL, and refresh the page every 5 seconds (or whatever interval you specified). Press `Ctrl+C` to stop and close the browser gracefully.