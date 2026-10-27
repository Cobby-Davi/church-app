import { requireActiveMember, escapeHtml } from './auth-guard.js';
import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

await requireActiveMember();

function getTodayString() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

async function loadTodayDevotion() {
  const display = document.getElementById('devotionDisplay');

  try {
    const q = query(collection(db, 'devotions'), where('date', '==', getTodayString()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      display.textContent = 'No devotion has been scheduled for today.';
      return;
    }

    const todayDevotion = snapshot.docs[0].data();
    display.textContent = 'Loading verse...';

    const response = await fetch(`https://bible-api.com/${encodeURIComponent(todayDevotion.reference)}`);
    const data = await response.json();

    if (data.error) {
      display.textContent = "Could not load today's verse.";
      return;
    }

    display.innerHTML = `<span class="ref">${escapeHtml(data.reference)}</span>${escapeHtml(data.text)}`;
  } catch (err) {
    console.error(err);
    display.textContent = 'Error loading devotion.';
  }
}

loadTodayDevotion();