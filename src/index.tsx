import { createRoot } from 'react-dom/client';
import '@cubing/icons';
import reportWebVitals from './reportWebVitals';
import App from './App';
import './index.css';
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import '@total-typescript/ts-reset';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(undefined);

// serviceWorkerRegistration.register();

// Establish a cache name
const cacheName = 'MyFancyCacheName_v1';

self.addEventListener('fetch', (event) => {
  // Check if this is a navigation request
  if (event?.request?.mode === 'navigate') {
    // Open the cache
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        // Go to the network first
        return fetch(event.request.url)
          .then((fetchedResponse) => {
            cache.put(event.request, fetchedResponse.clone());

            return fetchedResponse;
          })
          .catch(() => {
            // If the network is unavailable, get from cache
            console.log('loading from cache', event);
            return cache.match(event.request.url);
          });
      })
    );
  } else {
    return;
  }
});
