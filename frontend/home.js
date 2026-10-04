import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

document.getElementById('welcomeMessage').textContent = 'Hello, ' + currentMember.name + '!';
if (currentMember.lastPaymentDate) {
  const daysSincePayment = Math.floor((Date.now() - new Date(currentMember.lastPaymentDate)) / (1000 * 60 * 60 * 24));
  const daysLeft = 30 - daysSincePayment;
  const countdownEl = document.getElementById('paymentCountdown');

  if (daysLeft <= 5 && daysLeft > 0) {
    countdownEl.textContent = `⚠️ Membership renews in ${daysLeft} day(s)`;
    countdownEl.style.color = '#c0392b';
  } else if (daysLeft > 0) {
    countdownEl.textContent = `Membership active — ${daysLeft} day(s) remaining`;
  }
}
async function loadAnnouncements() {
  const list = document.getElementById('announcementsList');
  list.innerHTML = 'Loading...';

  try {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      list.innerHTML = '<p style="font-size:13px; color:#666;">No announcements yet.</p>';
      return;
    }

    list.innerHTML = snapshot.docs.map(docSnap => {
      const a = docSnap.data();
      return `
        <div class="announcement">
          <h3>${a.title}</h3>
          <p>${a.message}</p>
          <div class="date">${a.date}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p style="font-size:13px; color:#c0392b;">Error loading announcements.</p>';
  }
}

loadAnnouncements();