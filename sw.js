const CACHE_NAME = 'arachne-kurdistan-v13';
const ASSETS = [
  './',
  './index.html',
  './app.css',
  './duhok.js',
  './hawler.js',
  './slemani.js',
  './kirkok.js',
  './halabja.js',
  './zaxo.js',
  './amedi.js',
  './akre.js',
  './sounds.js',
  './athan1.mp3',
  './athan2.mp3',
  './athan3.mp3',
  './athan4.mp3',
  './athan5.mp3',
  './app.js',
  './manifest.json',
  'https://i.postimg.cc/zBkHTJ6T/E39555D3-D276-4DA9-B6F6-19FDB5FF7AD8.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cinzel:wght@400;600&family=Cormorant+Upright:ital,wght@1,700&family=JetBrains+Mono:wght@400;600;700&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Could not cache asset:', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// فەنکشنی تایبەت بۆ وەڵامدانەوەی فایلی دەنگی (.mp3) لەسەر iOS Safari و Android
async function handleAudioFetch(request) {
  const cache = await caches.open(CACHE_NAME);
  let cachedResponse = await cache.match(request.url, { ignoreSearch: true, ignoreVary: true });

  if (!cachedResponse) {
    try {
      const netRes = await fetch(request.url);
      if (netRes && netRes.status === 200) {
        cache.put(request.url, netRes.clone());
        cachedResponse = netRes;
      } else {
        return netRes;
      }
    } catch (e) {
      return new Response('', { status: 404, statusText: 'Audio Not Found' });
    }
  }

  const rangeHeader = request.headers.get('range');
  if (rangeHeader && cachedResponse) {
    const arrayBuffer = await cachedResponse.arrayBuffer();
    const bytes = /^bytes\=(\d+)\-(\d+)?$/i.exec(rangeHeader);
    if (bytes) {
      const start = Number(bytes[1]);
      const end = bytes[2] ? Number(bytes[2]) : arrayBuffer.byteLength - 1;
      const slicedBuffer = arrayBuffer.slice(start, end + 1);
      return new Response(slicedBuffer, {
        status: 206,
        statusText: 'Partial Content',
        headers: [
          ['Content-Type', 'audio/mpeg'],
          ['Content-Range', `bytes ${start}-${end}/${arrayBuffer.byteLength}`],
          ['Content-Length', String(slicedBuffer.byteLength)]
        ]
      });
    }
  }

  return cachedResponse;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ١. مامەڵەکردنی تایبەت لەگەڵ فایلە دەنگییەکان (.mp3) بۆ ئایفۆن و ئەندرۆید
  if (url.pathname.endsWith('.mp3')) {
    event.respondWith(handleAudioFetch(event.request));
    return;
  }

  // ٢. کاشکردنی فۆنت، ئایکۆن و GSAP (Cache-First)
  if (
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com' ||
    url.origin === 'https://i.postimg.cc' ||
    url.origin === 'https://cdnjs.cloudflare.com'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // ٣. پەڕگە ناوخۆییەکانی بەرنامەکە (Network-First with Offline Fallback)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached || caches.match('./index.html');
      })
  );
});
