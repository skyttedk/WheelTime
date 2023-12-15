document.addEventListener('DOMContentLoaded', () => {

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);


        if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
          //console.log('Periodic Background Sync is supported!');

          //Make sure we have permissions



          navigator.permissions.query({ name: 'periodic-background-sync' })
            .then((permissionStatus) => {
              if (permissionStatus.state === 'granted') {
                // Permission is already granted

                navigator.serviceWorker.ready.then(function(registration) {
                  // Now register for background sync because the service worker is ready
                  registerPeriodicBackgroundSync(registration);
                });

              } else if (permissionStatus.state === 'denied') {
                // Permission is not granted yet, so request it
                navigator.permissions.request({ name: 'periodic-background-sync' })
                  .then((newPermissionStatus) => {
                    if (newPermissionStatus.state === 'granted') {

                      navigator.serviceWorker.ready.then(function(registration) {
                        // Now register for background sync because the service worker is ready
                        registerPeriodicBackgroundSync(registration);
                      });

                    } else {
                      console.error('Permission denied');
                    }
                  });
              } else {
                console.error('Permission denied');
              }
            });


        } else {
          console.log('Periodic Background Sync is not supported.');
        }



      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
  const logPositionBtn = document.getElementById('log-position');
  logPositionBtn.addEventListener('click', logCurrentPosition);

  // Initiate logging positions at app start
  startLoggingPositions(1); // Logs every 5 minutes
});

async function registerPeriodicBackgroundSync(registration) {
  // Check if Periodic Background Sync is supported
  if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
    debugger;
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync',
    });

    // If permission isn't granted, you will have to request it from the user
    if (status.state === 'granted') {
      try {
        // Attempt to register the periodic sync
        await registration.periodicSync.register('gps-log-sync', {
          // Minimum interval at which the sync could trigger (in milliseconds)
          minInterval: 5 * 60 * 1000, // 5 minutes
        });
      } catch (e) {
        console.error(`Periodic Sync could not be registered: ${e}`);
      }
    }
  }
}

function logCurrentPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const positionData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date(position.timestamp)
      };
      document.getElementById('coordinates').innerText = JSON.stringify(positionData);

      // Store the coordinates in Local Storage or IndexedDB
      savePositionLocally(positionData);
    }, () => alert('Error getting position'), { enableHighAccuracy: true });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

function startLoggingPositions(intervalMinutes) {
  // Convert minutes to milliseconds
  const intervalMs = intervalMinutes * 60 * 1000;

  // Set interval to log position
  setInterval(logCurrentPosition, intervalMs);
}

function savePositionLocally(positionData) {
  const positions = JSON.parse(localStorage.getItem('positions')) || [];
  positions.push(positionData);
  localStorage.setItem('positions', JSON.stringify(positions));
}