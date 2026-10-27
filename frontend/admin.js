import { db, firebaseConfig } from './firebase-config.js';
import { requireAdmin, normalizePhone, phoneToEmail, escapeHtml, logout } from './auth-guard.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection, getDocs, doc, updateDoc, addDoc, setDoc, getDoc, deleteDoc,
  query, where, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

await requireAdmin();

// ---------- Helpers ----------
const DAY = 24 * 60 * 60 * 1000;

// Gives 30 days from today, or 30 days after their current end date if they pay early.
function nextPaidUntil(existing) {
  const current = existing && existing.toDate ? existing.toDate() : null;
  const base = current && current > new Date() ? current : new Date();
  return Timestamp.fromDate(new Date(base.getTime() + 30 * DAY));
}

// A second connection, used only to create member logins without signing you out.
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

// ---------- Pending approvals ----------
async function loadPendingMembers() {
  const pendingList = document.getElementById('pendingList');
  pendingList.innerHTML = 'Loading...';

  const snapshot = await getDocs(query(collection(db, 'members'), where('status', '==', 'Pending Approval')));

  if (snapshot.empty) {
    pendingList.innerHTML = '<p style="font-size:13px; color:#c4b0d3; text-align:left;">No pending members right now.</p>';
    return;
  }

  pendingList.innerHTML = snapshot.docs.map(d => {
    const m = d.data();
    return `
      <div class="member-row">
        <div class="member-info">
          <strong>${escapeHtml(m.name)}</strong><br>
          ${escapeHtml(m.phone)}
        </div>
        <div class="member-actions">
          <button class="approve-btn" data-id="${d.id}">Approve</button>
          <button class="reject-btn" data-id="${d.id}">Reject</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', () => approveMember(btn.dataset.id));
  });
  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', () => rejectMember(btn.dataset.id));
  });
}

async function approveMember(id) {
  const ref = doc(db, 'members', id);
  const snap = await getDoc(ref);
  const m = snap.data();

  await updateDoc(ref, { status: 'Active', paidUntil: nextPaidUntil(m.paidUntil) });

  // The list of birthdays everyone can see (just name and month-day)
  if (m.birthday) {
    await setDoc(doc(db, 'birthdays', id), { name: m.name, md: m.birthday.slice(5) });
  }

  refreshAll();
}

async function rejectMember(id) {
  await updateDoc(doc(db, 'members', id), { status: 'Rejected' });
  refreshAll();
}

// ---------- Announcements ----------
document.getElementById('announcementForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const title = document.getElementById('annTitle').value.trim();
  const message = document.getElementById('annMessage').value.trim();
  if (title === '' || message === '') return;

  try {
    await addDoc(collection(db, 'announcements'), {
      title, message,
      date: new Date().toLocaleDateString(),
      createdAt: serverTimestamp()
    });
    document.getElementById('annTitle').value = '';
    document.getElementById('annMessage').value = '';
    alert('Announcement posted.');
  } catch (err) {
    console.error(err);
    alert('Could not post. Please try again.');
  }
});

// ---------- Sermons ----------
document.getElementById('sermonForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const title = document.getElementById('sermonTitle').value.trim();
  const speaker = document.getElementById('sermonSpeaker').value.trim();
  const notes = document.getElementById('sermonNotes').value.trim();
  if (title === '' || speaker === '' || notes === '') return;

  try {
    await addDoc(collection(db, 'sermons'), {
      title, speaker, notes,
      date: new Date().toLocaleDateString(),
      createdAt: serverTimestamp()
    });
    document.getElementById('sermonTitle').value = '';
    document.getElementById('sermonSpeaker').value = '';
    document.getElementById('sermonNotes').value = '';
    alert('Sermon posted.');
  } catch (err) {
    console.error(err);
    alert('Could not post. Please try again.');
  }
});

// ---------- Devotions ----------
document.getElementById('devotionForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const date = document.getElementById('devDate').value;
  const reference = document.getElementById('devRef').value.trim();
  if (date === '' || reference === '') return;

  try {
    const existing = await getDocs(query(collection(db, 'devotions'), where('date', '==', date)));
    for (const d of existing.docs) {
      await deleteDoc(doc(db, 'devotions', d.id));
    }
    await addDoc(collection(db, 'devotions'), { date, reference });

    document.getElementById('devDate').value = '';
    document.getElementById('devRef').value = '';
    alert('Devotion scheduled.');
  } catch (err) {
    console.error(err);
    alert('Could not save. Please try again.');
  }
});

// ---------- Attendance ----------
let activeMembers = [];
document.getElementById('attendanceDate').valueAsDate = new Date();

async function renderMemberChecklist() {
  const checklist = document.getElementById('memberChecklist');
  checklist.innerHTML = 'Loading...';

  const snapshot = await getDocs(query(collection(db, 'members'), where('status', '==', 'Active')));
  activeMembers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const date = document.getElementById('attendanceDate').value;
  const recordSnap = await getDoc(doc(db, 'attendanceRecords', date));
  const present = recordSnap.exists() && Array.isArray(recordSnap.data().present) ? recordSnap.data().present : [];

  if (activeMembers.length === 0) {
    checklist.innerHTML = '<p>No active members yet.</p>';
    return;
  }

  checklist.innerHTML = activeMembers.map(m => `
    <label style="display:block; margin-top:6px;">
      <input type="checkbox" class="attendCheck" value="${m.id}" ${present.includes(m.id) ? 'checked' : ''}>
      ${escapeHtml(m.name)} (${escapeHtml(m.phone)})
    </label>
  `).join('');
}

document.getElementById('attendanceDate').addEventListener('change', renderMemberChecklist);

document.getElementById('saveAttendanceBtn').addEventListener('click', async function() {
  const date = document.getElementById('attendanceDate').value;
  if (!date) return;

  const checkedIds = Array.from(document.querySelectorAll('.attendCheck:checked')).map(c => c.value);
  const absent = activeMembers
    .filter(m => !checkedIds.includes(m.id))
    .map(m => ({ name: m.name, phone: m.phone }));

  try {
    await setDoc(doc(db, 'attendanceRecords', date), { date, present: checkedIds, absent });
    alert('Attendance saved for ' + date);
  } catch (err) {
    console.error(err);
    alert('Could not save attendance. Please try again.');
  }
});

// ---------- Live links ----------
async function loadLiveLinksForm() {
  const linksSnap = await getDoc(doc(db, 'settings', 'liveLinks'));
  const links = linksSnap.exists() ? linksSnap.data() : {};
  document.getElementById('facebookLink').value = links.facebook || '';
  document.getElementById('zoomLink').value = links.zoom || '';
}

document.getElementById('liveLinksForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const facebook = document.getElementById('facebookLink').value.trim();
  const zoom = document.getElementById('zoomLink').value.trim();

  try {
    await setDoc(doc(db, 'settings', 'liveLinks'), { facebook, zoom });
    alert('Live links updated.');
  } catch (err) {
    console.error(err);
    alert('Could not save. Please try again.');
  }
});

// ---------- Add member manually ----------
document.getElementById('addMemberForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('newName').value.trim();
  const phone = normalizePhone(document.getElementById('newPhone').value);
  const birthday = document.getElementById('newBirthday').value;
  const password = document.getElementById('newPassword').value;

  if (!name || !phone || !birthday || !password) return;
  if (password.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, phoneToEmail(phone), password);

    await setDoc(doc(db, 'members', cred.user.uid), {
      name, phone, birthday,
      status: 'Active',
      paidUntil: nextPaidUntil(null),
      createdAt: serverTimestamp()
    });
    await setDoc(doc(db, 'birthdays', cred.user.uid), { name, md: birthday.slice(5) });
    await signOut(secondaryAuth);

    document.getElementById('addMemberForm').reset();
    alert('Member added.');
    refreshAll();
  } catch (err) {
    console.error(err);
    if (err.code === 'auth/email-already-in-use') {
      alert('That phone number already has an account.');
    } else {
      alert('Could not add the member. Please try again.');
    }
  }
});

// ---------- All members ----------
async function renderAllMembers() {
  const list = document.getElementById('allMembersList');
  list.innerHTML = 'Loading...';

  const snapshot = await getDocs(collection(db, 'members'));

  if (snapshot.empty) {
    list.innerHTML = '<p style="font-size:13px; color:#c4b0d3; text-align:left;">No members yet.</p>';
    return;
  }

  list.innerHTML = snapshot.docs.map(d => {
    const m = d.data();
    const until = m.paidUntil && m.paidUntil.toDate ? ' • paid until ' + m.paidUntil.toDate().toLocaleDateString() : '';
    return `
      <div class="member-row">
        <div class="member-info">
          <strong>${escapeHtml(m.name)}</strong> (${escapeHtml(m.status)})<br>
          ${escapeHtml(m.phone)}${escapeHtml(until)}
        </div>
        <div class="member-actions">
          <button class="reject-btn remove-member-btn" data-id="${d.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.remove-member-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this member completely?')) return;
      await deleteDoc(doc(db, 'members', btn.dataset.id));
      await deleteDoc(doc(db, 'birthdays', btn.dataset.id));
      refreshAll();
    });
  });
}

// ---------- Log out ----------
const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    logout('adminLogin.html');
  });
}

function refreshAll() {
  loadPendingMembers();
  renderAllMembers();
  renderMemberChecklist();
}

loadLiveLinksForm();
refreshAll();