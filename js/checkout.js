/* Moon's Coffee — checkout (Resend API) */
(function () {
  'use strict';

  /* ── Helpers ── */
  function fmt(n) { return '$' + n.toFixed(2); }

  function imgUrl(url) {
    if (!url) return '';
    return url + (url.includes('?') ? '&' : '?') + 'wid=80';
  }

  function configLabel(config) {
    if (!config) return '';
    var parts = [];
    Object.entries(config).forEach(function ([k, v]) {
      if (!v || v === 'none' || v === 0) return;
      if (typeof v === 'number' && v > 0) parts.push(v + ' ' + k.replace(/_/g, ' '));
      else parts.push(String(v).replace(/_/g, ' '));
    });
    return parts.join(', ');
  }

  function genOrderId() {
    return 'MC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  var PICKUP_LABELS = {
    in_store:   'Retirar en tienda',
    drive_thru: 'Drive-Thru',
    delivery:   'Delivery',
  };

  /* ── Build HTML email ── */
  function buildEmailHTML(orderId, customer, cart) {
    var subtotal = cart.reduce(function (s, c) { return s + (c.price || 0) * c.qty; }, 0);
    var isDelivery = customer.pickup === 'delivery';
    var deliveryFee = isDelivery ? 2.99 : 0;
    var tax = (subtotal + deliveryFee) * 0.0875;
    var total = subtotal + deliveryFee + tax;

    var itemRows = cart.map(function (item) {
      var label = configLabel(item.config);
      return '<tr>' +
        '<td style="padding:12px 0;border-bottom:1px solid #e8e8e8;">' +
          '<strong style="font-size:15px;color:#4F4D46;">' + item.qty + '× ' + item.name + '</strong>' +
          (item.size ? '<br><span style="font-size:13px;color:#666;">Tamaño: ' + item.size + '</span>' : '') +
          (label ? '<br><span style="font-size:13px;color:#666;">Personalización: ' + label + '</span>' : '') +
        '</td>' +
        '<td style="padding:12px 0;border-bottom:1px solid #e8e8e8;text-align:right;vertical-align:top;font-weight:600;color:#4F4D46;">' +
          fmt((item.price || 0) * item.qty) +
        '</td>' +
      '</tr>';
    }).join('');

    return '<!DOCTYPE html>' +
    '<html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background:#f5f5f0;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 16px;">' +
        '<tr><td align="center">' +
          '<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;">' +

            /* Header */
            '<tr><td style="background:#4F4D46;padding:32px;text-align:center;">' +
              '<h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.01em;">Moon\'s Coffee</h1>' +
              '<p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Nueva Orden Recibida</p>' +
            '</td></tr>' +

            /* Order ID */
            '<tr><td style="background:#4F4D46;padding:16px 32px;text-align:center;">' +
              '<p style="color:#fff;margin:0;font-size:15px;">Orden <strong>#' + orderId + '</strong> · ' +
              new Date().toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) + '</p>' +
            '</td></tr>' +

            /* Customer info */
            '<tr><td style="padding:28px 32px 0;">' +
              '<h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin:0 0 16px;">Datos del cliente</h2>' +
              '<table width="100%" cellpadding="0" cellspacing="0">' +
                '<tr>' +
                  '<td style="padding:6px 0;font-size:14px;color:#555;width:120px;">Nombre</td>' +
                  '<td style="padding:6px 0;font-size:14px;font-weight:600;color:#4F4D46;">' + customer.first + ' ' + customer.last + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding:6px 0;font-size:14px;color:#555;">Email</td>' +
                  '<td style="padding:6px 0;font-size:14px;font-weight:600;color:#4F4D46;">' + customer.email + '</td>' +
                '</tr>' +
                (customer.phone ? '<tr><td style="padding:6px 0;font-size:14px;color:#555;">Teléfono</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#4F4D46;">' + customer.phone + '</td></tr>' : '') +
                '<tr>' +
                  '<td style="padding:6px 0;font-size:14px;color:#555;">Método</td>' +
                  '<td style="padding:6px 0;font-size:14px;font-weight:600;color:#4F4D46;">' + (PICKUP_LABELS[customer.pickup] || customer.pickup) + '</td>' +
                '</tr>' +
                (customer.notes ? '<tr><td style="padding:6px 0;font-size:14px;color:#555;vertical-align:top;">Notas</td><td style="padding:6px 0;font-size:14px;font-style:italic;color:#4F4D46;">' + customer.notes + '</td></tr>' : '') +
              '</table>' +
            '</td></tr>' +

            /* Items */
            '<tr><td style="padding:28px 32px 0;">' +
              '<h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin:0 0 4px;">Pedido</h2>' +
              '<table width="100%" cellpadding="0" cellspacing="0">' +
                itemRows +
              '</table>' +
            '</td></tr>' +

            /* Totals */
            '<tr><td style="padding:20px 32px 28px;">' +
              '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f6;border-radius:10px;padding:16px;">' +
                '<tr>' +
                  '<td style="padding:4px 0;font-size:14px;color:#555;">Subtotal</td>' +
                  '<td style="padding:4px 0;font-size:14px;text-align:right;color:#4F4D46;">' + fmt(subtotal) + '</td>' +
                '</tr>' +
                (isDelivery ? '<tr><td style="padding:4px 0;font-size:14px;color:#555;">Delivery</td><td style="padding:4px 0;font-size:14px;text-align:right;color:#4F4D46;">' + fmt(deliveryFee) + '</td></tr>' : '') +
                '<tr>' +
                  '<td style="padding:4px 0;font-size:14px;color:#555;">Impuesto (8.75%)</td>' +
                  '<td style="padding:4px 0;font-size:14px;text-align:right;color:#4F4D46;">' + fmt(tax) + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding:12px 0 0;font-size:17px;font-weight:700;color:#4F4D46;border-top:1px solid #e0e0e0;">Total</td>' +
                  '<td style="padding:12px 0 0;font-size:17px;font-weight:700;text-align:right;color:#4F4D46;border-top:1px solid #e0e0e0;">' + fmt(total) + '</td>' +
                '</tr>' +
              '</table>' +
            '</td></tr>' +

            /* Footer */
            '<tr><td style="background:#4F4D46;padding:20px 32px;text-align:center;">' +
              '<p style="color:rgba(255,255,255,0.6);margin:0;font-size:12px;">Moon\'s Coffee · Orden generada automáticamente</p>' +
            '</td></tr>' +

          '</table>' +
        '</td></tr>' +
      '</table>' +
    '</body></html>';
  }

  /* ── Send via local proxy → Resend ── */
  function sendViaResend(orderId, customer, cart) {
    var subject = 'Nueva Orden #' + orderId + ' — ' + customer.first + ' ' + customer.last;

    return fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject:  subject,
        replyTo:  customer.email,
        html:     buildEmailHTML(orderId, customer, cart),
      }),
    }).then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok) throw new Error(body.error || body.message || 'Error ' + res.status);
        return body;
      });
    });
  }

  /* ── Fallback: mailto ── */
  function fallbackMailto(orderId, customer, cart) {
    var cfg = window.RESEND_CONFIG || {};
    var to = cfg.businessEmail || '';
    var subject = 'Nueva Orden #' + orderId + ' — ' + customer.first + ' ' + customer.last;
    var body = [
      'Orden #: ' + orderId,
      'Nombre: ' + customer.first + ' ' + customer.last,
      'Email: ' + customer.email,
      customer.phone ? 'Tel: ' + customer.phone : '',
      'Método: ' + (PICKUP_LABELS[customer.pickup] || customer.pickup),
      customer.notes ? 'Notas: ' + customer.notes : '',
      '',
      '--- ITEMS ---',
    ].filter(Boolean).join('\n');

    cart.forEach(function (c) {
      var label = configLabel(c.config);
      body += '\n' + c.qty + 'x ' + c.name + (c.size ? ' (' + c.size + ')' : '') + (label ? ' · ' + label : '') + ' — ' + fmt((c.price || 0) * c.qty);
    });

    var subtotal = cart.reduce(function (s, c) { return s + (c.price || 0) * c.qty; }, 0);
    var tax = subtotal * 0.0875;
    body += '\n\nTotal: ' + fmt(subtotal + tax);

    var link = document.createElement('a');
    link.href = 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(function () { link.remove(); }, 500);
  }

  /* ── Render form ── */
  function renderCheckout(cart) {
    var root = document.getElementById('checkout-root');
    if (!cart.length) {
      root.innerHTML = '<div class="co-empty"><p>No hay ítems en tu orden. <a href="starbucks_menu.html">Ver el menú</a></p></div>';
      return;
    }

    var subtotal = window.MoonCart.getTotal();
    var tax = subtotal * 0.0875;
    var total = subtotal + tax;
    root.innerHTML =
      '<div class="co-inner">' +
        '<div class="co-layout">' +
          '<div class="co-form-col">' +
            '<form id="co-form" novalidate>' +
              '<fieldset class="co-fieldset">' +
                '<legend class="co-legend">Tu información</legend>' +
                '<div class="co-field-row">' +
                  '<div class="co-field"><label for="co-first">Nombre *</label><input type="text" id="co-first" autocomplete="given-name" required placeholder="Juan"></div>' +
                  '<div class="co-field"><label for="co-last">Apellido *</label><input type="text" id="co-last" autocomplete="family-name" required placeholder="López"></div>' +
                '</div>' +
                '<div class="co-field"><label for="co-email">Tu email *</label><input type="email" id="co-email" autocomplete="email" required placeholder="tu@email.com"></div>' +
                '<div class="co-field"><label for="co-phone">Teléfono</label><input type="tel" id="co-phone" autocomplete="tel" placeholder="+1 555 000 0000"></div>' +
                '<div class="co-field"><label for="co-pickup">Método de retiro *</label>' +
                  '<select id="co-pickup" required>' +
                    '<option value="">Seleccionar método</option>' +
                    '<option value="in_store">Retirar en tienda</option>' +
                    '<option value="drive_thru">Drive-Thru</option>' +
                    '<option value="delivery">Delivery (+$2.99)</option>' +
                  '</select></div>' +
                '<div class="co-field"><label for="co-notes">Notas adicionales</label><textarea id="co-notes" rows="3" placeholder="Alergias, instrucciones especiales…"></textarea></div>' +
              '</fieldset>' +
              '<button type="submit" class="btn-place-order" id="btn-place">Confirmar orden</button>' +
            '</form>' +
          '</div>' +

          '<div class="co-summary-col">' +
            '<div class="co-summary-box">' +
              '<h2 class="co-summary-title">Resumen</h2>' +
              '<ul class="co-summary-list">' +
                cart.map(function (item) {
                  var label = configLabel(item.config);
                  return '<li class="co-summary-item">' +
                    '<div class="co-summary-img">' + (item.imageURL ? '<img src="' + imgUrl(item.imageURL) + '" alt="' + item.name + '">' : '') + '</div>' +
                    '<div class="co-summary-info"><p class="co-summary-name">' + item.name + '</p><p class="co-summary-meta">×' + item.qty + (item.size ? ' · ' + item.size : '') + (label ? ' · ' + label : '') + '</p></div>' +
                    '<span class="co-summary-price">' + fmt((item.price || 0) * item.qty) + '</span>' +
                  '</li>';
                }).join('') +
              '</ul>' +
              '<div class="co-summary-totals">' +
                '<div class="co-sum-row"><span>Subtotal</span><span>' + fmt(subtotal) + '</span></div>' +
                '<div class="co-sum-row"><span>Impuesto (8.75%)</span><span>' + fmt(tax) + '</span></div>' +
                '<div class="co-sum-row co-sum-total"><span>Total</span><span>' + fmt(total) + '</span></div>' +
              '</div>' +
            '</div>' +
            '<a href="cart.html" class="co-edit-link">← Editar orden</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    bindForm(cart);
  }

  /* ── Validation ── */
  function validate() {
    var errors = [];
    var checks = [
      { id: 'co-first',  msg: 'Nombre',           ok: function (v) { return !!v.trim(); } },
      { id: 'co-last',   msg: 'Apellido',          ok: function (v) { return !!v.trim(); } },
      { id: 'co-email',  msg: 'Email válido',       ok: function (v) { return v.includes('@'); } },
      { id: 'co-pickup', msg: 'Método de retiro',   ok: function (v) { return !!v; } },
    ];
    checks.forEach(function (c) {
      var el = document.getElementById(c.id);
      if (!el) return;
      el.classList.remove('co-invalid');
      if (!c.ok(el.value)) { el.classList.add('co-invalid'); errors.push(c.msg); }
    });
    return errors;
  }

  /* ── Confirmation screen ── */
  function showConfirmation(orderId, customer, cart, usedMailto) {
    var subtotal = cart.reduce(function (s, c) { return s + (c.price || 0) * c.qty; }, 0);
    var isDelivery = customer.pickup === 'delivery';
    var total = subtotal + (isDelivery ? 2.99 : 0);
    total = total + total * 0.0875;

    var root = document.getElementById('checkout-root');
    root.innerHTML =
      '<div class="co-confirm">' +
        '<div class="co-confirm-icon">' +
          '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' +
        '</div>' +
        '<h1 class="co-confirm-title">¡Orden enviada!</h1>' +
        '<p class="co-confirm-sub">Orden #<strong>' + orderId + '</strong></p>' +
        (usedMailto
          ? '<div class="co-confirm-email-tip"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg><span>Se abrió tu cliente de correo. Envía el email para completar la orden.</span></div><button class="btn-resend" id="btn-resend">Abrir correo de nuevo</button>'
          : '<p class="co-confirm-msg">Tu orden fue enviada a <strong>' + (window.RESEND_CONFIG && window.RESEND_CONFIG.businessEmail) + '</strong>. Te confirmaremos en breve.</p>') +
        '<div class="co-confirm-total">' + fmt(total) + ' total</div>' +
        '<ul class="co-confirm-items">' +
          cart.map(function (item) {
            return '<li>' + item.qty + '× ' + item.name + (item.size ? ' (' + item.size + ')' : '') + '</li>';
          }).join('') +
        '</ul>' +
        '<div class="co-confirm-actions"><a href="starbucks_menu.html" class="btn-place-order">Volver al menú</a></div>' +
      '</div>';

    if (usedMailto) {
      var btn = document.getElementById('btn-resend');
      if (btn) btn.addEventListener('click', function () { fallbackMailto(orderId, customer, cart); });
    }

    window.MoonCart.clearCart();
  }

  /* ── Bind form ── */
  function bindForm(cart) {
    var form = document.getElementById('co-form');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = validate();
      var errEl = form.querySelector('.co-error-summary');
      if (errEl) errEl.remove();

      if (errors.length) {
        var div = document.createElement('div');
        div.className = 'co-error-summary';
        div.textContent = 'Por favor completa: ' + errors.join(', ');
        form.prepend(div);
        div.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      var customer = {
        first:  document.getElementById('co-first').value.trim(),
        last:   document.getElementById('co-last').value.trim(),
        email:  document.getElementById('co-email').value.trim(),
        phone:  (document.getElementById('co-phone').value || '').trim(),
        pickup: document.getElementById('co-pickup').value,
        notes:  (document.getElementById('co-notes').value || '').trim(),
      };

      var orderId = genOrderId();
      var btn = document.getElementById('btn-place');
      btn.textContent = 'Enviando…';
      btn.disabled = true;

      sendViaResend(orderId, customer, cart)
          .then(function () {
            showConfirmation(orderId, customer, cart, false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          })
          .catch(function (err) {
            // Show error visibly so user can debug
            btn.disabled = false;
            btn.textContent = 'Confirmar orden';
            var errEl = form.querySelector('.co-error-summary');
            if (errEl) errEl.remove();
            var div = document.createElement('div');
            div.className = 'co-error-summary co-error-resend';
            div.innerHTML =
              '<strong>Error de Resend API:</strong> ' + (err.message || err) +
              '<br><small>Revisa la consola del browser (F12) para más detalles.</small>';
            form.prepend(div);
            div.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.error('[Resend]', err);
          });
    });
  }

  /* ── Init ── */
  function init() {
    if (!window.MoonCart) return;
    renderCheckout(window.MoonCart.getCart());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
