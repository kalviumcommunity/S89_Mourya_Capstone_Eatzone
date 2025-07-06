// Clear all browser caches and service workers
(async function clearAllCaches() {
  console.log('🧹 Clearing all browser caches and service workers...');
  
  try {
    // Clear all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log('🗑️ Unregistering service worker:', registration.scope);
        await registration.unregister();
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        console.log('🗑️ Deleting cache:', cacheName);
        await caches.delete(cacheName);
      }
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ All caches cleared! Please refresh the page.');
    
    // Auto refresh after 2 seconds
    setTimeout(() => {
      window.location.reload(true);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
})();
