// Change this to whatever password you want for admin access
const ADMIN_PASSWORD = "changeme123";

document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const entered = document.getElementById('adminPassword').value;
  const statusMessage = document.getElementById('statusMessage');

  if (entered === ADMIN_PASSWORD) {
    sessionStorage.setItem('isAdmin', 'true');
    window.location.href = 'admin.html';
  } else {
    statusMessage.textContent = 'Incorrect password.';
  }
});