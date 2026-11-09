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

  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, phoneToEmail(phone), password);
  } catch (err) {
    console.error(err);
    if (err.code === 'auth/email-already-in-use') {
      statusMessage.textContent = 'This phone number is already registered. Please log in.';
    } else if (err.code === 'auth/weak-password') {
      statusMessage.textContent = 'Please choose a stronger password (at least 6 characters).';
    } else {
      statusMessage.textContent = 'Something went wrong. Please try again.';
    }
    return;
  }

  try {
    await setDoc(doc(db, 'members', cred.user.uid), {
      name: name,
      phone: phone,
      birthday: birthday,
      status: 'Active',
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error(err);
    // Undo the login so they can try again cleanly
    await cred.user.delete().catch(() => {});
    statusMessage.textContent = 'Something went wrong. Please try again.';
    return;
  }

  // The birthday list everyone can see (name and month-day only)
  try {
    await setDoc(doc(db, 'birthdays', cred.user.uid), { name: name, md: birthday.slice(5) });
  } catch (err) {
    console.error(err);
  }

  window.location.href = 'home.html';
});