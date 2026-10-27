import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { phoneToEmail } from './auth-guard.js';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const statusMessage = document.getElementById('statusMessage');

  statusMessage.textContent = 'Checking...';

  try {
    const cred = await signInWithEmailAndPassword(auth, phoneToEmail(phone), password);
    const snap = await getDoc(doc(db, 'members', cred.user.uid));

    if (!snap.exists()) {
      await signOut(auth);
      statusMessage.textContent = 'Account not found. Please register first.';
      return;
    }

    const member = snap.data();

    switch (member.status) {
      case 'Active':
        // The Home page checks that the paid month has not ended
        window.location.href = 'home.html';
        break;
      case 'Unpaid':
        window.location.href = 'payment.html';
        break;
      case 'Pending Approval':
        window.location.href = 'pending.html';
        break;
      case 'Rejected':
        await signOut(auth);
        statusMessage.textContent = 'Your registration was not approved. Please contact the church.';
        break;
      default:
        await signOut(auth);
        statusMessage.textContent = 'Account status unknown. Please contact the church.';
    }
  } catch (err) {
    console.error(err);
    if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password', 'auth/invalid-email'].includes(err.code)) {
      statusMessage.textContent = 'Phone number or password is incorrect.';
    } else if (err.code === 'auth/too-many-requests') {
      statusMessage.textContent = 'Too many attempts. Please wait a few minutes and try again.';
    } else {
      statusMessage.textContent = 'Something went wrong. Please try again.';
    }
  }
});