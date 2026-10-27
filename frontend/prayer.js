import { requireActiveMember, escapeHtml } from './auth-guard.js';
import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const currentMember = await requireActiveMember();

async function loadPrayers() {
  const list = document.getElementById('prayerList');
  list.innerHTML = 'Loading...';

  try {
    const q = query(collection(db, 'prayers'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      list.innerHTML = '<p style="font-size:13px; color:#c4b0d3;">No prayer requests yet. Be the first to share.</p>';
      return;
    }

    list.innerHTML = snapshot.docs.map(docSnap => {
      const p = docSnap.data();
      return `
        <div class="prayer-card">
          ${escapeHtml(p.text)}
          <div class="meta">${escapeHtml(p.name)} &bull; ${escapeHtml(p.date)}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p style="font-size:13px; color:#ff8f84;">Error loading prayer requests.</p>';
  }
}

document.getElementById('prayerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const text = document.getElementById('prayerText').value.trim();
  if (text === '') return;

  try {
    await addDoc(collection(db, 'prayers'), {
      text: text,
      name: currentMember.name,
      uid: currentMember.id,
      date: new Date().toLocaleDateString(),
      createdAt: serverTimestamp()
    });

    document.getElementById('prayerText').value = '';
    loadPrayers();
  } catch (err) {
    console.error(err);
    alert('Could not submit your request. Please try again.');
  }
});

loadPrayers();