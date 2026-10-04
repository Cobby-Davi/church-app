import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, query, where, deleteDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
document.getElementById('announcementForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const title = document.getElementById('annTitle').value.trim();
  const message = document.getElementById('annMessage').value.trim();

  if (title === '' || message === '') return;

  await addDoc(collection(db, "announcements"), {
    title: title,
    message: message,
    date: new Date().toLocaleDateString(),
    createdAt: serverTimestamp()
  });

  document.getElementById('annTitle').value = '';
  document.getElementById('annMessage').value = '';
});
document.getElementById('sermonForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const title = document.getElementById('sermonTitle').value.trim();
  const speaker = document.getElementById('sermonSpeaker').value.trim();
  const notes = document.getElementById('sermonNotes').value.trim();

  if (title === '' || speaker === '' || notes === '') return;

  await addDoc(collection(db, "sermons"), {
    title: title,
    speaker: speaker,
    notes: notes,
    date: new Date().toLocaleDateString(),
    createdAt: serverTimestamp()
  });

  document.getElementById('sermonTitle').value = '';
  document.getElementById('sermonSpeaker').value = '';
  document.getElementById('sermonNotes').value = '';
});
document.getElementById('devotionForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const date = document.getElementById('devDate').value;
  const reference = document.getElementById('devRef').value.trim();

  if (date === '' || reference === '') return;

  // Remove any existing devotion for that date first
  const q = query(collection(db, "devotions"), where("date", "==", date));
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, "devotions", docSnap.id));
  }

  await addDoc(collection(db, "devotions"), { date, reference });

  document.getElementById('devDate').value = '';
  document.getElementById('devRef').value = '';
});
document.getElementById('attendanceDate').valueAsDate = new Date();

async function getActiveMembers() {
  const snapshot = await getDocs(collection(db, "members"));
  const active = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status === 'Active') {
      active.push({ id: docSnap.id, ...data });
    }
  });
  return active;
}

async function renderMemberChecklist() {
  const checklist = document.getElementById('memberChecklist');
  checklist.innerHTML = 'Loading...';

  const active = await getActiveMembers();
  const date = document.getElementById('attendanceDate').value;

  const recordRef = doc(db, "attendanceRecords", date);
  const recordSnap = await getDoc(recordRef);
  const presentPhones = recordSnap.exists() ? recordSnap.data().present : [];

  if (active.length === 0) {
    checklist.innerHTML = '<p>No active members yet.</p>';
    return;
  }

  checklist.innerHTML = active.map(m => `
    <label style="display:block; margin-top:4px;">
      <input type="checkbox" class="attendCheck" value="${m.phone}" ${presentPhones.includes(m.phone) ? 'checked' : ''}>
      ${m.name} (${m.phone})
    </label>
  `).join('');
}

document.getElementById('attendanceDate').addEventListener('change', renderMemberChecklist);
renderMemberChecklist();

document.getElementById('saveAttendanceBtn').addEventListener('click', async function() {
  const date = document.getElementById('attendanceDate').value;
  const checked = Array.from(document.querySelectorAll('.attendCheck:checked')).map(c => c.value);

  await setDoc(doc(db, "attendanceRecords", date), { date, present: checked });

  alert('Attendance saved for ' + date);
});