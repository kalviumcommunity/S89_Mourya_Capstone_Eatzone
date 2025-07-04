/**
 * Service Worker registration and management
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

/**
 * Register service worker
 */
export function registerSW() {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        // This is running on localhost
        checkValidServiceWorker(swUrl);
        
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '🔧 This web app is being served cache-first by a service worker.'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl);
      }
    });
  }
}

/**
 * Register valid service worker
 */
function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('✅ Service Worker registered successfully:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                '🔄 New content is available and will be used when all tabs for this page are closed.'
              );
              
              // Show update available notification
              showUpdateAvailable();
            } else {
              console.log('✅ Content is cached for offline use.');
              
              // Show cached for offline notification
              showCachedForOffline();
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });
}

/**
 * Check if service worker is valid
 */
function checkValidServiceWorker(swUrl) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log('🔌 No internet connection found. App is running in offline mode.');
    });
}

/**
 * Unregister service worker
 */
export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('🗑️ Service Worker unregistered');
      })
      .catch((error) => {
        console.error('❌ Service Worker unregistration failed:', error);
      });
  }
}

/**
 * Update service worker
 */
export function updateSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.update();
        console.log('🔄 Service Worker update triggered');
      })
      .catch((error) => {
        console.error('❌ Service Worker update failed:', error);
      });
  }
}

/**
 * Check if app is running offline
 */
export function isOffline() {
  return !navigator.onLine;
}

/**
 * Show update available notification
 */
function showUpdateAvailable() {
  // Create a simple notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('EatZone Update Available', {
      body: 'A new version of EatZone is available. Refresh to update.',
      icon: '/icon-192x192.png'
    });
  } else {
    // Fallback to console log or custom UI notification
    console.log('📱 Update available: A new version of EatZone is ready.');
  }
}

/**
 * Show cached for offline notification
 */
function showCachedForOffline() {
  console.log('📱 EatZone is now available offline!');
}

/**
 * Request notification permission
 */
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      console.log('🔔 Notification permission:', permission);
    });
  }
}

/**
 * Get service worker registration
 */
export function getRegistration() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready;
  }
  return Promise.reject('Service Worker not supported');
}

/**
 * Send message to service worker
 */
export function sendMessageToSW(message) {
  return getRegistration().then((registration) => {
    if (registration.active) {
      registration.active.postMessage(message);
    }
  });
}

/**
 * Listen for service worker messages
 */
export function listenForSWMessages(callback) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', callback);
  }
}

/**
 * Check for service worker updates periodically
 */
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    setInterval(() => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }, 60000); // Check every minute
  }
}
