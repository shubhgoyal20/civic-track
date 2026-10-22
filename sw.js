const CACHE_NAME = "civic-track-v3";
// Relative paths so it works at / and at /repo-name/ (GitHub Pages).
const SHELL = [
  "./", "index.html", "manifest.json", "config.js",
  "src/styles.css", "src/app.js", "src/map.js", "src/charts.js", "src/sync.js", "src/ui.js", "src/verify.js",
  "icons/icon-192.png", "icons/icon-512.png"
];
const CDN_HOSTS = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(SHELL.map((url) => cache.add(url)))   // one missing file must not break install
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !CDN_HOSTS.includes(url.hostname)) return;   // map tiles etc: browser handles
  if (sameOrigin && url.pathname.includes("/api/")) return;        // never cache API calls

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const shell = await caches.match("index.html");
          if (shell) return shell;
        }
        return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      })
  );
});
