// Background service worker for Life OS Chrome Extension
// Handles daily reminders and notifications

// Check if chrome APIs are available
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
  // Set up daily alarm for mission reminders
  chrome.runtime.onInstalled.addListener(() => {
    try {
      // Create alarm for daily reminder at 9 AM
      chrome.alarms.create('dailyReminder', {
        when: getNext9AM(),
        periodInMinutes: 24 * 60 // Repeat every 24 hours
      });
    } catch (error) {
      console.error('Error creating alarm:', error);
    }
  });

  // Listen for alarm events
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyReminder') {
      try {
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icon48.png'),
          title: 'Life OS - Daily Missions',
          message: 'Time to set your three missions for today!'
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  });
}

// Helper function to get next 9 AM timestamp
function getNext9AM() {
  const now = new Date();
  const next9AM = new Date();
  next9AM.setHours(9, 0, 0, 0);
  
  // If it's already past 9 AM today, set for tomorrow
  if (now.getTime() > next9AM.getTime()) {
    next9AM.setDate(next9AM.getDate() + 1);
  }
  
  return next9AM.getTime();
}
