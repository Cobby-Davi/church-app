document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const statusMessage = document.getElementById('statusMessage');

  const members = JSON.parse(localStorage.getItem('members')) || [];
  const member = members.find(m => m.phone === phone);

  if (!member) {
    statusMessage.textContent = 'No account found with that phone number.';
    return;
  }

  if (member.password !== password) {
    statusMessage.textContent = 'Incorrect password.';
    return;
  }

  // Save who's currently logged in
  localStorage.setItem('currentMember', JSON.stringify(member));

  // Route based on status
  switch (member.status) {
    case 'Active':
      window.location.href = 'home.html';
      break;
    case 'Unpaid':
      window.location.href = 'payment.html';
      break;
    case 'Pending Approval':
      window.location.href = 'pending.html';
      break;
    case 'Rejected':
      statusMessage.textContent = 'Your registration was not approved. Please contact the church.';
      break;
    default:
      statusMessage.textContent = 'Account status unknown. Please contact the church.';
  }
});