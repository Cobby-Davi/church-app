import { requireActiveMember, escapeHtml } from './auth-guard.js';
import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

await requireActiveMember();

async function loadSermons() {
  const list = document.getElementById('sermonsList');
  list.innerHTML = 'Loading...';

  try {
    const q = query(collection(db, 'sermons'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      list.innerHTML = '<p style="font-size:13px; color:#c4b0d3;">No sermons posted yet.</p>';
      return;
    }

    list.innerHTML = snapshot.docs.map(docSnap => {
      const s = docSnap.data();
      return `
        <div class="sermon-card">
          <h3>${escapeHtml(s.title)}</h3>
          <div class="meta">${escapeHtml(s.speaker)} &bull; ${escapeHtml(s.date)}</div>
          <p>${escapeHtml(s.notes)}</p>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p style="font-size:13px; color:#ff8f84;">Error loading sermons.</p>';
  }
}

loadSermons();