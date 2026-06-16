/* Moon's Coffee — cart management (localStorage) */
window.MoonCart = (function () {
  var KEY = 'moon_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    updateBadges();
    window.dispatchEvent(new CustomEvent('moon:cart-change', { detail: { cart: cart } }));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ── Public API ── */
  function addItem(item) {
    var cart = getCart();
    var configStr = JSON.stringify(item.config || {});
    var existing = cart.find(function (c) {
      return c.productId === item.productId &&
             c.form === item.form &&
             c.size === item.size &&
             JSON.stringify(c.config || {}) === configStr;
    });
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push(Object.assign({}, item, { id: uid(), qty: 1 }));
    }
    saveCart(cart);
  }

  function removeItem(id) {
    saveCart(getCart().filter(function (c) { return c.id !== id; }));
  }

  function updateQty(id, qty) {
    if (qty < 1) { removeItem(id); return; }
    var cart = getCart();
    var item = cart.find(function (c) { return c.id === id; });
    if (item) { item.qty = qty; saveCart(cart); }
  }

  function clearCart() { saveCart([]); }

  function getCount() {
    return getCart().reduce(function (s, c) { return s + (c.qty || 1); }, 0);
  }

  function getTotal() {
    return getCart().reduce(function (s, c) { return s + (c.price || 0) * (c.qty || 1); }, 0);
  }

  function updateBadges() {
    var count = getCount();
    document.querySelectorAll('.cart-badge').forEach(function (el) {
      el.textContent = count > 0 ? count : '';
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ── Init ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateBadges);
  } else {
    updateBadges();
  }

  return { getCart: getCart, addItem: addItem, removeItem: removeItem, updateQty: updateQty, clearCart: clearCart, getCount: getCount, getTotal: getTotal };
})();
