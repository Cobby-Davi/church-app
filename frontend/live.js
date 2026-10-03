const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

const links = JSON.parse(localStorage.getItem('liveLinks')) || {};
const container = document.getElementById('liveLinks');

let html = '';
if (links.facebook) {
  html += `<a class="live-btn facebook-btn" href="${links.facebook}" target="_blank">📘 Join on Facebook Live</a>`;
}
if (links.zoom) {
  html += `<a class="live-btn zoom-btn" href="${links.zoom}" target="_blank">💻 Join on Zoom</a>`;
}
if (!links.facebook && !links.zoom) {
  html = '<p style="font-size:13px; color:#666; text-align:center;">No live links have been set yet.</p>';
}

container.innerHTML = html;