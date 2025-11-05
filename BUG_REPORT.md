## Issue
The "Load commutes" button in the browser extension was loading infinitely and never displaying commute times.

## Root Cause
Content scripts in browser extensions run in an isolated environment and cannot make direct API calls to external servers due to **CORS (Cross-Origin Resource Sharing)** restrictions.
When the content script tried to fetch data from our API server directly, the browser blocked the request, causing the infinite loading state.

## Solution
Moved all API calls to the **background service worker**, which has the necessary permissions to make cross-origin requests.
Background service workers in Chrome extensions have elevated permissions and can make cross-origin requests. By moving the API logic there and using Chrome's message passing system, I maintain security while enabling the functionality.