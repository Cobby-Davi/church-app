import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

async function loadPrayers() {
  const list = document.getElementById('prayerList');
  list.innerHTML = 'Loading...';

  const q = query(collection(db, "prayers"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    list.innerHTML = '<p style="font-size:13px; color:#666;">No prayer requests yet. Be the first to share.</p>';
    return;
  }

  list.innerHTML = snapshot.docs.map(docSnap => {
    const p = docSnap.data();
    return `
      <div class="prayer-card">
        ${p.text}
        <div class="meta">${p.name} &bull; ${p.date}</div>
      </div>
    `;
  }).join('');
}

document.getElementById('prayerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const text = document.getElementById('prayerText').value.trim();
  if (text === '') return;

  await addDoc(collection(db, "prayers"), {
    text: text,
    name: currentMember.name,
    date: new Date().toLocaleDateString(),
    createdAt: serverTimestamp()
  });

  document.getElementById('prayerText').value = '';
  loadPrayers();
});

loadPrayers();