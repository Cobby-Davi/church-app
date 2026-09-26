document.getElementById('payButton').addEventListener('click', function() {
  let currentMember = JSON.parse(localStorage.getItem('currentMember'));

  if (!currentMember) {
    document.getElementById('statusMessage').textContent = 'No registration found. Please register again.';
    return;
  }

  // Simulate a successful payment
  currentMember.status = 'Pending Approval';

  // Update this member in the main members list too
  let members = JSON.parse(localStorage.getItem('members')) || [];
  members = members.map(m => m.phone === currentMember.phone ? currentMember : m);
  localStorage.setItem('members', JSON.stringify(members));
  localStorage.setItem('currentMember', JSON.stringify(currentMember));

  window.location.href = 'pending.html';
});