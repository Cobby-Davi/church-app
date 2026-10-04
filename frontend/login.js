import { db } from './firebase-config.js';
import { collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    let member = { id: memberDoc.id, ...memberDoc.data() };

    if (member.password !== password) {
      statusMessage.textContent = 'Incorrect password.';
      return;
    }

    // Check if 30 days have passed since last payment
    if (member.status === 'Active' && member.lastPaymentDate) {
      const daysSincePayment = (Date.now() - new Date(member.lastPaymentDate)) / (1000 * 60 * 60 * 24);
      if (daysSincePayment > 30) {
        await updateDoc(doc(db, "members", member.id), { status: 'Unpaid' });
        member.status = 'Unpaid';
      }
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