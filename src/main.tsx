
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import * as serviceWorker from './serviceWorker'
import { errorHandler } from './services/errorHandler'
import { initErrorTracking } from './utils/errorHandler'
import { setupNetworkMonitoring } from './utils/networkMonitor'
import { initImageOptimization } from './utils/imageOptimizer'

// Initialize error handlers before rendering the app
if (typeof window !== 'undefined') {
  errorHandler.init();
  initErrorTracking();
  
  // Set up network monitoring
  setupNetworkMonitoring();
  
  // Initialize image optimization
  initImageOptimization();
}

createRoot(document.getElementById("root")!).render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
