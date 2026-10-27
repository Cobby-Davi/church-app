import { db } from './firebase-config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { requireSignedIn } from './auth-guard.js';

const statusMessage = document.getElementById('statusMessage');
const user = await requireSignedIn();
const memberRef = doc(db, 'members', user.uid);

try {
  const snap = await getDoc(memberRef);
  if (snap.exists()) {
    const data = snap.data();
    const paidUntil = data.paidUntil && data.paidUntil.toDate ? data.paidUntil.toDate() : null;

    if (data.status === 'Pending Approval') {
      window.location.href = 'pending.html';
    } else if (data.status === 'Active' && paidUntil && paidUntil > new Date()) {
      window.location.href = 'home.html';
    }
  }
} catch (err) {
  console.error(err);
}

document.getElementById('paidButton').addEventListener('click', async function() {
  statusMessage.textContent = 'Saving...';
  try {
    await updateDoc(memberRef, { status: 'Pending Approval' });
    window.location.href = 'pending.html';
  } catch (err) {
    console.error(err);
    statusMessage.textContent = 'Something went wrong. Please try again.';
  }
});