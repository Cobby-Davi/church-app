// Require login
const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]; // e.g. "2026-09-27"
}

async function loadTodayDevotion() {
  const devotions = JSON.parse(localStorage.getItem('devotions')) || [];
  const today = getTodayString();
  const display = document.getElementById('devotionDisplay');

  const todayDevotion = devotions.find(d => d.date === today);

  if (!todayDevotion) {
    display.textContent = 'No devotion has been scheduled for today.';
    return;
  }

  display.textContent = 'Loading...';

  try {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(todayDevotion.reference)}`);
    const data = await response.json();

    if (data.error) {
      display.textContent = 'Could not load today\'s verse.';
      return;
    }

    display.innerHTML = `<span class="ref">${data.reference}</span>${data.text}`;
  } catch (err) {
    display.textContent = 'Error loading devotion. Check your internet connection.';
  }
}

loadTodayDevotion();