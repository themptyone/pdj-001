// Basic Service Worker for Finance Tracker
const CACHE_NAME = 'finance-tracker-v1';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/ui.js',
  '/js/settings.js',
  '/js/api.js',
  '/pages/dashboard.html',
  '/pages/income.html',
  '/pages/fixed-expenses.html',
  '/pages/goals.html',
  '/pages/hidden.html',
  '/pages/insights.html',
  '/pages/settings.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
