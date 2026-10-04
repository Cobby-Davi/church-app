import { isBibleDownloaded, downloadBible, getOfflineChapter, getOfflineBooks, getOfflineChapterCount } from './bible-offline.js';

const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

const onlineBooks = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah",
  "Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians",
  "2 Corinthians","Galatians","Ephesians","Philippians","Colossians",
  "1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon",
  "Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
];

let usingOffline = false;
let currentBook = "John";
let currentChapter = 3;

const bookSelect = document.getElementById('bookSelect');
const offlineStatus = document.getElementById('offlineStatus');

async function setupOfflineStatus() {
  const downloaded = await isBibleDownloaded();

  if (downloaded) {
    usingOffline = true;
    offlineStatus.innerHTML = '✅ Bible downloaded — works offline.';
    const books = await getOfflineBooks();
    populateBookList(books.length ? books : onlineBooks);
  } else {
    usingOffline = false;
    offlineStatus.innerHTML = '📡 Currently online-only. <button id="downloadBtn">Download for Offline Use</button>';
    populateBookList(onlineBooks);

    document.getElementById('downloadBtn').addEventListener('click', async () => {
      offlineStatus.textContent = 'Starting download...';
      try {
        await downloadBible((msg) => { offlineStatus.textContent = msg; });
        offlineStatus.innerHTML = '✅ Bible downloaded — works offline.';
        usingOffline = true;
        const books = await getOfflineBooks();
        populateBookList(books.length ? books : onlineBooks);
      } catch (err) {
        console.error(err);
        offlineStatus.textContent = '❌ Download failed. Check your internet connection and try again.';
      }
    });
  }
}

function populateBookList(books) {
  bookSelect.innerHTML = '';
  books.forEach(book => {
    const option = document.createElement('option');
    option.value = book;
    option.textContent = book;
    bookSelect.appendChild(option);
  });
  bookSelect.value = currentBook;
  document.getElementById('chapterInput').value = currentChapter;
}

async function loadChapter(book, chapter) {
  const display = document.getElementById('verseDisplay');
  display.textContent = 'Loading...';

  if (usingOffline) {
    const verses = await getOfflineChapter(book, chapter);
    if (!verses || verses.length === 0) {
      display.textContent = 'Chapter not found offline.';
      return;
    }
    display.innerHTML = verses.map(v => `<sup>${v.verse}</sup>${v.text}`).join(' ');
    currentBook = book;
    currentChapter = chapter;
    bookSelect.value = book;
    document.getElementById('chapterInput').value = chapter;
    return;
  }

  // Online fallback
  try {
    const reference = `${book} ${chapter}`;
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}`);
    const data = await response.json();

    if (data.error) {
      display.textContent = 'Chapter not found.';
      return;
    }

    display.innerHTML = data.verses.map(v => `<sup>${v.verse}</sup>${v.text}`).join(' ');
    currentBook = book;
    currentChapter = chapter;
    bookSelect.value = book;
    document.getElementById('chapterInput').value = chapter;
  } catch (err) {
    display.textContent = 'Error loading chapter. Check your internet connection.';
  }
}

document.getElementById('loadBtn').addEventListener('click', () => {
  const book = bookSelect.value;
  const chapter = parseInt(document.getElementById('chapterInput').value) || 1;
  loadChapter(book, chapter);
});

document.getElementById('nextBtn').addEventListener('click', () => {
  loadChapter(currentBook, currentChapter + 1);
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentChapter > 1) {
    loadChapter(currentBook, currentChapter - 1);
  }
});

document.getElementById('searchBtn').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  if (usingOffline) {
    const match = query.match(/^(.*)\s(\d+):(\d+)$/);
    if (match) {
      const book = match[1];
      const chapter = parseInt(match[2]);
      await loadChapter(book, chapter);
      return;
    }
  }

  fetch(`https://bible-api.com/${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById('verseDisplay').textContent = 'Reference not found.';
        return;
      }
      document.getElementById('verseDisplay').innerHTML =
        `<strong>${data.reference}</strong><br>` +
        data.verses.map(v => `<sup>${v.verse}</sup>${v.text}`).join(' ');
    })
    .catch(() => {
      document.getElementById('verseDisplay').textContent = 'Error loading verse.';
    });
});

setupOfflineStatus().then(() => loadChapter(currentBook, currentChapter));