import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

async function loadSermons() {
  const list = document.getElementById('sermonsList');
  list.innerHTML = 'Loading...';

  try {
    const q = query(collection(db, "sermons"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      list.innerHTML = '<p style="font-size:13px; color:#666;">No sermons posted yet.</p>';
      return;
    }

    list.innerHTML = snapshot.docs.map(docSnap => {
      const s = docSnap.data();
      return `
        <div class="sermon-card">
          <h3>${s.title}</h3>
          <div class="meta">${s.speaker} &bull; ${s.date}</div>
          <p>${s.notes}</p>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p style="font-size:13px; color:#c0392b;">Error loading sermons.</p>';
  }
}

loadSermons();