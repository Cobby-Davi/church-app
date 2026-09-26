document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault(); // stop the page from refreshing

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;

  const statusMessage = document.getElementById('statusMessage');

  // Basic validation
  if (name === '' || phone === '' || password === '') {
    statusMessage.textContent = 'Please fill in all fields.';
    return;
  }

  if (password.length < 4) {
    statusMessage.textContent = 'Password must be at least 4 characters.';
    return;
  }

  // Create the member record
  const newMember = {
    name: name,
    phone: phone,
    password: password, // NOTE: plain text for now — real backend will hash this properly later
    status: 'Unpaid'
  };

  // Save into a list of members in localStorage
  let members = JSON.parse(localStorage.getItem('members')) || [];
  members.push(newMember);
  localStorage.setItem('members', JSON.stringify(members));

  // Remember who just registered, so the next pages know who we're talking about
  localStorage.setItem('currentMember', JSON.stringify(newMember));

  // Move to the payment step
  window.location.href = 'payment.html';
});