export function clearAllStorage() {
  try {
    localStorage.removeItem('freepaper-issues');
    localStorage.removeItem('freepaper-worklogs');
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
}

export function initializeStorage() {
  // Clear corrupted data on init
  if (typeof window !== 'undefined') {
    try {
      const testKey = '__storage-test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      console.error('Storage error:', e);
      clearAllStorage();
    }
  }
}
