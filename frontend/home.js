import { requireActiveMember, logout, escapeHtml } from './auth-guard.js';
import { enableNotifications, listenForMessages } from './notifications.js';
import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const currentMember = await requireActiveMember();

document.getElementById('welcomeMessage').textContent = 'Hello, ' + (currentMember.name || '') + '!';

// Renewal countdown
if (currentMember.paidUntil) {
  const daysLeft = Math.ceil((currentMember.paidUntil.toDate() - new Date()) / (1000 * 60 * 60 * 24));
  const countdownEl = document.getElementById('paymentCountdown');

  if (daysLeft <= 5 && daysLeft > 0) {
    countdownEl.textContent = `⚠️ Membership renews in ${daysLeft} day(s)`;
    countdownEl.style.color = '#ff8f84';
  } else if (daysLeft > 0) {
    countdownEl.textContent = `Membership active — ${daysLeft} day(s) remaining`;
  }
}

async function checkBirthdays() {
  try {
    const snapshot = await getDocs(collection(db, 'birthdays'));
    const today = new Date();
    const todayKey = String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    const birthdayMembers = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.md === todayKey) {
        birthdayMembers.push(data.name);
      }
    });

    if (birthdayMembers.length > 0) {
      const banner = document.createElement('div');
      banner.style.cssText = 'background:rgba(240,179,35,0.16); border-left:4px solid #f0b323; padding:12px; border-radius:12px; margin:16px 0; font-size:14px; text-align:center;';
      banner.textContent = '🎉 Happy Birthday ' + birthdayMembers.join(', ') + '! 🎂';
      document.querySelector('.home-container').insertBefore(banner, document.querySelector('h2'));
    }
  } catch (err) {
    console.error(err);
  }
}

checkBirthdays();

async function loadAnnouncements() {
  const list = document.getElementById('announcementsList');
  list.innerHTML = 'Loading...';

  try {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      list.innerHTML = '<p style="font-size:13px; color:#c4b0d3;">No announcements yet.</p>';
      return;
    }

    list.innerHTML = snapshot.docs.map(docSnap => {
      const a = docSnap.data();
      return `
        <div class="announcement">
          <h3>${escapeHtml(a.title)}</h3>
          <p>${escapeHtml(a.message)}</p>
          <div class="date">${escapeHtml(a.date)}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p style="font-size:13px; color:#ff8f84;">Error loading announcements.</p>';
  }
}

loadAnnouncements();

// Notifications
const notifBox = document.getElementById('notifBox');
if ('Notification' in window && Notification.permission === 'granted') {
  notifBox.style.display = 'none';
  listenForMessages();
}

document.getElementById('enableNotifBtn').addEventListener('click', async () => {
  try {
    await enableNotifications(currentMember.id);
    notifBox.textContent = '✅ Notifications enabled.';
  } catch (err) {
    console.error(err);
    notifBox.textContent = '❌ Could not enable notifications: ' + err.message;
  }
});

// Log out
const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}