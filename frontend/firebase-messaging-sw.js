importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDNPgb33xb2q1mBvxvEiRTADDzG9AAoFyU",
  authDomain: "church-4feb9.firebaseapp.com",
  projectId: "church-4feb9",
  storageBucket: "church-4feb9.firebasestorage.app",
  messagingSenderId: "731603531979",
  appId: "1:731603531979:web:962ace3624cb2a7e8b034e"
});

firebase.messaging();

// ---------- App caching (makes the app installable and faster) ----------
const CACHE_NAME = 'ihil-church-v1';

const CORE_FILES = [
  'login.html', 'index.html', 'home.html', 'sermons.html', 'devotion.html',
  'bible.html', 'prayer.html', 'live.html', 'attendance.html',
  'payment.html', 'pending.html',
  'style.css', 'manifest.json', 'icon-192.png', 'icon-512.png', 'logo.jpeg',
  'firebase-config.js', 'notifications.js', 'bible-offline.js',
  'bible.js', 'home.js', 'sermons.js', 'devotion.js', 'prayer.js',
  'live.js', 'attendance.js', 'login.js', 'script.js', 'payment.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(CORE_FILES.map((file) => cache.add(file).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first: you always get the newest files when online,
// and the saved copy is used only when there is no internet.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const firebaseSdk = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (!sameOrigin && !firebaseSdk) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});