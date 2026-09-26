// Require login
const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

function loadSermons() {
  const sermons = JSON.parse(localStorage.getItem('sermons')) || [];
  const list = document.getElementById('sermonsList');

  if (sermons.length === 0) {
    list.innerHTML = '<p style="font-size:13px; color:#666;">No sermons posted yet.</p>';
    return;
  }

  const sorted = [...sermons].reverse(); // newest first

  list.innerHTML = sorted.map(s => `
    <div class="sermon-card">
      <h3>${s.title}</h3>
      <div class="meta">${s.speaker} &bull; ${s.date}</div>
      <p>${s.notes}</p>
    </div>
  `).join('');
}

loadSermons();