// Check login + status before showing anything
const currentMember = JSON.parse(localStorage.getItem('currentMember'));

if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

document.getElementById('welcomeMessage').textContent = 'Hello, ' + currentMember.name + '!';

function loadAnnouncements() {
  const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
  const list = document.getElementById('announcementsList');

  if (announcements.length === 0) {
    list.innerHTML = '<p style="font-size:13px; color:#666;">No announcements yet.</p>';
    return;
  }

  // Show newest first
  const sorted = [...announcements].reverse();

  list.innerHTML = sorted.map(a => `
    <div class="announcement">
      <h3>${a.title}</h3>
      <p>${a.message}</p>
      <div class="date">${a.date}</div>
    </div>
  `).join('');
}

loadAnnouncements();