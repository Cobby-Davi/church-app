import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { normalizePhone, phoneToEmail } from './auth-guard.js';

document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = normalizePhone(document.getElementById('phone').value);
  const password = document.getElementById('password').value;
  const birthday = document.getElementById('birthday').value;

  const statusMessage = document.getElementById('statusMessage');

  if (name === '' || phone === '' || password === '' || birthday === '') {
    statusMessage.textContent = 'Please fill in all fields.';
    return;
  }

  if (phone.length < 9) {
    statusMessage.textContent = 'Please enter a valid phone number.';
    return;
  }

  if (password.length < 6) {
    statusMessage.textContent = 'Password must be at least 6 characters.';
    return;
  }

  statusMessage.textContent = 'Registering...';

  try {
    const cred = await createUserWithEmailAndPassword(auth, phoneToEmail(phone), password);

    // The password is never saved in the database. Firebase keeps it safely.
    await setDoc(doc(db, 'members', cred.user.uid), {
      name: name,
      phone: phone,
      birthday: birthday,
      status: 'Unpaid',
      createdAt: serverTimestamp()
    });

    window.location.href = 'payment.html';
  } catch (err) {
    console.error(err);
    if (err.code === 'auth/email-already-in-use') {
      statusMessage.textContent = 'This phone number is already registered. Please log in.';
    } else if (err.code === 'auth/weak-password') {
      statusMessage.textContent = 'Please choose a stronger password (at least 6 characters).';
    } else {
      statusMessage.textContent = 'Something went wrong. Please try again.';
    }
  }
});