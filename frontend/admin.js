function loadPendingMembers() {
  const members = JSON.parse(localStorage.getItem('members')) || [];
  const pendingList = document.getElementById('pendingList');
  pendingList.innerHTML = '';

  const pendingMembers = members.filter(m => m.status === 'Pending Approval');

  if (pendingMembers.length === 0) {
    pendingList.innerHTML = '<p style="font-size:13px; color:#666;">No pending members right now.</p>';
    return;
  }

  pendingMembers.forEach(member => {
    const row = document.createElement('div');
    row.className = 'member-row';

    row.innerHTML = `
      <div class="member-info">
        <strong>${member.name}</strong><br>
        ${member.phone}
      </div>
      <div class="member-actions">
        <button class="approve-btn" data-phone="${member.phone}">Approve</button>
        <button class="reject-btn" data-phone="${member.phone}">Reject</button>
      </div>
    `;

    pendingList.appendChild(row);
  });

  // Attach click handlers
  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', () => updateStatus(btn.dataset.phone, 'Active'));
  });

  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', () => updateStatus(btn.dataset.phone, 'Rejected'));
  });
}

function updateStatus(phone, newStatus) {
  let members = JSON.parse(localStorage.getItem('members')) || [];
  members = members.map(m => m.phone === phone ? { ...m, status: newStatus } : m);
  localStorage.setItem('members', JSON.stringify(members));
  loadPendingMembers(); // refresh the list
}

loadPendingMembers();
document.getElementById('announcementForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('annTitle').value.trim();
  const message = document.getElementById('annMessage').value.trim();

  if (title === '' || message === '') return;

  const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
  announcements.push({
    title: title,
    message: message,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('announcements', JSON.stringify(announcements));

  document.getElementById('annTitle').value = '';
  document.getElementById('annMessage').value = '';
});
document.getElementById('sermonForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('sermonTitle').value.trim();
  const speaker = document.getElementById('sermonSpeaker').value.trim();
  const notes = document.getElementById('sermonNotes').value.trim();

  if (title === '' || speaker === '' || notes === '') return;

  const sermons = JSON.parse(localStorage.getItem('sermons')) || [];
  sermons.push({
    title: title,
    speaker: speaker,
    notes: notes,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('sermons', JSON.stringify(sermons));

  document.getElementById('sermonTitle').value = '';
  document.getElementById('sermonSpeaker').value = '';
  document.getElementById('sermonNotes').value = '';
});