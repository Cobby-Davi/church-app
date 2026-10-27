import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ADMIN_UID } from './auth-guard.js';

document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const statusMessage = document.getElementById('statusMessage');

  statusMessage.textContent = 'Checking...';

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    if (cred.user.uid !== ADMIN_UID) {
      await signOut(auth);
      statusMessage.textContent = 'This account is not an admin.';
      return;
    }

    window.location.href = 'admin.html';
  } catch (err) {
    console.error(err);
    if (err.code === 'auth/too-many-requests') {
      statusMessage.textContent = 'Too many attempts. Please wait a few minutes and try again.';
    } else {
      statusMessage.textContent = 'Email or password is incorrect.';
    }
  }
});