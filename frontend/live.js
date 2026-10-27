import { requireActiveMember } from './auth-guard.js';
import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

await requireActiveMember();

// Only allow normal web links
function safeUrl(url) {
  try {
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : null;
  } catch (e) {
    return null;
  }
}

async function loadLiveLinks() {
  const container = document.getElementById('liveLinks');
  container.innerHTML = 'Loading...';

  try {
    const linksSnap = await getDoc(doc(db, 'settings', 'liveLinks'));
    const links = linksSnap.exists() ? linksSnap.data() : {};

    const facebook = safeUrl(links.facebook);
    const zoom = safeUrl(links.zoom);

    let html = '';
    if (facebook) {
      html += `<a class="live-btn facebook-btn" href="${facebook}" target="_blank" rel="noopener noreferrer">📘 Join on Facebook Live</a>`;
    }
    if (zoom) {
      html += `<a class="live-btn zoom-btn" href="${zoom}" target="_blank" rel="noopener noreferrer">💻 Join on Zoom</a>`;
    }
    if (!facebook && !zoom) {
      html = '<p style="font-size:13px; color:#c4b0d3; text-align:center;">No live links have been set yet.</p>';
    }

    container.innerHTML = html;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="font-size:13px; color:#ff8f84;">Error loading live links.</p>';
  }
}

loadLiveLinks();