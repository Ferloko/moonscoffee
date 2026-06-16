/* Product configuration schema — options, groupings, defaults and pricing */
window.MOON_CONFIG = (function () {

  /* ── Option definitions ── */
  var OPTIONS = {
    milk: {
      id: 'milk', label: 'Milk', group: 'Milk', type: 'select',
      default: '2pct',
      choices: [
        { value: '2pct',    label: '2% Milk' },
        { value: 'whole',   label: 'Whole Milk' },
        { value: 'nonfat',  label: 'Nonfat Milk' },
        { value: 'oat',     label: 'Oat Milk',     extra: 0.80 },
        { value: 'almond',  label: 'Almond Milk',  extra: 0.80 },
        { value: 'coconut', label: 'Coconut Milk', extra: 0.80 },
        { value: 'soy',     label: 'Soy Milk',     extra: 0.80 },
      ]
    },
    foam: {
      id: 'foam', label: 'Foam', group: 'Milk', type: 'select',
      default: 'standard',
      choices: [
        { value: 'standard', label: 'Latte Foam' },
        { value: 'extra',    label: 'Extra Foam' },
        { value: 'none',     label: 'No Foam' },
      ]
    },
    temp: {
      id: 'temp', label: 'Temperature', group: 'Milk', type: 'select',
      default: 'hot',
      choices: [
        { value: 'hot',       label: 'Hot' },
        { value: 'extra_hot', label: 'Extra Hot' },
        { value: 'kids',      label: "Kid's Temp" },
        { value: 'warm',      label: 'Warm' },
      ]
    },
    ice: {
      id: 'ice', label: 'Ice', group: 'Milk', type: 'select',
      default: 'standard',
      choices: [
        { value: 'no',       label: 'No Ice' },
        { value: 'light',    label: 'Light Ice' },
        { value: 'standard', label: 'Standard Ice' },
        { value: 'extra',    label: 'Extra Ice' },
      ]
    },
    espresso: {
      id: 'espresso', label: 'Espresso Roast', group: 'Espresso & Shot Options', type: 'select',
      default: 'signature',
      choices: [
        { value: 'blonde',            label: 'Blonde Espresso' },
        { value: 'signature',         label: 'Signature Espresso' },
        { value: 'half_decaf',        label: '½ Decaf' },
        { value: 'decaf',             label: 'Decaf Espresso Roast' },
        { value: 'third_decaf',       label: '⅓ Decaf' },
        { value: 'two_thirds_decaf',  label: '⅔ Decaf' },
      ]
    },
    shots: {
      id: 'shots', label: 'Shots', group: 'Espresso & Shot Options',
      type: 'stepper', default: 2, min: 1, max: 6
    },
    vanilla: {
      id: 'vanilla', label: 'Vanilla Syrup pumps', group: 'Flavors',
      type: 'stepper', default: 0, min: 0, max: 10
    },
    caramel: {
      id: 'caramel', label: 'Caramel Sauce pumps', group: 'Flavors',
      type: 'stepper', default: 0, min: 0, max: 10
    },
    hazelnut: {
      id: 'hazelnut', label: 'Hazelnut Syrup pumps', group: 'Flavors',
      type: 'stepper', default: 0, min: 0, max: 10
    },
    classic_pumps: {
      id: 'classic_pumps', label: 'Classic Syrup pumps', group: 'Flavors',
      type: 'stepper', default: 0, min: 0, max: 10
    },
    whip: {
      id: 'whip', label: 'Whipped Cream', group: 'Toppings', type: 'select',
      default: 'yes',
      choices: [
        { value: 'yes', label: 'Whipped Cream' },
        { value: 'no',  label: 'No Whipped Cream' },
      ]
    },
    sweetener: {
      id: 'sweetener', label: 'Sweetener', group: 'Flavors', type: 'select',
      default: 'none',
      choices: [
        { value: 'none',         label: 'No Sweetener' },
        { value: 'classic',      label: 'Classic Syrup' },
        { value: 'liquid_cane',  label: 'Liquid Cane Sugar' },
        { value: 'brown_sugar',  label: 'Brown Sugar Syrup' },
        { value: 'honey',        label: 'Honey Blend' },
      ]
    },
    cold_foam: {
      id: 'cold_foam', label: 'Cold Foam', group: 'Cold Foam', type: 'select',
      default: 'none',
      choices: [
        { value: 'none',          label: 'No Cold Foam' },
        { value: 'vanilla_sweet', label: 'Vanilla Sweet Cream Cold Foam', extra: 1.25 },
        { value: 'plain',         label: 'Cold Foam', extra: 1.25 },
      ]
    },
    drizzle: {
      id: 'drizzle', label: 'Drizzle', group: 'Toppings', type: 'select',
      default: 'none',
      choices: [
        { value: 'none',     label: 'No Drizzle' },
        { value: 'caramel',  label: 'Caramel Drizzle' },
        { value: 'mocha',    label: 'Mocha Drizzle' },
        { value: 'white',    label: 'White Chocolate Mocha Drizzle' },
      ]
    },
  };

  /* ── Config options per product type ── */
  var BY_TYPE = {
    'hot-espresso':   ['milk', 'foam', 'temp', 'espresso', 'shots', 'vanilla', 'caramel', 'hazelnut'],
    'iced-espresso':  ['milk', 'ice', 'espresso', 'shots', 'vanilla', 'caramel', 'cold_foam'],
    'cold-brew':      ['milk', 'ice', 'sweetener', 'vanilla', 'cold_foam'],
    'frappuccino':    ['milk', 'whip', 'vanilla', 'caramel', 'hazelnut', 'drizzle'],
    'hot-tea':        ['temp', 'sweetener'],
    'iced-tea':       ['ice', 'sweetener'],
    'refresher':      ['ice', 'sweetener'],
    'hot-chocolate':  ['milk', 'foam', 'temp', 'whip', 'vanilla', 'drizzle'],
    'matcha':         ['milk', 'ice', 'sweetener', 'vanilla'],
    'protein':        ['milk', 'ice'],
    'food':           [],
    'generic-hot':    ['milk', 'temp'],
    'generic-iced':   ['milk', 'ice'],
  };

  /* ── Base prices (Tall size reference) ── */
  var BASE = {
    'hot-espresso':  4.45,
    'iced-espresso': 5.25,
    'cold-brew':     4.95,
    'frappuccino':   5.45,
    'hot-tea':       3.45,
    'iced-tea':      3.95,
    'refresher':     3.95,
    'hot-chocolate': 4.25,
    'matcha':        4.95,
    'protein':       6.45,
    'food':          4.95,
    'generic-hot':   4.45,
    'generic-iced':  4.95,
  };

  /* ── Size adjustments ── */
  var SIZE_EXTRA = {
    'Short':      -0.50,
    'Tall':        0,
    'Grande':      0.50,
    'Venti':       1.00,
    'Venti Cold':  1.25,
    'Trenta':      1.75,
    'One Piece':   0,
  };

  /* ── Determine config type from product ── */
  function getType(product) {
    if (product.productType === 'Food') return 'food';
    var slug = (product.categorySlug || '').toLowerCase();
    var name = (product.name || '').toLowerCase();
    var form = (product.form || 'hot').toLowerCase();

    if (slug.includes('frappuccino') || name.includes('frappuccino')) return 'frappuccino';
    if (slug.includes('cold-brew') || name.includes('cold brew') || name.includes('nitro')) return 'cold-brew';
    if (slug.includes('matcha') || name.includes('matcha')) return form === 'hot' ? 'hot-espresso' : 'matcha';
    if (slug.includes('tea') || name.includes('tea')) return form === 'hot' ? 'hot-tea' : 'iced-tea';
    if (slug.includes('refresher') || name.includes('refresher') || name.includes('lemonade refresher')) return 'refresher';
    if (slug.includes('hot-chocolate') || slug.includes('lemonade') || name.includes('hot chocolate') || name.includes('steamer')) return 'hot-chocolate';
    if (slug.includes('protein') || name.includes('protein')) return 'protein';
    if (slug.includes('bottled') || slug.includes('whole-bean') || slug.includes('via')) return 'food';
    if (form === 'iced' || form === 'cold') return 'iced-espresso';
    if (form === 'hot') return 'hot-espresso';
    return 'generic-hot';
  }

  /* ── Get default config for a product ── */
  function getDefaults(product) {
    var type = getType(product);
    var keys = BY_TYPE[type] || [];
    var defaults = {};
    keys.forEach(function (k) {
      var opt = OPTIONS[k];
      if (opt) defaults[k] = opt.default;
    });
    return defaults;
  }

  /* ── Compute price ── */
  function getPrice(product, size, config) {
    var type = getType(product);
    var base = BASE[type] || 4.45;
    var sizeAdd = SIZE_EXTRA[size] || 0;
    var configAdd = 0;

    // Extra cost for premium milks
    if (config && config.milk) {
      var milkOpt = OPTIONS.milk.choices.find(function (c) { return c.value === config.milk; });
      if (milkOpt && milkOpt.extra) configAdd += milkOpt.extra;
    }
    // Extra cost for cold foam
    if (config && config.cold_foam && config.cold_foam !== 'none') {
      var foamOpt = OPTIONS.cold_foam.choices.find(function (c) { return c.value === config.cold_foam; });
      if (foamOpt && foamOpt.extra) configAdd += foamOpt.extra;
    }
    return Math.round((base + sizeAdd + configAdd) * 100) / 100;
  }

  return {
    options: OPTIONS,
    byType: BY_TYPE,
    getType: getType,
    getDefaults: getDefaults,
    getPrice: getPrice,
  };
})();
