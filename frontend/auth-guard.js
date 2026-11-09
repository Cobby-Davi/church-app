import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your admin account's ID. It is not a secret, because the database rules do the real checking.
export const ADMIN_UID = 'UIOsVOeZdISex6iV1PwNolmTut73';

// Cleans up a phone number so +233 55 399 2237 and 0553992237 count as the same person.
export function normalizePhone(input) {
  let digits = String(input).replace(/\D/g, '');
  if (digits.startsWith('233') && digits.length === 12) {
    digits = '0' + digits.slice(3);
  }
  return digits;
}

// Firebase signs people in with an email, so each phone number becomes a hidden email.
// Nothing is ever sent to it, and members never see it.
export function phoneToEmail(input) {
  return normalizePhone(input) + '@members.ihil.church';
}

// Makes text safe to show on a page, so nobody can sneak in harmful code.
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function waitForUser() {
  return new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (user) => {
      stop();
      resolve(user);
    });
  });
}

// Never finishes. Used after a redirect so the rest of the page stops running.
const stopHere = () => new Promise(() => {});

// For pages where the member only needs to be logged in.
export async function requireSignedIn() {
  const user = await waitForUser();
  if (!user) {
    window.location.href = 'login.html';
    return stopHere();
  }
  return user;
}

// For the member pages. Returns the member's details if they are logged in
// and their account is active. Otherwise it sends them to the login page.
export async function requireActiveMember() {
  const user = await waitForUser();
  if (!user) {
    window.location.href = 'login.html';
    return stopHere();
  }

  let snap;
  try {
    snap = await getDoc(doc(db, 'members', user.uid));
  } catch (err) {
    // No internet: let them through so the downloaded Bible still opens.
    if (!navigator.onLine) {
      return { id: user.uid, offline: true };
    }
    throw err;
  }

  if (snap.exists() && snap.data().status === 'Active') {
    return { id: user.uid, ...snap.data() };
  }

  await signOut(auth);
  window.location.href = 'login.html';
  return stopHere();
}

// For the admin dashboard.
export async function requireAdmin() {
  const user = await waitForUser();
  if (!user || user.uid !== ADMIN_UID) {
    window.location.href = 'adminLogin.html';
    return stopHere();
  }
  return user;
}

export async function logout(redirectTo = 'login.html') {
  await signOut(auth);
  window.location.href = redirectTo;
}