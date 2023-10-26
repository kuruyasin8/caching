/* eslint-disable no-restricted-globals */

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, PrecacheController } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

clientsClaim();
cleanupOutdatedCaches();

const assets = self.__WB_MANIFEST;
const cacheName = `caching-pwa-${process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA}`;

const preCacheController = new PrecacheController({ cacheName });
preCacheController.addToCacheList(assets);

self.addEventListener("install", (event) => {
  preCacheController.install(event);
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") {
      return false;
    } // If this is a URL that starts with /_, skip.

    if (url.pathname.startsWith("/_")) {
      return false;
    } // If this looks like a URL for a resource, because it contains // a file extension, skip.

    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    } // Return true to signal that we want to use the handler.

    return true;
  },
  preCacheController.createHandlerBoundToURL(
    process.env.PUBLIC_URL + "/index.html"
  )
);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName,
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 7,
        maxEntries: 50,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === "script",
  new CacheFirst({
    cacheName,
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 7,
        maxEntries: 50,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === "style",
  new CacheFirst({
    cacheName,
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 7,
        maxEntries: 50,
      }),
    ],
  })
);

registerRoute(
  ({ url }) =>
    url.origin == self.location.origin && url.pathname.endsWith(".map"),
  new CacheFirst({
    cacheName,
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 7,
        maxEntries: 50,
      }),
    ],
  })
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Any other custom service worker logic can go here.
