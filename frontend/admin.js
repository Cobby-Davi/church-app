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