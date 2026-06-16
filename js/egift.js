/* Moon's Coffee — eGift creation & sending */
(function () {
  'use strict';

  var MAX_RECIPIENTS = 10;

  var LOGO_SVG = '<svg class="gc-card-logo" viewBox="0 0 62 62" aria-hidden="true"><circle cx="31" cy="31" r="31" fill="rgba(255,255,255,0.25)"/><circle cx="31" cy="31" r="27" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/><ellipse cx="31" cy="28" rx="10" ry="11" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.2"/><path d="M27 31 Q31 34 35 31" stroke="rgba(255,255,255,0.8)" stroke-width="1" fill="none" stroke-linecap="round"/></svg>';

  /* ── Helpers ── */
  function fmt(n) { return '$' + Number(n).toFixed(2); }

  function getParams() {
    var q = new URLSearchParams(window.location.search);
    return { id: q.get('id') };
  }

  function findCard(id) {
    var cards = window.MOON_GIFT_CARDS || [];
    return cards.find(function (c) { return c.id === id; }) || cards[0];
  }

  /* ── Build recipient email HTML ── */
  function buildGiftEmail(card, amount, sender, note, recipientName) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background:#EDE8D0;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="background:#EDE8D0;padding:32px 16px;">' +
        '<tr><td align="center">' +
          '<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:520px;">' +

            '<tr><td style="background:#4F4D46;padding:28px 32px;text-align:center;">' +
              '<h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Moon\'s Coffee</h1>' +
              '<p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:13px;">eGift Card</p>' +
            '</td></tr>' +

            '<tr><td style="padding:32px;">' +
              '<p style="font-size:18px;color:#4F4D46;margin:0 0 8px;font-weight:600;">Hi ' + recipientName + '!</p>' +
              '<p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.5;"><strong>' + sender + '</strong> sent you a Moon\'s Coffee gift card!</p>' +

              '<div style="background:' + card.bg + ';border-radius:12px;padding:40px 24px;text-align:center;margin-bottom:24px;">' +
                '<div style="font-size:64px;line-height:1;margin-bottom:12px;">' + card.emoji + '</div>' +
                '<div style="font-size:36px;font-weight:700;color:' + card.text + ';letter-spacing:-.01em;">' + fmt(amount) + '</div>' +
                '<div style="font-size:14px;color:' + card.text + ';opacity:.8;margin-top:4px;">' + card.name + '</div>' +
              '</div>' +

              (note ? '<div style="background:#F5F2E8;border-left:3px solid #4F4D46;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">' +
                '<p style="font-size:13px;color:#888;margin:0 0 4px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;">Personal note</p>' +
                '<p style="font-size:15px;color:#4F4D46;margin:0;font-style:italic;">"' + note + '"</p>' +
              '</div>' : '') +

              '<div style="text-align:center;margin-bottom:24px;">' +
                '<a href="http://localhost:3000/starbucks_homepage.html" style="display:inline-block;background:#4F4D46;color:#fff;border-radius:50px;padding:14px 32px;font-size:15px;font-weight:700;text-decoration:none;">Redeem your gift card</a>' +
              '</div>' +

              '<p style="font-size:12px;color:#999;text-align:center;margin:0;line-height:1.5;">This gift card can be used at any participating Moon\'s Coffee location.<br>Gift cards do not expire and have no fees.</p>' +
            '</td></tr>' +

            '<tr><td style="background:#4F4D46;padding:16px;text-align:center;">' +
              '<p style="color:rgba(255,255,255,.5);margin:0;font-size:11px;">Moon\'s Coffee · eGift Card</p>' +
            '</td></tr>' +

          '</table>' +
        '</td></tr>' +
      '</table>' +
    '</body></html>';
  }

  /* ── Send one email via proxy ── */
  function sendEmail(to, subject, html) {
    return fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientOverride: to, subject: subject, html: html }),
    }).then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok) throw new Error(body.error || body.message || 'Error ' + res.status);
        return body;
      });
    });
  }

  /* ── Render form ── */
  function renderForm(card) {
    var root = document.getElementById('egift-root');

    root.innerHTML =
      '<div class="egift-inner">' +
        '<nav class="egift-breadcrumb">' +
          '<a href="starbucks_giftcards.html">Gift</a>' +
          '<span>/</span>' +
          '<span>Create eGift</span>' +
        '</nav>' +

        '<h1 class="egift-title">Create eGift</h1>' +

        '<div class="egift-card-preview" style="background:' + card.bg + ';color:' + card.text + ';">' +
          (card.img
            ? '<img src="' + card.img + '" alt="' + card.name + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">'
            : '<span style="font-size:80px;">' + card.emoji + '</span>') +
          LOGO_SVG +
        '</div>' +

        '<p class="egift-required">* indicates required field</p>' +

        '<form id="egift-form" novalidate>' +

          '<!-- Amount -->' +
          '<div class="egift-section">' +
            '<h2 class="egift-section-title">Gift amount</h2>' +
            '<div class="egift-field">' +
              '<label for="eg-amount">* Select gift amount</label>' +
              '<select id="eg-amount" required>' +
                '<option value="">Select amount</option>' +
                '<option value="10">$10</option>' +
                '<option value="25">$25</option>' +
                '<option value="50">$50</option>' +
                '<option value="75">$75</option>' +
                '<option value="100" selected>$100</option>' +
                '<option value="150">$150</option>' +
                '<option value="200">$200</option>' +
              '</select>' +
            '</div>' +
          '</div>' +

          '<!-- Recipients -->' +
          '<div class="egift-section">' +
            '<h2 class="egift-section-title">Who are you gifting to?</h2>' +
            '<p class="egift-max-note">Maximum of ' + MAX_RECIPIENTS + ' recipients</p>' +
            '<div class="egift-recipients" id="recipients-list">' +
              recipientRowHTML(0) +
            '</div>' +
            '<button type="button" class="btn-add-recipient" id="btn-add-recipient">+ Add another recipient</button>' +
          '</div>' +

          '<!-- Sender -->' +
          '<div class="egift-section">' +
            '<h2 class="egift-section-title">Your information</h2>' +
            '<div class="egift-field">' +
              '<label for="eg-sender-name">* Your Name</label>' +
              '<input type="text" id="eg-sender-name" autocomplete="name" required placeholder="Your name">' +
            '</div>' +
            '<div class="egift-field">' +
              '<label for="eg-sender-email">* Your Email (for confirmation)</label>' +
              '<input type="email" id="eg-sender-email" autocomplete="email" required placeholder="you@email.com">' +
            '</div>' +
          '</div>' +

          '<!-- Note -->' +
          '<div class="egift-section">' +
            '<h2 class="egift-section-title">Personal note</h2>' +
            '<div class="egift-field">' +
              '<label for="eg-note">Message (optional)</label>' +
              '<textarea id="eg-note" rows="3" placeholder="Write a personal message…"></textarea>' +
            '</div>' +
          '</div>' +

          '<button type="submit" class="btn-send-gift" id="btn-send">Send eGift</button>' +
          '<p class="egift-terms">By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>' +

        '</form>' +
      '</div>';

    bindForm(card);
  }

  function recipientRowHTML(idx) {
    return '<div class="egift-recipient-row" data-idx="' + idx + '">' +
      '<input type="text" placeholder="* Recipient Name" data-role="name" aria-label="Recipient name">' +
      '<input type="email" placeholder="* Recipient Email" data-role="email" aria-label="Recipient email">' +
      (idx > 0 ? '<button type="button" class="btn-remove-recipient" aria-label="Remove recipient">×</button>' : '<span></span>') +
    '</div>';
  }

  /* ── Bind events ── */
  function bindForm(card) {
    var form      = document.getElementById('egift-form');
    var list      = document.getElementById('recipients-list');
    var addBtn    = document.getElementById('btn-add-recipient');
    var rowCount  = 1;

    addBtn.addEventListener('click', function () {
      if (rowCount >= MAX_RECIPIENTS) return;
      var div = document.createElement('div');
      div.innerHTML = recipientRowHTML(rowCount++);
      list.appendChild(div.firstChild);
      updateAddBtn();
    });

    list.addEventListener('click', function (e) {
      if (e.target.classList.contains('btn-remove-recipient')) {
        e.target.closest('.egift-recipient-row').remove();
        rowCount--;
        updateAddBtn();
      }
    });

    function updateAddBtn() {
      addBtn.disabled = rowCount >= MAX_RECIPIENTS;
      addBtn.textContent = rowCount >= MAX_RECIPIENTS
        ? 'Maximum recipients reached'
        : '+ Add another recipient';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      /* Collect & validate */
      var amount     = document.getElementById('eg-amount').value;
      var senderName = document.getElementById('eg-sender-name').value.trim();
      var senderEmail= document.getElementById('eg-sender-email').value.trim();
      var note       = document.getElementById('eg-note').value.trim();
      var errors     = [];

      if (!amount) errors.push('Gift amount');

      var recipients = [];
      list.querySelectorAll('.egift-recipient-row').forEach(function (row) {
        var nameEl  = row.querySelector('[data-role="name"]');
        var emailEl = row.querySelector('[data-role="email"]');
        var name    = nameEl.value.trim();
        var email   = emailEl.value.trim();
        if (!name)            { nameEl.classList.add('is-invalid');  errors.push('Recipient name'); }
        if (!email.includes('@')) { emailEl.classList.add('is-invalid'); errors.push('Recipient email'); }
        if (name && email.includes('@')) recipients.push({ name: name, email: email });
      });

      if (!senderName)              errors.push('Your name');
      if (!senderEmail.includes('@')) errors.push('Your email');

      if (errors.length) {
        showError([...new Set(errors)].join(', '));
        return;
      }

      /* Send */
      var btn = document.getElementById('btn-send');
      btn.textContent = 'Sending…';
      btn.disabled    = true;

      var promises = recipients.map(function (r) {
        var subject  = senderName + ' sent you a Moon\'s Coffee gift card!';
        var html     = buildGiftEmail(card, amount, senderName, note, r.name);
        return sendEmail(r.email, subject, html);
      });

      Promise.all(promises)
        .then(function () { showConfirmation(card, amount, senderName, recipients); })
        .catch(function (err) {
          btn.disabled    = false;
          btn.textContent = 'Send eGift';
          showError('Error al enviar: ' + err.message);
          console.error(err);
        });
    });
  }

  function clearErrors() {
    document.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
    var e = document.querySelector('.egift-error-summary');
    if (e) e.remove();
  }

  function showError(msg) {
    var form = document.getElementById('egift-form');
    var div  = document.createElement('div');
    div.className   = 'egift-error-summary';
    div.textContent = 'Por favor completa: ' + msg;
    form.prepend(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── Success ── */
  function showConfirmation(card, amount, sender, recipients) {
    var root = document.getElementById('egift-root');
    root.innerHTML =
      '<div class="egift-inner">' +
        '<div class="egift-confirm">' +
          '<div class="egift-confirm-icon">' +
            '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' +
          '</div>' +
          '<h1 class="egift-confirm-title">¡eGift enviado!</h1>' +
          '<div class="egift-card-preview" style="background:' + card.bg + ';color:' + card.text + ';max-width:360px;margin:0 auto 24px;">' +
            (card.img
              ? '<img src="' + card.img + '" alt="' + card.name + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">'
              : '<span style="font-size:60px;">' + card.emoji + '</span>') +
            '<div style="position:relative;z-index:1;font-size:24px;font-weight:700;color:' + card.text + ';text-shadow:0 1px 4px rgba(0,0,0,.3);margin-top:8px;">' + fmt(amount) + '</div>' +
          '</div>' +
          '<p class="egift-confirm-msg">Tu gift card de <strong>' + fmt(amount) + '</strong> fue enviada por <strong>' + sender + '</strong> a:</p>' +
          '<div class="egift-confirm-recipients">' +
            recipients.map(function (r) {
              return '<p>✓ <strong>' + r.name + '</strong> · ' + r.email + '</p>';
            }).join('') +
          '</div>' +
          '<a href="starbucks_giftcards.html" class="btn-send-gift" style="max-width:280px;margin:0 auto;display:block;text-align:center;text-decoration:none;">Enviar otra Gift Card</a>' +
        '</div>' +
      '</div>';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Init ── */
  function init() {
    var params = getParams();
    var card   = findCard(params.id);
    renderForm(card);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
