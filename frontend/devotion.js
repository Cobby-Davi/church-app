import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

async function loadTodayDevotion() {
  const display = document.getElementById('devotionDisplay');
  const today = getTodayString();

  try {
    const q = query(collection(db, "devotions"), where("date", "==", today));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      display.textContent = 'No devotion has been scheduled for today.';
      return;
    }

    const todayDevotion = snapshot.docs[0].data();
    display.textContent = 'Loading verse...';

    const response = await fetch(`https://bible-api.com/${encodeURIComponent(todayDevotion.reference)}`);
    const data = await response.json();

    if (data.error) {
      display.textContent = "Could not load today's verse.";
      return;
    }

    display.innerHTML = `<span class="ref">${data.reference}</span>${data.text}`;
  } catch (err) {
    console.error(err);
    display.textContent = 'Error loading devotion.';
  }
}

loadTodayDevotion();