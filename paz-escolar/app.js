/* ─────────────────────────────────────────────────────────────
   PAZ ESCOLAR – app.js
   ───────────────────────────────────────────────────────────── */

'use strict';

// ══════════════════════════════════════════════════════
//  TAB NAVIGATION
// ══════════════════════════════════════════════════════

function switchTab(tabId, btn) {
  // hide all tabs
  document.querySelectorAll('.tab-content').forEach(function (el) {
    el.classList.remove('active');
  });
  // deactivate all nav buttons
  document.querySelectorAll('.nav-btn').forEach(function (el) {
    el.classList.remove('active');
  });
  // activate selected tab
  document.getElementById('tab-' + tabId).classList.add('active');
  btn.classList.add('active');

  // stop breathing exercise when leaving alerta tab
  if (tabId !== 'alerta') {
    stopBreathing();
  }
}

// ══════════════════════════════════════════════════════
//  BREATHING EXERCISE (4-7-8)
// ══════════════════════════════════════════════════════

var breathingTimer = null;
var breathingActive = false;

function startBreathing() {
  if (breathingActive) {
    stopBreathing();
    return;
  }
  breathingActive = true;
  runBreathingCycle();
}

function runBreathingCycle() {
  if (!breathingActive) return;

  var circle = document.getElementById('breathing-circle');
  var label  = document.getElementById('breathing-label');
  var text   = document.getElementById('breathing-text');

  // Phase 1 – Inhala (4 s)
  label.textContent = 'Inhala… 🌬️';
  text.textContent  = '4';
  circle.className  = 'breathing-circle expand';

  var count = 4;
  var ticker = setInterval(function () {
    count--;
    if (count > 0) {
      text.textContent = String(count);
    } else {
      clearInterval(ticker);

      // Phase 2 – Retén (7 s)
      label.textContent = 'Retén… ⏸️';
      text.textContent  = '7';
      circle.className  = 'breathing-circle hold';
      count = 7;
      ticker = setInterval(function () {
        count--;
        if (count > 0) {
          text.textContent = String(count);
        } else {
          clearInterval(ticker);

          // Phase 3 – Exhala (8 s)
          label.textContent = 'Exhala… 💨';
          text.textContent  = '8';
          circle.className  = 'breathing-circle shrink';
          count = 8;
          ticker = setInterval(function () {
            count--;
            if (count > 0) {
              text.textContent = String(count);
            } else {
              clearInterval(ticker);
              if (breathingActive) {
                runBreathingCycle(); // repeat
              }
            }
          }, 1000);
        }
      }, 1000);
    }
  }, 1000);

  breathingTimer = ticker;
}

function stopBreathing() {
  breathingActive = false;
  if (breathingTimer) { clearInterval(breathingTimer); breathingTimer = null; }

  var circle = document.getElementById('breathing-circle');
  var label  = document.getElementById('breathing-label');
  var text   = document.getElementById('breathing-text');
  if (!circle) return;

  circle.className  = 'breathing-circle';
  label.textContent = 'Presiona para comenzar';
  text.textContent  = '▶';
}

// ══════════════════════════════════════════════════════
//  BUBBLE POP GAME
// ══════════════════════════════════════════════════════

var BUBBLE_COUNT = 18;

function createBubbles() {
  var grid = document.getElementById('bubble-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (var i = 0; i < BUBBLE_COUNT; i++) {
    (function () {
      var btn = document.createElement('button');
      btn.className = 'bubble';
      btn.setAttribute('aria-label', 'Burbuja');
      btn.addEventListener('click', function () {
        if (!this.classList.contains('popped')) {
          this.classList.add('popped');
          this.textContent = '💥';
        }
      });
      grid.appendChild(btn);
    })();
  }
}

function resetBubbles() {
  createBubbles();
}

// ══════════════════════════════════════════════════════
//  COUNTDOWN TIMER
// ══════════════════════════════════════════════════════

var countdownValue    = 60;
var countdownInterval = null;

function startCountdown() {
  if (countdownInterval) return;           // already running
  if (countdownValue <= 0) resetCountdown();

  countdownInterval = setInterval(function () {
    countdownValue--;
    var el = document.getElementById('countdown-display');
    if (el) el.textContent = countdownValue;
    if (countdownValue <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      if (el) el.textContent = '🕊️';
    }
  }, 1000);
}

function resetCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = null;
  countdownValue = 60;
  var el = document.getElementById('countdown-display');
  if (el) el.textContent = '60';
}

// ══════════════════════════════════════════════════════
//  ACCORDION (Ayuda tab)
// ══════════════════════════════════════════════════════

function toggleAccordion(header) {
  var body = header.nextElementSibling;
  var isOpen = header.classList.contains('open');

  // close all
  document.querySelectorAll('.accordion__header').forEach(function (h) {
    h.classList.remove('open');
    h.nextElementSibling.classList.remove('open');
  });

  // open clicked if it was closed
  if (!isOpen) {
    header.classList.add('open');
    body.classList.add('open');
  }
}

// ══════════════════════════════════════════════════════
//  CONTACTS – localStorage persistence
// ══════════════════════════════════════════════════════

var STORAGE_KEY = 'pazEscolar_contacts';

function loadContacts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveContacts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderContacts() {
  var list = loadContacts();
  var container = document.getElementById('contact-list');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<p class="no-contacts">No hay contactos registrados todavía.</p>';
    return;
  }

  container.innerHTML = list.map(function (c, i) {
    var initial = c.name ? c.name.charAt(0).toUpperCase() : '?';
    return (
      '<div class="contact-item">' +
        '<div class="contact-avatar">' + initial + '</div>' +
        '<div class="contact-info">' +
          '<strong>' + escapeHtml(c.name) + '</strong>' +
          '<span>+' + escapeHtml(c.phone) + '</span>' +
        '</div>' +
        '<button class="contact-delete" onclick="deleteContact(' + i + ')" aria-label="Eliminar">🗑️</button>' +
      '</div>'
    );
  }).join('');
}

function addContact(event) {
  event.preventDefault();
  var nameInput  = document.getElementById('contact-name');
  var phoneInput = document.getElementById('contact-phone');

  var name  = nameInput.value.trim();
  var phone = phoneInput.value.trim().replace(/\D/g, ''); // digits only

  if (!name || !phone) return;

  var list = loadContacts();
  list.push({ name: name, phone: phone });
  saveContacts(list);
  renderContacts();

  nameInput.value  = '';
  phoneInput.value = '';
  nameInput.focus();
}

function deleteContact(index) {
  var list = loadContacts();
  list.splice(index, 1);
  saveContacts(list);
  renderContacts();
}

// ══════════════════════════════════════════════════════
//  HELPPI ALERT – WhatsApp links
// ══════════════════════════════════════════════════════

function sendHelppiAlert() {
  var list = loadContacts();

  if (list.length === 0) {
    alert('⚠️ No tienes contactos registrados.\nPor favor agrega al menos un contacto de confianza para enviar la alerta.');
    return;
  }

  var message = encodeURIComponent(
    '🆘 HELPPI – Paz Escolar\n\n' +
    '¡Necesito ayuda urgente! ' +
    'Estoy en peligro o en una situación de bullying en la escuela. ' +
    'Por favor contáctame lo antes posible. 🙏'
  );

  // Open a WhatsApp link for each contact sequentially
  list.forEach(function (contact, i) {
    // Use a small delay between windows so browsers don't block popups
    setTimeout(function () {
      var url = 'https://wa.me/' + contact.phone + '?text=' + message;
      window.open(url, '_blank', 'noopener');
    }, i * 600);
  });

  // Show confirmation
  var confirmation = document.getElementById('helppi-confirmation');
  if (confirmation) {
    confirmation.classList.remove('hidden');
    setTimeout(function () {
      confirmation.classList.add('hidden');
    }, 5000);
  }

  // Pulse animation on button
  var btn = document.getElementById('helppi-btn');
  if (btn) {
    btn.style.boxShadow = '0 0 0 0 rgba(239,68,68,.7)';
    btn.style.animation = 'none';
    btn.style.animation = 'helppiPulse 0.6s ease-out';
    setTimeout(function () { btn.style.animation = ''; }, 700);
  }
}

// ══════════════════════════════════════════════════════
//  UTILITY
// ══════════════════════════════════════════════════════

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
  createBubbles();
  renderContacts();
});
