import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const statusMessage = document.getElementById('statusMessage');

  statusMessage.textContent = 'Checking...';

  try {
    const q = query(collection(db, "members"), where("phone", "==", phone));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      statusMessage.textContent = 'No account found with that phone number.';
      return;
    }

    const memberDoc = snapshot.docs[0];
    const member = { id: memberDoc.id, ...memberDoc.data() };

    if (member.password !== password) {
      statusMessage.textContent = 'Incorrect password.';
      return;
    }

    localStorage.setItem('currentMember', JSON.stringify(member));

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
  } catch (err) {
    console.error(err);
    statusMessage.textContent = 'Something went wrong. Please try again.';
  }
});