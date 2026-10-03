if (sessionStorage.getItem('isAdmin') !== 'true') {
  window.location.href = 'adminLogin.html';
}
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
document.getElementById('devotionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const date = document.getElementById('devDate').value;
  const reference = document.getElementById('devRef').value.trim();

  if (date === '' || reference === '') return;

  let devotions = JSON.parse(localStorage.getItem('devotions')) || [];
  devotions = devotions.filter(d => d.date !== date); // replace if same date already scheduled
  devotions.push({ date: date, reference: reference });
  localStorage.setItem('devotions', JSON.stringify(devotions));

  document.getElementById('devDate').value = '';
  document.getElementById('devRef').value = '';
});
// ----- Mark Attendance -----
document.getElementById('attendanceDate').valueAsDate = new Date();

function renderMemberChecklist() {
  const members = JSON.parse(localStorage.getItem('members')) || [];
  const active = members.filter(m => m.status === 'Active');
  const checklist = document.getElementById('memberChecklist');

  const date = document.getElementById('attendanceDate').value;
  const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
  const existing = records.find(r => r.date === date);
  const presentPhones = existing ? existing.present : [];

  if (active.length === 0) {
    checklist.innerHTML = '<p>No active members yet.</p>';
    return;
  }

  checklist.innerHTML = active.map(m => `
    <label style="display:block; margin-top:4px;">
      <input type="checkbox" class="attendCheck" value="${m.phone}" ${presentPhones.includes(m.phone) ? 'checked' : ''}>
      ${m.name} (${m.phone})
    </label>
  `).join('');
}

document.getElementById('attendanceDate').addEventListener('change', renderMemberChecklist);
renderMemberChecklist();

document.getElementById('saveAttendanceBtn').addEventListener('click', function() {
  const date = document.getElementById('attendanceDate').value;
  const checked = Array.from(document.querySelectorAll('.attendCheck:checked')).map(c => c.value);

  let records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
  records = records.filter(r => r.date !== date);
  records.push({ date: date, present: checked });
  localStorage.setItem('attendanceRecords', JSON.stringify(records));

  alert('Attendance saved for ' + date);
});

// ----- Add Member Manually -----
document.getElementById('addMemberForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('newName').value.trim();
  const phone = document.getElementById('newPhone').value.trim();
  const password = document.getElementById('newPassword').value;

  if (!name || !phone || !password) return;

  let members = JSON.parse(localStorage.getItem('members')) || [];

  if (members.find(m => m.phone === phone)) {
    alert('A member with that phone number already exists.');
    return;
  }

  members.push({ name, phone, password, status: 'Active' });
  localStorage.setItem('members', JSON.stringify(members));

  document.getElementById('newName').value = '';
  document.getElementById('newPhone').value = '';
  document.getElementById('newPassword').value = '';

  renderAllMembers();
  renderMemberChecklist();
});

// ----- All Members List (with Remove option) -----
function renderAllMembers() {
  const members = JSON.parse(localStorage.getItem('members')) || [];
  const list = document.getElementById('allMembersList');

  if (members.length === 0) {
    list.innerHTML = '<p style="font-size:13px; color:#666;">No members yet.</p>';
    return;
  }

  list.innerHTML = members.map(m => `
    <div class="member-row">
      <div class="member-info">
        <strong>${m.name}</strong> (${m.status})<br>
        ${m.phone}
      </div>
      <div class="member-actions">
        <button class="reject-btn remove-member-btn" data-phone="${m.phone}">Remove</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.remove-member-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Remove this member completely?')) return;
      let members = JSON.parse(localStorage.getItem('members')) || [];
      members = members.filter(m => m.phone !== btn.dataset.phone);
      localStorage.setItem('members', JSON.stringify(members));
      renderAllMembers();
      renderMemberChecklist();
    });
  });
}

renderAllMembers();
// Load existing links into the form
const existingLinks = JSON.parse(localStorage.getItem('liveLinks')) || {};
document.getElementById('facebookLink').value = existingLinks.facebook || '';
document.getElementById('zoomLink').value = existingLinks.zoom || '';

document.getElementById('liveLinksForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const facebook = document.getElementById('facebookLink').value.trim();
  const zoom = document.getElementById('zoomLink').value.trim();

  localStorage.setItem('liveLinks', JSON.stringify({ facebook, zoom }));
  alert('Live links updated.');
});