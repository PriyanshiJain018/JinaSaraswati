// js/sw-register.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
  
  // Handle service worker messages
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'CACHE_UPDATED') {
      console.log('Cache updated:', event.data.payload);
    }
  });
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <p>नया अपडेट उपलब्ध है! New update available!</p>
    <button onclick="window.location.reload()">Refresh</button>
  `;
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
    animation: slideUp 0.3s ease;
  `;
  document.body.appendChild(notification);
}
