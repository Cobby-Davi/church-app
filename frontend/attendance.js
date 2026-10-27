import { requireActiveMember, escapeHtml } from './auth-guard.js';
import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, limit, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

await requireActiveMember();

async function loadAbsentees() {
  const list = document.getElementById('absenteeList');
  list.innerHTML = 'Loading...';

  try {
    const q = query(collection(db, 'attendanceRecords'), orderBy('date', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      list.innerHTML = '<p style="font-size:13px; color:#c4b0d3;">No attendance has been recorded yet.</p>';
      return;
    }

    const latest = snapshot.docs[0].data();
    const absent = Array.isArray(latest.absent) ? latest.absent : [];

    if (absent.length === 0) {
      list.innerHTML = `<p style="font-size:14px;">Everyone attended on ${escapeHtml(latest.date)}! 🎉</p>`;
      return;
    }

    list.innerHTML = `<p style="font-size:13px; color:#c4b0d3;">Service date: ${escapeHtml(latest.date)}</p>` +
      absent.map(m => `
        <div class="absentee-row">
          <strong>${escapeHtml(m.name)}</strong><br>
          <a href="tel:${escapeHtml(m.phone)}">📞 ${escapeHtml(m.phone)}</a>
        </div>
      `).join('');
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p style="font-size:13px; color:#ff8f84;">Error loading attendance.</p>';
  }
}

loadAbsentees();