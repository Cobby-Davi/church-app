import { app, db } from './firebase-config.js';
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const VAPID_KEY = "BAYWhGr0KcF1wrnVjaLOQunqJyIdlzpp9e78UQf5kngumZ4g2Yat1UC8CbVc4y3BTHuItNXcTG_BeFuH07D-nWs";

export async function enableNotifications(memberId) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    throw new Error('This browser does not support notifications.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission was not granted.');
  }

  await navigator.serviceWorker.register('firebase-messaging-sw.js');
  const registration = await navigator.serviceWorker.ready;

  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration
  });

  await updateDoc(doc(db, 'members', memberId), { fcmToken: token });
  return token;
}

export function listenForMessages() {
  const messaging = getMessaging(app);
  onMessage(messaging, async (payload) => {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(
      (payload.notification && payload.notification.title) || 'Notification',
      { body: (payload.notification && payload.notification.body) || '' }
    );
  });
}