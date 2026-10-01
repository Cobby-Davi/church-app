const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

function loadPrayers() {
  const prayers = JSON.parse(localStorage.getItem('prayers')) || [];
  const list = document.getElementById('prayerList');

  if (prayers.length === 0) {
    list.innerHTML = '<p style="font-size:13px; color:#666;">No prayer requests yet. Be the first to share.</p>';
    return;
  }

  const sorted = [...prayers].reverse();

  list.innerHTML = sorted.map(p => `
    <div class="prayer-card">
      ${p.text}
      <div class="meta">${p.name} &bull; ${p.date}</div>
    </div>
  `).join('');
}

document.getElementById('prayerForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const text = document.getElementById('prayerText').value.trim();
  if (text === '') return;

  const prayers = JSON.parse(localStorage.getItem('prayers')) || [];
  prayers.push({
    text: text,
    name: currentMember.name,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('prayers', JSON.stringify(prayers));

  document.getElementById('prayerText').value = '';
  loadPrayers();
});

loadPrayers();