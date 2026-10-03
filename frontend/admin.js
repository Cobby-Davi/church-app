import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Admin login check
if (sessionStorage.getItem('isAdmin') !== 'true') {
  window.location.href = 'adminLogin.html';
}

async function loadPendingMembers() {
  const pendingList = document.getElementById('pendingList');
  pendingList.innerHTML = 'Loading...';

  const snapshot = await getDocs(collection(db, "members"));
  const pendingMembers = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status === 'Pending Approval') {
      pendingMembers.push({ id: docSnap.id, ...data });
    }
  });

  if (pendingMembers.length === 0) {
    pendingList.innerHTML = '<p style="font-size:13px; color:#666;">No pending members right now.</p>';
    return;
  }

  pendingList.innerHTML = '';
  pendingMembers.forEach(member => {
    const row = document.createElement('div');
    row.className = 'member-row';

    row.innerHTML = `
      <div class="member-info">
        <strong>${member.name}</strong><br>
        ${member.phone}
      </div>
      <div class="member-actions">
        <button class="approve-btn" data-id="${member.id}">Approve</button>
        <button class="reject-btn" data-id="${member.id}">Reject</button>
      </div>
    `;

    pendingList.appendChild(row);
  });

  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'Active'));
  });

  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'Rejected'));
  });
}

async function updateStatus(id, newStatus) {
  const memberRef = doc(db, "members", id);
  await updateDoc(memberRef, { status: newStatus });
  loadPendingMembers();
}

loadPendingMembers();