import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

async function loadAbsentees() {
  const list = document.getElementById('absenteeList');
  list.innerHTML = 'Loading...';

  const recordsSnap = await getDocs(collection(db, "attendanceRecords"));
  if (recordsSnap.empty) {
    list.innerHTML = '<p style="font-size:13px; color:#666;">No attendance has been recorded yet.</p>';
    return;
  }

  // Find the most recent record by comparing date strings
  let latest = null;
  recordsSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (!latest || data.date > latest.date) latest = data;
  });

  const membersSnap = await getDocs(collection(db, "members"));
  const activeMembers = [];
  membersSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status === 'Active') activeMembers.push(data);
  });

  const absentees = activeMembers.filter(m => !latest.present.includes(m.phone));

  if (absentees.length === 0) {
    list.innerHTML = `<p style="font-size:13px;">Everyone attended on ${latest.date}! 🎉</p>`;
  } else {
    list.innerHTML = `<p style="font-size:13px; color:#666;">Service date: ${latest.date}</p>` +
      absentees.map(m => `
        <div class="absentee-row">
          <strong>${m.name}</strong><br>
          📞 ${m.phone}
        </div>
      `).join('');
  }
}

loadAbsentees();