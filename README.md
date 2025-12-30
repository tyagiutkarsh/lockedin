# Locked In Extension

This document outlines a common issue encountered during development and its resolution.

## Problem: Extension failed to load with "Could not load icon" and "Could not load manifest" errors.

When attempting to load the unpacked extension into Chrome, the following errors were displayed:

- `Could not load icon 'icons/icon16.png' specified in 'icons'.`
- `Could not load manifest.`

**Root Cause:**
Upon investigation, it was found that the icon files (`icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`) were empty. Chrome's extension loader failed when encountering these empty files, leading to the icon loading error, which subsequently caused the manifest loading to fail.

**Resolution:**
The empty icon files were replaced with placeholder content. Although these placeholders are not valid image files, their non-empty status allowed the Chrome extension loader to proceed without the "Could not load icon" error, thus resolving the "Could not load manifest" error as well.

**Note:** For a production environment, these placeholder files should be replaced with actual, correctly formatted PNG images.