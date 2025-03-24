
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import * as serviceWorker from './serviceWorker'
import { errorHandler } from './services/errorHandler'

// Initialize error handler before rendering the app
if (typeof window !== 'undefined') {
  errorHandler.init();
}

createRoot(document.getElementById("root")!).render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
