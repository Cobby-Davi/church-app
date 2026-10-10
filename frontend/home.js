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

async function checkBirthdays() {
  const snapshot = await getDocs(collection(db, "members"));

  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const birthdayMembers = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status === 'Active' && data.birthday) {
      const bday = new Date(data.birthday);
      if (bday.getMonth() + 1 === todayMonth && bday.getDate() === todayDay) {
        birthdayMembers.push(data.name);
      }
    }
  });

  if (birthdayMembers.length > 0) {
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#fff3cd; border-left:4px solid #ffc107; padding:10px; border-radius:4px; margin-bottom:15px; font-size:13px; text-align:center;';
    banner.innerHTML = '🎉 Happy Birthday ' + birthdayMembers.join(', ') + '! 🎂';
    document.querySelector('.home-container').insertBefore(banner, document.querySelector('h2'));
  }
}

checkBirthdays();

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