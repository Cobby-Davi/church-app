// The number members contact. WhatsApp needs it in international format, with no + or spaces.
const ADMIN_WHATSAPP = '233553992237';
const ADMIN_DISPLAY = '0553992237';

const callLink = document.getElementById('callLink');
callLink.textContent = ADMIN_DISPLAY;
callLink.href = 'tel:+' + ADMIN_WHATSAPP;

document.getElementById('forgotForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if (!name || !phone) return;

  const text = 'Hello, I forgot my password for the IHIL Church app.\nName: ' + name + '\nPhone: ' + phone;
  window.location.href = 'https://wa.me/' + ADMIN_WHATSAPP + '?text=' + encodeURIComponent(text);
});