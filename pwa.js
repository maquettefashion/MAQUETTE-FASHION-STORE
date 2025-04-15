// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Add to Home Screen functionality
let deferredPrompt;
const addToHomeBtn = document.getElementById('add-to-home');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default prompt
  e.preventDefault();
  // Store the event for later use
  deferredPrompt = e;
  // Show the Add to Home button
  if (addToHomeBtn) {
    addToHomeBtn.classList.remove('d-none');
  }
});

// When the user clicks the Add to Home button
if (addToHomeBtn) {
  addToHomeBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user's choice
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // Clear the deferred prompt
        deferredPrompt = null;
        
        // Hide the button
        addToHomeBtn.classList.add('d-none');
      });
    }
  });
}

// Detect online/offline status
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  const statusElement = document.getElementById('connection-status');
  if (statusElement) {
    if (navigator.onLine) {
      statusElement.textContent = 'Online';
      statusElement.classList.remove('text-danger');
      statusElement.classList.add('text-success');
    } else {
      statusElement.textContent = 'Offline';
      statusElement.classList.remove('text-success');
      statusElement.classList.add('text-danger');
    }
  }
}