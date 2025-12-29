# locked in

"locked in" is a Chrome extension designed for mindful browsing. Instead of simply blocking websites, it requires you to state your intention before accessing a site you've marked for monitoring. This promotes active, focused usage rather than passive consumption.

The extension was built with a utilitarian, developer-focused design philosophy: minimal, fast, and functional, with no unnecessary animations or visual clutter.

## Features

- **Intention-Based Access:** Blocks designated websites until you provide a reason for access.
- **Session Timer:** Once access is granted, a non-intrusive timer appears. When the timer expires, the site is re-locked.
- **Local Data Storage:** All usage data (reasons, time spent) is stored locally on your machine. Nothing is ever sent over the network.
- **Usage Insights:** A clean dashboard visualizes your usage patterns with a stacked bar chart showing time spent per site over the last 7 days.
- **Session Log:** A simple table logs every session's website, your stated reason, and the date.
- **Configurable Settings:** Easily add or remove websites from the blocklist and configure the session timer duration (1-60 minutes).

## How to Install

1.  **Download/Locate the code:** Ensure the `locked-in` project folder is on your local machine.
2.  **Open Chrome Extensions:** Navigate to `chrome://extensions` in your Chrome browser.
3.  **Enable Developer Mode:** In the top-right corner, turn on "Developer mode".
4.  **Load the Extension:**
    *   Click the **"Load unpacked"** button.
    *   In the file dialog, navigate to and select the `locked-in` project folder.

The extension will now be installed and active.

## How to Use

1.  **Set Your Rules:**
    *   Click the "locked in" icon in your Chrome toolbar.
    *   Go to the **Settings** tab.
    *   The default blocked sites are `youtube.com`, `x.com`, and `linkedin.com`. You can remove these or add your own (e.g., `netflix.com`).
    *   Set your desired "Session Duration" in minutes. This is how long you get per session.

2.  **Browse:**
    *   When you navigate to a blocked site, you will be stopped by the "locked in" screen.
    *   State your intention in the text box and click "Proceed".
    *   You will be redirected to your intended page, and a timer will appear in the top-right corner.

3.  **Review Your Habits:**
    *   Click the extension icon to open the popup.
    *   The **Insights** tab will show your usage chart and a table of your past session intentions, helping you reflect on your browsing habits.
