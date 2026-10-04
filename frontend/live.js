import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const currentMember = JSON.parse(localStorage.getItem('currentMember'));
if (!currentMember || currentMember.status !== 'Active') {
  window.location.href = 'login.html';
}

async function loadLiveLinks() {
  const container = document.getElementById('liveLinks');
  container.innerHTML = 'Loading...';

  const linksRef = doc(db, "settings", "liveLinks");
  const linksSnap = await getDoc(linksRef);
  const links = linksSnap.exists() ? linksSnap.data() : {};

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
}

loadLiveLinks();