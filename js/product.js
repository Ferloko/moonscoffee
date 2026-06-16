/* Moon's Coffee — product detail page */
(function () {
  'use strict';

  var SIZE_OZ = {
    Short: '8 fl oz', Tall: '12 fl oz', Grande: '16 fl oz',
    Venti: '20 fl oz', 'Venti Cold': '24 fl oz', Trenta: '30 fl oz',
    'One Piece': '1 piece',
  };

  var CUP_SVG = '<svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 12h14v12c0 2-1 3-3 3H12c-2 0-3-1-3-3V12z"/><path d="M11 12V9c0-2 2-3 5-3s5 1 5 3v3"/><path d="M23 14h3c1 0 2 1 2 2v1c0 1-1 2-2 2h-3"/></svg>';

  /* ── URL params ── */
  function getParams() {
    var q = new URLSearchParams(window.location.search);
    return { id: q.get('id'), form: (q.get('form') || 'hot').toLowerCase() };
  }

  /* ── Product lookup ── */
  function lookupProduct(id, form) {
    var catalog = window.MOON_PRODUCTS || {};
    return catalog[id + '-' + form] || Object.values(catalog).find(function (p) {
      return String(p.id) === String(id) && p.form === form;
    });
  }

  function imgUrl(url, wid) {
    if (!url) return '';
    return url + (url.includes('?') ? '&' : '?') + 'wid=' + wid;
  }

  /* ── State ── */
  var state = {
    product: null,
    size: '',
    config: {},
    defaults: {},
  };

  /* ── Helpers ── */
  function fmt(n) { return '$' + n.toFixed(2); }

  function isCustomized(groupKeys) {
    return groupKeys.some(function (k) {
      return JSON.stringify(state.config[k]) !== JSON.stringify(state.defaults[k]);
    });
  }

  function getPrice() {
    if (!window.MOON_CONFIG) return 0;
    return window.MOON_CONFIG.getPrice(state.product, state.size, state.config);
  }

  /* ── Size picker ── */
  function renderSizes() {
    var sizes = state.product.sizes || [];
    if (!sizes.length) return '<p class="size-store-note">Size options vary by store.</p>';
    return '<div class="size-grid" role="radiogroup" aria-label="Size options">' +
      sizes.map(function (s) {
        var active = s === state.size;
        return '<button type="button" class="size-option' + (active ? ' is-active' : '') + '" data-size="' + s + '" role="radio" aria-checked="' + active + '">' +
          '<div class="size-option-circle">' + CUP_SVG + '</div>' +
          '<span class="size-option-name">' + s + '</span>' +
          '<span class="size-option-oz">' + (SIZE_OZ[s] || '') + '</span>' +
        '</button>';
      }).join('') +
    '</div>' +
    '<p class="size-store-note"><a href="#">Select a store</a> to view availability</p>';
  }

  /* ── Config section renderer ── */
  function renderConfigSection() {
    if (!window.MOON_CONFIG) return '';
    var type = window.MOON_CONFIG.getType(state.product);
    var optionKeys = window.MOON_CONFIG.byType[type] || [];
    if (!optionKeys.length) return '';

    // Group by section
    var groups = {};
    var groupOrder = [];
    optionKeys.forEach(function (k) {
      var opt = window.MOON_CONFIG.options[k];
      if (!opt) return;
      if (!groups[opt.group]) { groups[opt.group] = []; groupOrder.push(opt.group); }
      groups[opt.group].push(opt);
    });

    var html = '<div class="config-section">';
    html += '<h2 class="config-title">Customized Recipe</h2>';
    html += '<div class="config-fields">';

    groupOrder.forEach(function (groupName) {
      var opts = groups[groupName];
      var groupKeys = opts.map(function (o) { return o.id; });
      var customized = isCustomized(groupKeys);

      html += '<div class="config-group" data-group="' + groupName + '">';
      html += '<div class="config-group-header">';
      html += '<span class="config-group-label">' + groupName + '</span>';
      if (customized) html += '<span class="config-customized-badge">Customized</span>';
      html += '</div>';

      opts.forEach(function (opt) {
        html += renderField(opt);
      });
      html += '</div>';
    });

    html += '</div>';
    html += '<button type="button" class="btn-reset-recipe">Reset to standard recipe</button>';
    html += '</div>';
    return html;
  }

  function renderField(opt) {
    var val = state.config[opt.id];
    if (val === undefined) val = opt.default;

    if (opt.type === 'stepper') {
      var isDefault = val === opt.default;
      return '<div class="config-field' + (isDefault ? '' : ' is-modified') + '" data-opt="' + opt.id + '">' +
        '<div class="config-field-inner">' +
          '<span class="config-field-label">' + opt.label + '</span>' +
          '<div class="stepper" data-opt="' + opt.id + '" data-min="' + opt.min + '" data-max="' + opt.max + '">' +
            '<button type="button" class="stepper-btn stepper-dec" aria-label="Decrease ' + opt.label + '">−</button>' +
            '<span class="stepper-val">' + val + '</span>' +
            '<button type="button" class="stepper-btn stepper-inc" aria-label="Increase ' + opt.label + '">+</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    if (opt.type === 'select') {
      var currentChoice = opt.choices.find(function (c) { return c.value === val; }) || opt.choices[0];
      return '<div class="config-field config-select-wrap' + (val === opt.default ? '' : ' is-modified') + '" data-opt="' + opt.id + '">' +
        '<label class="config-field-label">' + opt.label + '</label>' +
        '<div class="config-select-btn" data-opt="' + opt.id + '" tabindex="0" role="combobox" aria-expanded="false">' +
          '<span class="config-select-value">' + currentChoice.label + '</span>' +
          '<svg class="config-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
        '</div>' +
        '<div class="config-dropdown" hidden>' +
          '<div class="config-dropdown-header">' + opt.label + '</div>' +
          opt.choices.map(function (c) {
            return '<button type="button" class="config-dropdown-opt' + (c.value === val ? ' is-selected' : '') + '" data-value="' + c.value + '">' +
              c.label +
              (c.extra ? '<span class="config-extra">+' + fmt(c.extra) + '</span>' : '') +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    }

    return '';
  }

  /* ── Full render ── */
  function renderPage() {
    var p = state.product;
    var catPath = p.categoryPath || [];
    var cat = catPath.length > 1 ? catPath[1] : 'Menu';
    var catHref = p.categorySlug ? 'menu/' + p.categorySlug + '.html' : 'starbucks_menu.html';

    document.title = p.name + ' — Moon\'s Coffee';

    return '' +
      '<div class="product-breadcrumb-bar">' +
        '<nav class="product-breadcrumb-inner" aria-label="Breadcrumb">' +
          '<a href="starbucks_menu.html">Menu</a>' +
          '<span aria-hidden="true">/</span>' +
          '<a href="' + catHref + '">' + cat + '</a>' +
          '<span aria-hidden="true">/</span>' +
          '<span>' + p.name + '</span>' +
        '</nav>' +
      '</div>' +

      '<section class="product-hero">' +
        '<div class="product-hero-inner">' +
          '<div class="product-hero-image">' +
            '<img src="' + imgUrl(p.imageURL, 600) + '" alt="' + p.name + '">' +
          '</div>' +
          '<div class="product-hero-text">' +
            '<h1 class="product-hero-title">' + p.name + '</h1>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="product-config">' +
        '<div class="product-config-inner">' +
          '<div class="config-sizes-col">' +
            '<h2>Size options</h2>' +
            '<div id="sizes-render">' + renderSizes() + '</div>' +
          '</div>' +
          '<div class="config-customize-col">' +
            renderConfigSection() +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="product-details">' +
        '<div class="product-details-inner">' +
          '<div class="product-details-copy">' +
            '<span class="stars-badge">' + (p.productType === 'Food' ? '100' : '200') + '★ item</span>' +
            '<p class="product-description">Enjoy your ' + p.name + '.</p>' +
          '</div>' +
          '<div class="product-order-col">' +
            '<p class="order-price" id="order-price">' + fmt(getPrice()) + '</p>' +
            '<button type="button" class="btn-add-order" id="btn-add">Add to Order</button>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<div class="product-store-bar">' +
        '<div class="product-store-bar-inner">' +
          '<p>For item availability <a href="#">Choose a store</a></p>' +
          '<div class="product-store-actions">' +
            '<a href="cart.html" class="bag-icon-link" aria-label="View cart">' +
              '<div class="bag-icon">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>' +
                '<span class="cart-badge" style="display:none"></span>' +
              '</div>' +
            '</a>' +
            '<p class="order-price-bar" id="order-price-bar">' + fmt(getPrice()) + '</p>' +
            '<button type="button" class="btn-add-order" id="btn-add-bar">Add to Order</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ── Update price displays ── */
  function updatePriceUI() {
    var price = getPrice();
    var p1 = document.getElementById('order-price');
    var p2 = document.getElementById('order-price-bar');
    if (p1) p1.textContent = fmt(price);
    if (p2) p2.textContent = fmt(price);
  }

  /* ── Update config group badges ── */
  function updateGroupBadges() {
    if (!window.MOON_CONFIG) return;
    var type = window.MOON_CONFIG.getType(state.product);
    var optionKeys = window.MOON_CONFIG.byType[type] || [];

    // Group keys by group name
    var groups = {};
    optionKeys.forEach(function (k) {
      var opt = window.MOON_CONFIG.options[k];
      if (!opt) return;
      if (!groups[opt.group]) groups[opt.group] = [];
      groups[opt.group].push(k);
    });

    document.querySelectorAll('.config-group').forEach(function (el) {
      var groupName = el.dataset.group;
      var gKeys = groups[groupName] || [];
      var badge = el.querySelector('.config-customized-badge');
      var customized = isCustomized(gKeys);

      if (customized && !badge) {
        var header = el.querySelector('.config-group-header');
        if (header) {
          var b = document.createElement('span');
          b.className = 'config-customized-badge';
          b.textContent = 'Customized';
          header.appendChild(b);
        }
      } else if (!customized && badge) {
        badge.remove();
      }

      // Update field modified state
      gKeys.forEach(function (k) {
        var field = el.querySelector('[data-opt="' + k + '"]');
        if (!field) return;
        var val = state.config[k] !== undefined ? state.config[k] : state.defaults[k];
        var modified = JSON.stringify(val) !== JSON.stringify(state.defaults[k]);
        field.classList.toggle('is-modified', modified);
      });
    });
  }

  /* ── Bind: size picker ── */
  function bindSizes(root) {
    root.querySelectorAll('.size-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('.size-option').forEach(function (b) {
          b.classList.remove('is-active'); b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('is-active'); btn.setAttribute('aria-checked', 'true');
        state.size = btn.dataset.size;
        updatePriceUI();
      });
    });
  }

  /* ── Bind: steppers ── */
  function bindSteppers(root) {
    root.querySelectorAll('.stepper').forEach(function (el) {
      var optId = el.dataset.opt;
      var min = parseInt(el.dataset.min, 10);
      var max = parseInt(el.dataset.max, 10);
      var valEl = el.querySelector('.stepper-val');

      el.querySelector('.stepper-dec').addEventListener('click', function () {
        var cur = parseInt(valEl.textContent, 10);
        if (cur > min) {
          var next = cur - 1;
          valEl.textContent = next;
          state.config[optId] = next;
          updateGroupBadges();
          updatePriceUI();
        }
      });
      el.querySelector('.stepper-inc').addEventListener('click', function () {
        var cur = parseInt(valEl.textContent, 10);
        if (cur < max) {
          var next = cur + 1;
          valEl.textContent = next;
          state.config[optId] = next;
          updateGroupBadges();
          updatePriceUI();
        }
      });
    });
  }

  /* ── Bind: select dropdowns ── */
  function bindSelects(root) {
    // Close all open dropdowns
    function closeAll() {
      root.querySelectorAll('.config-dropdown').forEach(function (dd) {
        dd.hidden = true;
        var btn = dd.closest('.config-select-wrap');
        if (btn) btn.querySelector('.config-select-btn').setAttribute('aria-expanded', 'false');
      });
    }

    root.querySelectorAll('.config-select-btn').forEach(function (btn) {
      var wrap = btn.closest('.config-select-wrap');
      var dropdown = wrap.querySelector('.config-dropdown');
      var optId = btn.dataset.opt;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = !dropdown.hidden;
        closeAll();
        if (!isOpen) {
          dropdown.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
        }
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        if (e.key === 'Escape') closeAll();
      });

      dropdown.querySelectorAll('.config-dropdown-opt').forEach(function (opt) {
        opt.addEventListener('click', function () {
          var val = opt.dataset.value;
          state.config[optId] = val;
          // Update displayed value
          var label = opt.textContent.replace(/\+\$[\d.]+/, '').trim();
          btn.querySelector('.config-select-value').textContent = label;
          // Update selection state
          dropdown.querySelectorAll('.config-dropdown-opt').forEach(function (o) {
            o.classList.toggle('is-selected', o === opt);
          });
          closeAll();
          updateGroupBadges();
          updatePriceUI();
        });
      });
    });

    document.addEventListener('click', closeAll);
  }

  /* ── Bind: reset recipe ── */
  function bindReset(root) {
    var btn = root.querySelector('.btn-reset-recipe');
    if (!btn) return;
    btn.addEventListener('click', function () {
      state.config = Object.assign({}, state.defaults);
      // Re-render config section
      var col = root.querySelector('.config-customize-col');
      if (col) {
        col.innerHTML = renderConfigSection();
        bindSteppers(col);
        bindSelects(col);
        bindReset(col);
      }
      updatePriceUI();
    });
  }

  /* ── Bind: Add to Order ── */
  function bindAddToOrder(root) {
    function doAdd() {
      if (!window.MoonCart || !window.MOON_CONFIG) return;
      var price = getPrice();
      window.MoonCart.addItem({
        productId: state.product.id,
        form: state.product.form,
        name: state.product.name,
        imageURL: state.product.imageURL,
        categorySlug: state.product.categorySlug,
        size: state.size,
        config: Object.assign({}, state.config),
        price: price,
      });
      showAddedToast(state.product.name, price);
    }

    var btn1 = root.querySelector('#btn-add');
    var btn2 = root.querySelector('#btn-add-bar');
    if (btn1) btn1.addEventListener('click', doAdd);
    if (btn2) btn2.addEventListener('click', doAdd);
  }

  /* ── Toast notification ── */
  function showAddedToast(name, price) {
    var existing = document.getElementById('cart-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.className = 'cart-toast';
    toast.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>' +
      '<div>' +
        '<strong>' + name + '</strong> added to order' +
        '<p class="toast-price">' + fmt(price) + '</p>' +
      '</div>' +
      '<a href="cart.html" class="toast-view">View order</a>';
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.classList.add('is-visible'); });
    });
    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3500);
  }

  /* ── Error ── */
  function showError(msg) {
    var root = document.getElementById('product-root');
    root.innerHTML = '<p class="product-error">' + msg + ' <a href="starbucks_menu.html">Back to menu</a></p>';
  }

  /* ── Init ── */
  function init() {
    var params = getParams();
    var root = document.getElementById('product-root');
    if (!params.id || !window.MOON_PRODUCTS) { showError('Product not found.'); return; }

    var product = lookupProduct(params.id, params.form);
    if (!product) { showError('Product not found.'); return; }

    // Init state
    state.product = product;
    state.size = product.defaultSize || (product.sizes && product.sizes[0]) || 'Grande';
    state.defaults = window.MOON_CONFIG ? window.MOON_CONFIG.getDefaults(product) : {};
    state.config = Object.assign({}, state.defaults);

    root.innerHTML = renderPage();

    bindSizes(root);
    bindSteppers(root);
    bindSelects(root);
    bindReset(root);
    bindAddToOrder(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
