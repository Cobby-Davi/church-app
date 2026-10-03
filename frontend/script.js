import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;

  const statusMessage = document.getElementById('statusMessage');

  if (name === '' || phone === '' || password === '') {
    statusMessage.textContent = 'Please fill in all fields.';
    return;
  }

  if (password.length < 4) {
    statusMessage.textContent = 'Password must be at least 4 characters.';
    return;
  }

  statusMessage.textContent = 'Registering...';

  try {
    const docRef = await addDoc(collection(db, "members"), {
      name: name,
      phone: phone,
      password: password, // NOTE: plain text for now, will secure properly later
      status: "Unpaid",
      createdAt: new Date().toISOString()
    });

    // Remember who just registered, for the next pages
    localStorage.setItem('currentMember', JSON.stringify({
      id: docRef.id,
      name, phone, password, status: "Unpaid"
    }));

    window.location.href = 'payment.html';
  } catch (err) {
    console.error(err);
    statusMessage.textContent = 'Something went wrong. Please try again.';
  }
});