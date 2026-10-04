const DB_NAME = 'churchAppBible';
const STORE_NAME = 'kjv';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToDB(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getFromDB(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function isBibleDownloaded() {
  const verses = await getFromDB('verses');
  return !!verses;
}

export async function downloadBible(onProgress) {
  onProgress('Downloading Bible text...');
  const module = await import('https://unpkg.com/es-kjv');
  const verses = module.verses;

  onProgress('Organizing books and chapters...');
  const books = [];
  const chapterCounts = {};

  for (const key in verses) {
    const match = key.match(/^(.*)\s(\d+):(\d+)$/);
    if (!match) continue;
    const book = match[1];
    const chapter = parseInt(match[2]);

    if (!books.includes(book)) books.push(book);
    if (!chapterCounts[book] || chapter > chapterCounts[book]) {
      chapterCounts[book] = chapter;
    }
  }

  onProgress('Saving for offline use...');
  await saveToDB('verses', verses);
  await saveToDB('books', books);
  await saveToDB('chapterCounts', chapterCounts);

  onProgress('Done!');
}

export async function getOfflineChapter(book, chapter) {
  const verses = await getFromDB('verses');
  if (!verses) return null;

  const results = [];
  for (const key in verses) {
    const match = key.match(/^(.*)\s(\d+):(\d+)$/);
    if (!match) continue;
    if (match[1] === book && parseInt(match[2]) === chapter) {
      results.push({ verse: parseInt(match[3]), text: verses[key] });
    }
  }
  results.sort((a, b) => a.verse - b.verse);
  return results;
}

export async function getOfflineBooks() {
  return (await getFromDB('books')) || [];
}

export async function getOfflineChapterCount(book) {
  const counts = await getFromDB('chapterCounts');
  return counts ? counts[book] : null;
}