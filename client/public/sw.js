// Service Worker for EatZone - Aggressive Image Caching Strategy
const CACHE_NAME = 'eatzone-v2';
const STATIC_CACHE = 'eatzone-static-v2';
const DYNAMIC_CACHE = 'eatzone-dynamic-v2';
const IMAGE_CACHE = 'eatzone-images-v2';

// Critical images to cache immediately for instant loading
const CRITICAL_IMAGES = [
  'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_400,h_300,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/default-food.jpg',
  'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/pizza.jpg',
  'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/burgers.jpg',
  'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/desserts.jpg',
  'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/noodles.jpg',
  'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/salads.jpg'
];

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache static assets and critical images immediately
self.addEventListener('install', (event) => {
  console.log('🔧 EatZone Service Worker: Installing with aggressive image caching...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE)
        .then((cache) => {
          console.log('📦 Service Worker: Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),
      // Aggressively cache critical images for instant loading
      caches.open(IMAGE_CACHE)
        .then((cache) => {
          console.log('🚀 Service Worker: Aggressively caching critical images for instant loading...');
          return cache.addAll(CRITICAL_IMAGES);
        })
    ])
    .then(() => {
      console.log('✅ Service Worker: All critical assets cached successfully');
    })
    .catch((error) => {
      console.error('❌ Service Worker: Failed to cache critical assets', error);
    })
  );

  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (request.destination === 'image') {
    // Images: Cache first, then network
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    // API calls: Network first, then cache
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.includes('cloudinary.com')) {
    // Cloudinary images: Cache first
    event.respondWith(handleCloudinaryRequest(request));
  } else {
    // Static assets: Cache first, then network
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle image requests with aggressive caching
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log('🚀 Service Worker: Serving image from cache (instant load)', request.url);
      return cachedResponse;
    }

    console.log('📥 Service Worker: Fetching and caching new image', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone response before caching
      const responseClone = networkResponse.clone();

      // Cache immediately for future requests
      cache.put(request, responseClone);
      console.log('💾 Service Worker: Image cached for instant future access', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Image request failed', error);

    // Try to return a fallback image from critical images
    const cache = await caches.open(IMAGE_CACHE);
    const fallback = await cache.match(CRITICAL_IMAGES[0]);
    if (fallback) {
      console.log('🔄 Service Worker: Serving fallback image');
      return fallback;
    }

    return new Response('', { status: 404 });
  }
}

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses for GET requests
      if (request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    
    // If network fails, try cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving API response from cache', request.url);
      return cachedResponse;
    }
    
    // If no cache, return error
    throw error;
  }
}

// Handle Cloudinary requests
async function handleCloudinaryRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving Cloudinary image from cache', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      console.log('Service Worker: Caching Cloudinary image', request.url);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cloudinary request failed', error);
    throw error;
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving static asset from cache', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      console.log('Service Worker: Caching static asset', request.url);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static request failed', error);
    
    // For navigation requests, return cached index.html
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match('/');
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when back online
  console.log('Service Worker: Performing background sync');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Service Worker: Push notification received', data);
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      data: data.data
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
