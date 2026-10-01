const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
const members = JSON.parse(localStorage.getItem('members')) || [];
const list = document.getElementById('absenteeList');

if (records.length === 0) {
  list.innerHTML = '<p style="font-size:13px; color:#666;">No attendance has been recorded yet.</p>';
} else {
  // Use the most recent service date
  const latest = records.reduce((a, b) => (a.date > b.date ? a : b));
  const absentees = members.filter(m => m.status === 'Active' && !latest.present.includes(m.phone));

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