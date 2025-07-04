import React, { useState } from 'react';
import { testImageLoading } from '../../utils/imageLoadTest';
import imageCache from '../../utils/imageCache';
import './DebugPanel.css';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runImageTest = async () => {
    setIsRunning(true);
    try {
      const results = await testImageLoading();
      setTestResults(results);
    } catch (error) {
      console.error('Error running image test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearCache = () => {
    imageCache.clear();
    console.log('🗑️ Image cache cleared');
  };

  const getCacheStats = () => {
    return imageCache.getStats();
  };

  if (!isOpen) {
    return (
      <div className="debug-panel-toggle" onClick={() => setIsOpen(true)}>
        🔧
      </div>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-panel-header">
        <h3>🔧 Debug Panel</h3>
        <button onClick={() => setIsOpen(false)}>✕</button>
      </div>
      
      <div className="debug-panel-content">
        <div className="debug-section">
          <h4>Image Loading Test</h4>
          <button 
            onClick={runImageTest} 
            disabled={isRunning}
            className="debug-button"
          >
            {isRunning ? 'Running Test...' : 'Run Image Test'}
          </button>
          
          {testResults && (
            <div className="test-results">
              <h5>Test Results:</h5>
              <div className="summary">
                <p>✅ Successful: {testResults.summary.successful}/{testResults.summary.total}</p>
                <p>⏱️ Average Load Time: {testResults.summary.averageLoadTime}ms</p>
                <p>📊 Success Rate: {testResults.summary.successRate}%</p>
              </div>
              
              <div className="detailed-results">
                {testResults.results.map((result, index) => (
                  <div key={index} className={`result-item ${result.status}`}>
                    <span className="result-name">{result.name}</span>
                    <span className="result-time">{result.loadTime}ms</span>
                    <span className="result-status">{result.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="debug-section">
          <h4>Image Cache</h4>
          <div className="cache-stats">
            <p>Cache Size: {getCacheStats().cacheSize}/{getCacheStats().maxCacheSize}</p>
            <p>Preload Queue: {getCacheStats().preloadQueueSize}</p>
          </div>
          <button onClick={clearCache} className="debug-button">
            Clear Cache
          </button>
        </div>

        <div className="debug-section">
          <h4>Performance Tips</h4>
          <ul className="tips-list">
            <li>Images should load under 3 seconds for good UX</li>
            <li>Check browser console for detailed performance logs</li>
            <li>Enable debug mode: localStorage.setItem('eatzone_debug', 'true')</li>
            <li>Refresh page after clearing cache to see improvements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
