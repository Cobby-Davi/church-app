import { db } from './firebase-config.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById('paidButton').addEventListener('click', async function() {
  let currentMember = JSON.parse(localStorage.getItem('currentMember'));

  if (!currentMember || !currentMember.id) {
    document.getElementById('statusMessage').textContent = 'No registration found. Please register again.';
    return;
  }

  try {
    const memberRef = doc(db, "members", currentMember.id);
    await updateDoc(memberRef, { status: "Pending Approval" });

    currentMember.status = "Pending Approval";
    localStorage.setItem('currentMember', JSON.stringify(currentMember));

    window.location.href = 'pending.html';
  } catch (err) {
    console.error(err);
    document.getElementById('statusMessage').textContent = 'Something went wrong. Please try again.';
  }
});