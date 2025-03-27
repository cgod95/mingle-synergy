import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import './styles/global.css' // Adding the global CSS import
import * as serviceWorker from './serviceWorker'
import { errorHandler } from './services/errorHandler'
import { initErrorTracking } from './utils/errorHandler'
import { setupNetworkMonitoring } from './utils/networkMonitor'
import { initImageOptimization } from './utils/imageOptimizer'
import { initPerformanceMonitoring } from './utils/performanceMonitor'
import { ErrorBoundary } from './components/ErrorBoundary'
import { logUserAction } from './utils/errorHandler'
import { app } from './firebase/config'

// Mark app start time for performance measurement
performance.mark('app_init_start');

// Initialize services and monitoring before rendering the app
if (typeof window !== 'undefined') {
  // Initialize error handlers
  errorHandler.init();
  initErrorTracking();
  
  // Set up performance monitoring
  initPerformanceMonitoring();
  
  // Set up network monitoring
  setupNetworkMonitoring();
  
  // Initialize image optimization
  initImageOptimization();
  
  // Log app initialization
  logUserAction('app_initialized', {
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
    referrer: document.referrer || 'direct',
    userAgent: navigator.userAgent
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('Root element not found. Check your HTML for an element with id="root"');
} else {
  // Wrap App with error boundary
  createRoot(rootElement).render(
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">The application encountered an unexpected error.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg"
          >
            Refresh App
          </button>
        </div>
      }
    >
      <App />
    </ErrorBoundary>
  );
  
  // Mark app rendered time
  performance.mark('app_rendered');
  performance.measure('app_initialization', 'app_init_start', 'app_rendered');
  const measure = performance.getEntriesByName('app_initialization')[0];
  console.log(`App initialized in ${measure.duration.toFixed(2)}ms`);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. This comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

// Subscribe to service worker updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker == null) {
        return;
      }
      
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // At this point, the updated content has been fetched
            console.log('New content is available; please refresh.');
            
            // Show update notification (can be built as a component)
            const event = new CustomEvent('serviceWorkerUpdated');
            window.dispatchEvent(event);
          } else {
            // At this point, everything has been precached
            console.log('Content is cached for offline use.');
          }
        }
      };
    };
  });
}
