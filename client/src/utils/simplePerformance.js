
// Simple performance monitoring
if (typeof window !== 'undefined') {
  // Monitor page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`📊 Page loaded in ${loadTime.toFixed(2)}ms`);
  });

  // Monitor largest contentful paint
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`🎯 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
}
