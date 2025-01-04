// Local storage keys
const LOCAL_STORAGE_NOTES_KEY = "notes";

// Save notes to local storage
function saveNotesToLocalStorage(notes) {
  localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(notes));
}

// Fetch notes from local storage
function getNotesFromLocalStorage() {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_NOTES_KEY)) || [];
}

// Sync notes from the server to local storage
function syncNotesWithServer(serverNotes) {
  const localNotes = getNotesFromLocalStorage();
  if (localNotes.length === 0) {
    saveNotesToLocalStorage(serverNotes);
  }
}

// Load notes when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetch("/notes")
    .then((response) => response.json())
    .then((serverNotes) => {
      syncNotesWithServer(serverNotes);
    });
});