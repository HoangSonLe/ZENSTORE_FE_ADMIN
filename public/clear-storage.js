// Script to clear localStorage
(function() {
  try {
    localStorage.removeItem('sidebar-store');
    localStorage.removeItem('theme-store');
    console.log('Local storage cleared successfully');
    alert('Local storage cleared. Please refresh the page to see the changes.');
  } catch (e) {
    console.error('Error clearing localStorage:', e);
    alert('Error clearing localStorage. Please try again.');
  }
})();
