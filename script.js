(function () {
  'use strict';

  /* ------------------------------ Utilities ------------------------------ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const K = {
    THEME: 'aurum-theme',
    CART: 'aurum-cart',
    PRODUCTS: 'aurum-products',
    REVIEWS: 'aurum-reviews',
    ORDERS: 'aurum-orders',
    ADMIN: 'aurum-admin'
  };

  const fmt = (n) => '৳ ' + Number(n).toLocaleString('en-US');

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const ADMIN_PASS = 'aurum2024';

  /* ------------------------- Watch image generator ------------------------ */

  const VARIANTS = {
    gold:   { case: '#c9a35c', caseDark: '#a8813f', dial: '#10141d', hand: '#f2e7cf', strap: '#262a35', accent: '#c9a35c', bg: '#171c2a', marker: '#e9dcc3' },
    rose:   { case: '#d8a29b', caseDark: '#b57f77', dial: '#171319', hand: '#f0e2d8', strap: '#3a2a26', accent: '#d8a29b', bg: '#20171a', marker: '#f0dcd2' },
    silver: { case: '#ccd2dc', caseDark: '#9aa3b1', dial: '#0f131b', hand: '#e8eef6', strap: '#2b3038', accent: '#c9cdd6', bg: '#171b24', marker: '#e6ecf4' },
    navy:   { case: '#c9a35c', caseDark: '#a8813f', dial: '#0e1c33', hand: '#e8dfc6', strap: '#232936', accent: '#c9a35c', bg: '#121a2b', marker: '#d8d2c2' },
    black:  { case: '#8f9bb0', caseDark: '#5c6573', dial: '#05070c', hand: '#d9dee6', strap: '#17191f', accent: '#c9a35c', bg: '#101219', marker: '#c9d0da' },
    pearl:  { case: '#d4b88c', caseDark: '#b3946a', dial: '#f6f1e8', hand: '#6b5130', strap: '#5d4a34', accent: '#b98a4e', bg: '#efe7d9', marker: '#a58a5e' },
    bronze: { case: '#c07a3e', caseDark: '#98592a', dial: '#14100d', hand: '#e6cfae', strap: '#2c2a24', accent: '#c9a35c', bg: '#1a1712', marker: '#ddc39a' }
  };

  function watchSvg(v, brand) {
    const markers = [];
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 * Math.PI) / 180;
      const x = 320 + Math.sin(a) * 100;
      const y = 320 - Math.cos(a) * 100;
      const isMajor = i % 3 === 0;
      markers.push(
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (isMajor ? 12 : 6) + '" fill="' +
        (isMajor ? v.accent : v.marker) + '" opacity="' + (isMajor ? 1 : 0.5) + '"/>'
      );
    }
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">' +
      '<rect width="640" height="640" fill="' + v.bg + '"/>' +
      '<g opacity="0.45"><circle cx="320" cy="320" r="212" fill="none" stroke="' + v.accent + '" stroke-opacity="0.22" stroke-width="2"/>' +
      '<circle cx="320" cy="320" r="190" fill="none" stroke="' + v.accent + '" stroke-opacity="0.14" stroke-width="1"/></g>' +
      '<path d="M262 250 L262 96 Q262 70 288 70 L352 70 Q378 70 378 96 L378 250 Z" fill="' + v.strap + '"/>' +
      '<path d="M262 390 L262 544 Q262 570 288 570 L352 570 Q378 570 378 544 L378 390 Z" fill="' + v.strap + '"/>' +
      '<rect x="278" y="70" width="84" height="180" rx="10" fill="none" stroke="' + v.accent + '" stroke-opacity="0.28" stroke-width="2"/>' +
      '<rect x="278" y="390" width="84" height="180" rx="10" fill="none" stroke="' + v.accent + '" stroke-opacity="0.28" stroke-width="2"/>' +
      '<rect x="258" y="236" width="124" height="26" rx="9" fill="' + v.caseDark + '"/>' +
      '<rect x="258" y="378" width="124" height="26" rx="9" fill="' + v.caseDark + '"/>' +
      '<rect x="442" y="300" width="28" height="40" rx="9" fill="' + v.accent + '"/>' +
      '<rect x="470" y="312" width="12" height="16" rx="4" fill="' + v.caseDark + '"/>' +
      '<circle cx="320" cy="320" r="142" fill="' + v.accent + '"/>' +
      '<circle cx="320" cy="320" r="130" fill="' + v.caseDark + '"/>' +
      '<circle cx="320" cy="320" r="120" fill="' + v.dial + '"/>' +
      markers.join('') +
      '<line x1="320" y1="320" x2="320" y2="248" stroke="' + v.hand + '" stroke-width="8" stroke-linecap="round"/>' +
      '<line x1="320" y1="320" x2="360" y2="322" stroke="' + v.hand + '" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="320" cy="320" r="9" fill="' + v.accent + '"/>' +
      '<text x="320" y="424" text-anchor="middle" font-family="Georgia, serif" font-size="24" letter-spacing="6" fill="' + v.accent + '">' + brand + '</text>' +
      '<text x="320" y="444" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" letter-spacing="3" fill="' + v.hand + '" opacity="0.6">SWISS · AUTOMATIC</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  /* ------------------------------ Product data ---------------------------- */

  const px = (id) => 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg?auto=compress&cs=tinysrgb&w=800';

  const PRODUCT_DEFAULTS = [
    { id: 1, name: 'Classic Heritage Gold', brand: 'AURUM', category: 'Dress', price: 18500, oldPrice: 21500, movement: 'Automatic', glass: 'Sapphire', water: '50M', strap: 'Italian Leather', case: 'gold', tag: 'Best Seller', image: px(18271276) },
    { id: 2, name: 'Noir Royale Chronograph', brand: 'AURUM', category: 'Chronograph', price: 24900, oldPrice: null, movement: 'Automatic', glass: 'Domed Sapphire', water: '100M', strap: 'Alligator Leather', case: 'black', tag: 'Limited', image: px(28977357) },
    { id: 3, name: 'Pearl Court Diamond', brand: 'AURUM', category: 'Dress', price: 32000, oldPrice: 37000, movement: 'Mechanical', glass: 'Sapphire', water: '30M', strap: 'Italian Leather', case: 'rose', tag: 'New Arrival', image: px(16841001) },
    { id: 4, name: 'Steelcore Diver 300', brand: 'AURUM', category: 'Diver', price: 15750, oldPrice: null, movement: 'Automatic', glass: 'Domed Sapphire', water: '300M', strap: 'Stainless Steel', case: 'silver', tag: null, image: px(33684303) },
    { id: 5, name: 'Rose Élégance 32mm', brand: 'AURUM', category: 'Dress', price: 12200, oldPrice: 14200, movement: 'Quartz', glass: 'Mineral', water: '30M', strap: 'Italian Leather', case: 'pearl', tag: 'Gift Pick', image: px(37050003) },
    { id: 6, name: 'Midnight Navigator GMT', brand: 'AURUM', category: 'GMT', price: 28600, oldPrice: null, movement: 'Automatic', glass: 'Sapphire', water: '200M', strap: 'Brushed Steel', case: 'navy', tag: 'Hot', image: px(35164843) },
    { id: 7, name: 'Heritage Silver Edition', brand: 'AURUM', category: 'Quartz', price: 9850, oldPrice: 11800, movement: 'Quartz', glass: 'Mineral', water: '50M', strap: 'Stainless Steel', case: 'bronze', tag: null, image: px(16739804) },
    { id: 8, name: 'Aurora Rose Gold Slim', brand: 'AURUM', category: 'Dress', price: 21400, oldPrice: null, movement: 'Mechanical', glass: 'Domed Sapphire', water: '50M', strap: 'Alligator Leather', case: 'rose', tag: 'New Arrival', image: px(35080771) }
  ];

  const DATA_VERSION = 2;

  function getProducts() {
    const raw = localStorage.getItem(K.PRODUCTS);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data && data.__v === DATA_VERSION && Array.isArray(data.products)) {
          return data.products;
        }
      } catch (e) {}
    }
    const list = PRODUCT_DEFAULTS.map((p) => Object.assign({}, p));
    store.set(K.PRODUCTS, { __v: DATA_VERSION, products: list });
    return list;
  }
  function saveProducts(list) {
    store.set(K.PRODUCTS, { __v: DATA_VERSION, products: list });
  }
  function getProduct(id) {
    return getProducts().find((p) => String(p.id) === String(id));
  }
  function resolveImage(p) {
    if (p.image) return p.image;
    const v = VARIANTS[p.case] || VARIANTS.gold;
    return watchSvg(v, p.brand || 'AURUM');
  }

  /* --------------------------------- Theme -------------------------------- */

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(K.THEME, theme);
  }

  $('#themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    toast(next === 'light' ? 'Day mode enabled' : 'Night mode enabled');
  });

  applyTheme(localStorage.getItem(K.THEME) || 'dark');

  /* -------------------------------- Toasts -------------------------------- */

  function toast(message, type = '') {
    const wrap = $('#toastWrap');
    const el = document.createElement('div');
    el.className = 'toast';
    const icon = document.createElement('span');
    icon.className = 'toast-icon ' + (type === 'success' ? 'success' : type === 'error' ? 'error' : '');
    icon.textContent = type === 'success' ? '✓' : type === 'error' ? '!' : '✦';
    const text = document.createElement('span');
    text.textContent = message;
    el.append(icon, text);
    wrap.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 320);
    }, 2600);
  }

  /* -------------------------------- Search -------------------------------- */

  const searchInput = $('#searchInput');
  const searchClear = $('#searchClear');

  function applyFilter() {
    const q = searchInput.value.trim().toLowerCase();
    const list = getProducts().filter((p) => {
      if (!q) return true;
      const haystack = [p.name, p.brand, p.category, p.movement, p.glass, p.strap, p.tag || ''].join(' ').toLowerCase();
      return haystack.includes(q);
    });
    renderProducts(list);
    $('#noResults').hidden = list.length > 0;
    $('#resultInfo').hidden = !q;
    if (q) {
      $('#resultInfo').innerHTML = 'Showing <strong>' + list.length + '</strong> of <strong>' + getProducts().length + '</strong> watches for “' + searchInput.value.trim() + '”';
    }
    searchClear.hidden = !q;
  }

  searchInput.addEventListener('input', applyFilter);
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    applyFilter();
  });

  /* --------------------------- Product rendering -------------------------- */

  const productGrid = $('#productGrid');

  function productCard(p) {
    const tag = p.tag
      ? '<span class="product-tag' + (p.tag === 'New Arrival' ? ' outline' : '') + '">' + p.tag + '</span>'
      : '';
    const old = p.oldPrice ? '<span class="product-old">' + fmt(p.oldPrice) + '</span>' : '';
    return (
      '<article class="product-card" data-id="' + p.id + '" data-view="' + p.id + '" role="button" tabindex="0" aria-label="View ' + p.name + '">' +
        '<div class="product-media">' + tag +
          '<img src="' + resolveImage(p) + '" alt="' + p.name + ' by ' + p.brand + '" loading="lazy">' +
          '<span class="product-cod">COD</span>' +
        '</div>' +
        '<div class="product-body">' +
          '<span class="product-brand">' + p.brand + '</span>' +
          '<h3 class="product-name">' + p.name + '</h3>' +
          '<div class="product-specs">' +
            '<span class="spec-chip">' + p.movement + '</span>' +
            '<span class="spec-chip">' + p.glass + '</span>' +
            '<span class="spec-chip">' + p.water + '</span>' +
          '</div>' +
          '<div class="product-price-row">' +
            '<div class="price-wrap"><span class="product-price">' + fmt(p.price) + '</span>' + old + '</div>' +
            '<button class="add-cart-btn" data-add="' + p.id + '" aria-label="Add ' + p.name + ' to cart">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.2 12.2a1.8 1.8 0 0 1-1.8 1.8H6.6a1.8 1.8 0 0 1-1.8-1.8L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>' +
              'Add' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderProducts(list) {
    productGrid.innerHTML = list.map(productCard).join('');
  }

  productGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (btn) {
      addToCart(Number(btn.dataset.add));
      const original = btn.innerHTML;
      btn.classList.add('added');
      btn.textContent = 'Added ✓';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = original;
      }, 1200);
      return;
    }
    const card = e.target.closest('[data-view]');
    if (card) openProductModal(Number(card.dataset.view));
  });

  productGrid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-view]')) {
      e.preventDefault();
      openProductModal(Number(e.target.dataset.view));
    }
  });

  /* --------------------------- Product detail view -------------------------- */

  const productModal = $('#productModal');
  const productModalBody = $('#productModalBody');
  let productModalId = null;
  let productModalQty = 1;

  const CASE_LABELS = {
    gold: '18K Gold Plated',
    rose: 'Rose Gold Plated',
    silver: 'Brushed Silver',
    navy: 'Navy Dial Steel',
    black: 'Matte Black Steel',
    pearl: 'Pearl White',
    bronze: 'Antique Bronze'
  };

  function productRating(p) {
    const rating = (4.3 + (p.id % 7) * 0.1).toFixed(1);
    return { rating, count: 84 + p.id * 13 };
  }

  function paintModalQty() {
    $('#pmQty').textContent = productModalQty;
  }

  function openProductModal(id) {
    const p = getProduct(id);
    if (!p) return;
    productModalId = id;
    productModalQty = 1;
    productModalBody.innerHTML = buildProductModal(p);
    paintModalQty();
    productModal.hidden = false;
    requestAnimationFrame(() => productModal.classList.add('show'));
  }

  function closeProductModal() {
    productModal.classList.remove('show');
    setTimeout(() => { productModal.hidden = true; }, 300);
  }

  function buildProductModal(p) {
    const { rating, count } = productRating(p);
    const old = p.oldPrice ? '<span class="product-old">' + fmt(p.oldPrice) + '</span>' : '';
    const save = p.oldPrice ? '<span class="pm-save">Save ' + fmt(p.oldPrice - p.price) + '</span>' : '';
    const tag = p.tag
      ? '<span class="product-tag' + (p.tag === 'New Arrival' ? ' outline' : '') + '">' + p.tag + '</span>'
      : '';

    const specRows = [
      ['Movement', p.movement],
      ['Glass', p.glass],
      ['Water resistance', p.water],
      ['Strap material', p.strap],
      ['Case finish', CASE_LABELS[p.case] || p.case],
      ['Category', p.category]
    ].map((pair) => '<tr><th>' + pair[0] + '</th><td>' + pair[1] + '</td></tr>').join('');

    const related = getProducts()
      .filter((x) => String(x.id) !== String(p.id))
      .sort((a, b) => (b.category === p.category ? 1 : 0) - (a.category === p.category ? 1 : 0))
      .slice(0, 3);
    const relatedHTML = related.length
      ? '<div class="pm-related"><h4>Related timepieces</h4><div class="pm-related-grid">' +
        related.map((r) =>
          '<button type="button" class="pm-related-item" data-open="' + r.id + '">' +
            '<img src="' + resolveImage(r) + '" alt="" loading="lazy">' +
            '<span>' + r.name + '</span>' +
            '<strong>' + fmt(r.price) + '</strong>' +
          '</button>'
        ).join('') + '</div></div>'
      : '';

    return (
      '<div class="product-modal">' +
        '<div class="pm-media">' + tag +
          '<img src="' + resolveImage(p) + '" alt="' + p.name + '">' +
        '</div>' +
        '<div class="pm-info">' +
          '<span class="product-brand">' + p.brand + '</span>' +
          '<h2 class="pm-name" id="productModalTitle">' + p.name + '</h2>' +
          '<div class="pm-rating">' + starHTML(Math.round(rating)) +
            '<span>' + rating + ' · ' + count + ' reviews</span>' +
          '</div>' +
          '<div class="pm-price-row"><span class="product-price pm-price">' + fmt(p.price) + '</span>' + old + save + '</div>' +
          '<p class="pm-desc">A signature ' + p.brand + ' timepiece finished by hand — ' + p.glass.toLowerCase() +
            ' crystal, ' + p.movement.toLowerCase() + ' movement and a ' + p.strap.toLowerCase() + ' strap. ' +
            'Delivered with a certificate of authenticity and 5-year warranty.</p>' +
          '<div class="pm-specs"><table><tbody>' + specRows + '</tbody></table></div>' +
          '<div class="pm-buy">' +
            '<div class="qty-stepper pm-qty">' +
              '<button type="button" data-pqdec aria-label="Decrease quantity">−</button>' +
              '<span id="pmQty">1</span>' +
              '<button type="button" data-pqinc aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button class="btn btn-primary" data-padd>Add to Cart</button>' +
          '</div>' +
          '<button class="btn btn-ghost btn-block" data-pbuy>Buy Now — Cash on Delivery</button>' +
          '<div class="pm-chips">' +
            '<span class="pm-chip">Free home delivery</span>' +
            '<span class="pm-chip">Cash on delivery</span>' +
            '<span class="pm-chip">7-day exchange</span>' +
          '</div>' +
          '<div class="pm-chips pm-pay">' +
            '<span class="pm-chip">bKash</span><span class="pm-chip">Nagad</span><span class="pm-chip">Rocket</span><span class="pm-chip">Visa/Mastercard</span>' +
          '</div>' +
        '</div>' +
        relatedHTML +
      '</div>'
    );
  }

  productModalBody.addEventListener('click', (e) => {
    const dec = e.target.closest('[data-pqdec]');
    const inc = e.target.closest('[data-pqinc]');
    if (dec) { productModalQty = Math.max(1, productModalQty - 1); paintModalQty(); }
    if (inc) { productModalQty += 1; paintModalQty(); }
    const addBtn = e.target.closest('[data-padd]');
    if (addBtn && productModalId) addToCart(productModalId, productModalQty);
    const buyBtn = e.target.closest('[data-pbuy]');
    if (buyBtn && productModalId) {
      addToCart(productModalId, productModalQty);
      closeProductModal();
      openCheckout();
    }
    const openBtn = e.target.closest('[data-open]');
    if (openBtn) openProductModal(Number(openBtn.dataset.open));
  });

  $('#productModalClose').addEventListener('click', closeProductModal);
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });

  /* -------------------------------- Marquee -------------------------------- */

  function renderMarquee() {
    const track = $('#marqueeTrack');
    if (!track) return;
    const items = getProducts().map((p) =>
      '<span class="marquee-item">' +
        '<span class="m-name">' + p.name + '</span>' +
        '<span class="m-dot">✦</span>' +
        '<span class="m-price">' + fmt(p.price) + '</span>' +
        (p.tag ? '<span class="m-tag">' + p.tag + '</span>' : '') +
      '</span>'
    ).join('');
    track.innerHTML = items + items;
  }

  /* ------------------------------ Cart logic ------------------------------ */

  const cartDrawer = $('#cartDrawer');
  const cartBody = $('#cartBody');
  const cartItemsEl = $('#cartItems');
  const cartEmpty = $('#cartEmpty');
  const cartFoot = $('#cartFoot');
  const cartBadge = $('#cartCount');
  const cartHeadCount = $('#cartHeadCount');
  const overlay = $('#overlay');

  function getCart() {
    return store.get(K.CART, []);
  }
  function saveCart(cart) {
    store.set(K.CART, cart);
  }

  function cartCount() {
    return getCart().reduce((sum, it) => sum + it.qty, 0);
  }
  function cartTotal() {
    return getCart().reduce((sum, it) => {
      const p = getProduct(it.id);
      return sum + (p ? p.price * it.qty : 0);
    }, 0);
  }

  function addToCart(id, qty = 1) {
    const cart = getCart();
    const found = cart.find((it) => it.id === id);
    if (found) {
      found.qty += qty;
    } else {
      cart.push({ id, qty });
    }
    saveCart(cart);
    renderCart();
    const p = getProduct(id);
    toast(p ? p.name + ' added to cart' : 'Added to cart', 'success');
  }

  function setQty(id, delta) {
    const cart = getCart();
    const found = cart.find((it) => it.id === id);
    if (!found) return;
    found.qty += delta;
    if (found.qty <= 0) {
      saveCart(cart.filter((it) => it.id !== id));
    } else {
      saveCart(cart);
    }
    renderCart();
  }

  function removeFromCart(id) {
    saveCart(getCart().filter((it) => it.id !== id));
    renderCart();
    toast('Item removed from cart');
  }

  function renderCart() {
    const cart = getCart();
    const count = cartCount();
    cartBadge.hidden = count === 0;
    cartBadge.textContent = count;
    cartHeadCount.textContent = count + (count === 1 ? ' item' : ' items');

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '';
      cartEmpty.hidden = false;
      cartFoot.hidden = true;
      return;
    }
    cartEmpty.hidden = true;
    cartFoot.hidden = false;

    cartItemsEl.innerHTML = cart.map((it) => {
      const p = getProduct(it.id);
      if (!p) return '';
      return (
        '<div class="cart-item" data-id="' + p.id + '">' +
          '<div class="cart-item-thumb"><img src="' + resolveImage(p) + '" alt=""></div>' +
          '<div class="cart-item-info">' +
            '<div class="cart-item-name">' + p.name + '</div>' +
            '<div class="cart-item-price">' + fmt(p.price) + '</div>' +
            '<div class="cart-item-actions">' +
              '<div class="qty-stepper">' +
                '<button type="button" data-cdec="' + p.id + '" aria-label="Decrease quantity">−</button>' +
                '<span>' + it.qty + '</span>' +
                '<button type="button" data-cinc="' + p.id + '" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<button type="button" class="cart-item-remove" data-cremove="' + p.id + '">Remove</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-item-line">' + fmt(p.price * it.qty) + '</div>' +
        '</div>'
      );
    }).join('');

    $('#cartSubtotal').textContent = fmt(cartTotal());
    $('#cartTotal').textContent = fmt(cartTotal());
  }

  cartItemsEl.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-cinc]');
    const dec = e.target.closest('[data-cdec]');
    const rem = e.target.closest('[data-cremove]');
    if (inc) setQty(Number(inc.dataset.cinc), 1);
    if (dec) setQty(Number(dec.dataset.cdec), -1);
    if (rem) removeFromCart(Number(rem.dataset.cremove));
  });

  function openCart() {
    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('show'));
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('show');
    setTimeout(() => { overlay.hidden = true; }, 300);
  }

  $('#cartToggle').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', () => {
    closeCart();
    closeModal();
  });

  /* --------------------------- Checkout & orders -------------------------- */

  const checkoutModal = $('#checkoutModal');

  function getOrders() {
    const raw = localStorage.getItem(K.ORDERS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { return []; }
    }
    const orders = [];
    let seed = 2024;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const count = 24 + Math.floor(rand() * 14);
    for (let i = 0; i < count; i++) {
      const p = PRODUCT_DEFAULTS[Math.floor(rand() * PRODUCT_DEFAULTS.length)];
      const qty = 1 + Math.floor(rand() * 3);
      orders.push({
        id: 'ORD-' + (1000 + i),
        productId: p.id,
        qty,
        amount: p.price * qty,
        ts: Date.now() - Math.floor(rand() * 45) * 86400000
      });
    }
    store.set(K.ORDERS, orders);
    return orders;
  }
  function saveOrders(orders) {
    store.set(K.ORDERS, orders);
  }

  function openCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
      toast('Your cart is empty', 'error');
      return;
    }
    const rows = cart.map((it) => {
      const p = getProduct(it.id);
      if (!p) return '';
      return (
        '<div class="checkout-item">' +
          '<img src="' + resolveImage(p) + '" alt="">' +
          '<span>' + p.name + ' <small>× ' + it.qty + '</small></span>' +
          '<em>' + fmt(p.price * it.qty) + '</em>' +
        '</div>'
      );
    }).join('');

    $('#checkoutList').innerHTML = rows;
    $('#checkoutTotal').textContent = fmt(cartTotal());
    openModal();
  }

  function openModal() {
    checkoutModal.hidden = false;
    requestAnimationFrame(() => checkoutModal.classList.add('show'));
  }
  function closeModal() {
    checkoutModal.classList.remove('show');
    setTimeout(() => { checkoutModal.hidden = true; }, 300);
  }

  function showSuccess() {
    const card = $('.modal-card', checkoutModal);
    card.innerHTML =
      '<div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
      '<span class="eyebrow">Thank you</span>' +
      '<h3 style="text-align:center;margin:10px 0 6px">Order placed!</h3>' +
      '<p style="text-align:center;color:var(--muted);font-size:0.92rem">Our team will call you within 24 hours to confirm delivery. Pay via bKash, Nagad, card or Cash on Delivery.</p>';
    setTimeout(() => {
      closeModal();
      setTimeout(() => {
        card.innerHTML =
          '<button class="icon-btn modal-close" id="modalClose" type="button" aria-label="Close">×</button>' +
          '<span class="eyebrow">Secure Checkout</span>' +
          '<h3>Order Summary</h3>' +
          '<div class="checkout-list" id="checkoutList"></div>' +
          '<div class="checkout-total-row"><span>Total payable</span><strong id="checkoutTotal">৳ 0</strong></div>' +
          '<p class="checkout-note">Pay via bKash, Nagad, Rocket, Upay, card or Cash on Delivery after confirmation.</p>' +
          '<div class="checkout-actions">' +
            '<button class="btn btn-ghost" id="checkoutBack" type="button">Back to cart</button>' +
            '<button class="btn btn-primary" id="placeOrderBtn" type="button">Place Order</button>' +
          '</div>';
        $('#modalClose').addEventListener('click', closeModal);
        $('#checkoutBack').addEventListener('click', () => { closeModal(); });
        $('#placeOrderBtn').addEventListener('click', placeOrder);
      }, 320);
    }, 2400);
  }

  function placeOrder() {
    const cart = getCart();
    const orders = getOrders();
    cart.forEach((it, i) => {
      const p = getProduct(it.id);
      if (p) {
        orders.push({ id: 'ORD-' + (Date.now() + i), productId: p.id, qty: it.qty, amount: p.price * it.qty, ts: Date.now() });
      }
    });
    saveOrders(orders);
    saveCart([]);
    renderCart();
    renderStats();
    renderOrders();
    showSuccess();
    toast('Order placed successfully!', 'success');
  }

  $('#checkoutBtn').addEventListener('click', openCheckout);
  $('#modalClose').addEventListener('click', closeModal);
  $('#checkoutBack').addEventListener('click', () => closeModal());
  $('#placeOrderBtn').addEventListener('click', placeOrder);
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeModal();
      closeProductModal();
    }
  });

  /* ------------------------------- Compare -------------------------------- */

  const compareA = $('#compareA');
  const compareB = $('#compareB');
  const compareC = $('#compareC');
  const compareWrap = $('#compareTableWrap');

  function fillCompareSelect(sel, includeNone) {
    const current = sel.value || '';
    let html = includeNone ? '<option value="">None</option>' : '';
    html += getProducts().map((p) => '<option value="' + p.id + '">' + p.name + '</option>').join('');
    sel.innerHTML = html;
    if (current) sel.value = current;
  }

  function renderCompare() {
    fillCompareSelect(compareA);
    fillCompareSelect(compareB);
    fillCompareSelect(compareC, true);

    const picks = [compareA.value, compareB.value, compareC.value]
      .filter((v) => v !== '')
      .map((id) => getProduct(id))
      .filter(Boolean);

    if (picks.length < 2) {
      compareWrap.innerHTML = '<p class="result-info">Select at least <strong>two</strong> different watches to compare.</p>';
      return;
    }

    const cell = (p) =>
      '<td>' +
        '<div class="compare-img"><img src="' + resolveImage(p) + '" alt=""></div>' +
        '<div class="compare-name">' + p.name + '</div>' +
      '</td>';

    const head =
      '<thead><tr><th>Specification</th>' + picks.map(cell).join('') + '</tr></thead>';

    const rows = [
      ['Brand', (p) => p.brand],
      ['Movement', (p) => p.movement],
      ['Glass', (p) => p.glass],
      ['Water resistance', (p) => p.water],
      ['Strap material', (p) => p.strap],
      ['Price', (p) => '<span class="compare-price">' + fmt(p.price) + '</span>']
    ];
    const body =
      '<tbody>' +
      rows.map(([label, fn]) => {
        return '<tr><th>' + label + '</th>' + picks.map((p) => '<td>' + fn(p) + '</td>').join('') + '</tr>';
      }).join('') +
      '<tr><th>Action</th>' + picks.map((p) => {
        return '<td><button class="add-cart-btn" data-cadd="' + p.id + '">Add to Cart</button></td>';
      }).join('') + '</tr>' +
      '</tbody>';

    compareWrap.innerHTML = '<table class="compare-table">' + head + body + '</table>';
  }

  [compareA, compareB, compareC].forEach((sel) => sel.addEventListener('change', renderCompare));
  compareWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cadd]');
    if (btn) addToCart(Number(btn.dataset.cadd));
  });

  /* ------------------------------- Reviews -------------------------------- */

  const SAMPLE_REVIEWS = [
    { id: 1, name: 'Rahim Uddin', rating: 5, verified: true, date: '12 Jan 2026', comment: 'Bought the Classic Heritage Gold for my wedding. The finishing is stunning and the delivery took only two days in Dhaka. Absolutely worth every taka.' },
    { id: 2, name: 'Nusrat Jahan', rating: 5, verified: true, date: '28 Jan 2026', comment: 'The Rose Élégance is even more beautiful in person. Packaging was premium, and I loved the handwritten thank-you note.' },
    { id: 3, name: 'Tanvir Ahmed', rating: 4, verified: true, date: '9 Feb 2026', comment: 'Solid diver watch, great weight and the 300M rating is real — tested it while diving in Cox\'s Bazar. Strap takes a day to break in.' },
    { id: 4, name: 'Sadia Rahman', rating: 5, verified: true, date: '21 Feb 2026', comment: 'Customer support was excellent — they helped me pick the right size over the phone. Fast Nagad payment and instant confirmation.' },
    { id: 5, name: 'Imran Hossain', rating: 5, verified: true, date: '3 Mar 2026', comment: 'Sapphire glass and automatic movement at this price is unbeatable in BD. My second AURUM and certainly not my last.' },
    { id: 6, name: 'Farzana Akter', rating: 4, verified: true, date: '18 Mar 2026', comment: 'Lovely GMT watch, keeps excellent time. Slightly large on small wrists but the quality more than makes up for it.' }
  ];

  function getReviews() {
    return store.get(K.REVIEWS, SAMPLE_REVIEWS);
  }
  function saveReviews(list) {
    store.set(K.REVIEWS, list);
  }

  function starHTML(n) {
    let html = '';
    for (let i = 1; i <= 5; i++) html += i <= n ? '★' : '☆';
    return '<span class="review-stars" aria-label="' + n + ' out of 5 stars">' + html + '</span>';
  }

  function reviewCard(r) {
    const initials = r.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const badge = r.verified
      ? '<span class="review-verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Verified buyer</span>'
      : '<span class="review-verified" style="color:var(--muted)">Just now</span>';
    return (
      '<article class="review-card">' +
        '<div class="review-top">' + starHTML(r.rating) + '</div>' +
        '<p class="review-text">“' + r.comment + '”</p>' +
        '<div class="review-author">' +
          '<div class="review-avatar">' + initials + '</div>' +
          '<div><strong>' + r.name + '</strong>' + badge + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderReviews() {
    $('#reviewsGrid').innerHTML = getReviews().slice(0, 9).map(reviewCard).join('');
  }

  const RATING_LABELS = { 5: '5 — Excellent', 4: '4 — Great', 3: '3 — Good', 2: '2 — Fair', 1: '1 — Poor' };
  let selectedRating = 5;

  function paintStars() {
    $$('.star-btn').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.value) <= selectedRating);
    });
    $('#starPickerLabel').textContent = RATING_LABELS[selectedRating];
  }

  $('#starPicker').addEventListener('click', (e) => {
    const btn = e.target.closest('.star-btn');
    if (!btn) return;
    selectedRating = Number(btn.dataset.value);
    paintStars();
  });

  $('#reviewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#reviewName').value.trim();
    const comment = $('#reviewComment').value.trim();
    if (!name || !comment) {
      toast('Please fill in your name and comment', 'error');
      return;
    }
    const reviews = getReviews();
    reviews.unshift({
      id: Date.now(),
      name,
      rating: selectedRating,
      verified: false,
      comment
    });
    saveReviews(reviews);
    renderReviews();
    $('#reviewForm').reset();
    selectedRating = 5;
    paintStars();
    toast('Thanks for your review!', 'success');
  });

  /* -------------------------------- Admin --------------------------------- */

  const adminLogin = $('#adminLogin');
  const adminDash = $('#adminDash');
  const adminError = $('#adminError');

  function isAdmin() {
    return sessionStorage.getItem(K.ADMIN) === '1';
  }

  function renderStats() {
    const orders = getOrders();
    const totalOrders = orders.length;
    const revenue = orders.reduce((s, o) => s + o.amount, 0);
    const items = orders.reduce((s, o) => s + o.qty, 0);
    $('#statOrders').textContent = totalOrders;
    $('#statRevenue').textContent = fmt(revenue);
    $('#statItems').textContent = items;
    $('#statAvg').textContent = fmt(totalOrders ? Math.round(revenue / totalOrders) : 0);
  }

  function showDashboard() {
    adminLogin.hidden = true;
    adminDash.hidden = false;
    renderStats();
    renderOrders();
    renderManage();
  }

  function showLogin() {
    adminDash.hidden = true;
    adminLogin.hidden = false;
  }

  function renderManage() {
    const list = getProducts();
    $('#manageCount').textContent = list.length;
    if (list.length === 0) {
      $('#productManageList').innerHTML = '<p class="manage-empty">No products yet — add one on the left.</p>';
      return;
    }
    $('#productManageList').innerHTML = list.map((p) =>
      '<div class="manage-item" data-id="' + p.id + '">' +
        '<div class="manage-thumb"><img src="' + resolveImage(p) + '" alt=""></div>' +
        '<div class="manage-info"><strong>' + p.name + '</strong><span>' + fmt(p.price) + '</span></div>' +
        '<button class="manage-del" data-del="' + p.id + '" aria-label="Delete ' + p.name + '" title="Delete product">×</button>' +
      '</div>'
    ).join('');
  }

  function renderOrders() {
    const all = getOrders().slice().sort((a, b) => b.ts - a.ts);
    $('#ordersCount').textContent = all.length;
    if (all.length === 0) {
      $('#ordersList').innerHTML = '<p class="manage-empty">No orders yet.</p>';
      return;
    }
    const rows = all.slice(0, 8).map((o) => {
      const p = getProduct(o.productId);
      const date = new Date(o.ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return (
        '<div class="orders-row">' +
          '<span class="ord-id">' + o.id + '</span>' +
          '<span>' + (p ? p.name : '—') + '</span>' +
          '<span>' + o.qty + '</span>' +
          '<span class="ord-amt">' + fmt(o.amount) + '</span>' +
          '<span>' + date + '</span>' +
        '</div>'
      );
    }).join('');
    $('#ordersList').innerHTML =
      '<div class="orders-table">' +
        '<div class="orders-row orders-head"><span>Order</span><span>Product</span><span>Qty</span><span>Amount</span><span>Date</span></div>' +
        rows +
      '</div>';
  }

  $('#adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#adminPassword').value === ADMIN_PASS) {
      sessionStorage.setItem(K.ADMIN, '1');
      adminError.hidden = true;
      $('#adminPassword').value = '';
      showDashboard();
      toast('Welcome back, admin', 'success');
    } else {
      adminError.hidden = false;
      $('#adminPassword').value = '';
    }
  });

  $('#adminLogout').addEventListener('click', () => {
    sessionStorage.removeItem(K.ADMIN);
    showLogin();
    toast('Dashboard locked');
  });

  $('#addProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('#pTitle').value.trim();
    const brand = $('#pBrand').value.trim();
    const price = Number($('#pPrice').value);
    if (!title || !brand || !price || price <= 0) {
      toast('Title, brand and a valid BDT price are required', 'error');
      return;
    }
    const list = getProducts();
    list.unshift({
      id: Date.now(),
      name: title,
      brand,
      category: $('#pCategory').value,
      price,
      oldPrice: null,
      movement: $('#pMovement').value,
      glass: $('#pGlass').value,
      water: $('#pWater').value,
      strap: $('#pStrap').value,
      case: $('#pCase').value,
      image: $('#pImage').value.trim() || null,
      tag: $('#pTag').value.trim() || null
    });
    saveProducts(list);
    renderProducts(getProducts());
    applyFilter();
    renderCompare();
    renderManage();
    renderMarquee();
    $('#addProductForm').reset();
    toast('"' + title + '" added to the collection', 'success');
  });

  $('#productManageList').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    const id = Number(btn.dataset.del);
    const p = getProduct(id);
    if (!confirm('Delete "' + (p ? p.name : 'this product') + '" from the collection?')) return;
    saveProducts(getProducts().filter((x) => String(x.id) !== String(id)));
    renderProducts(getProducts());
    applyFilter();
    renderCompare();
    renderManage();
    renderMarquee();
    toast('Product deleted', 'success');
  });

  /* ----------------------------- Mobile nav ------------------------------- */

  const navToggle = $('#navToggle');
  const mobileNav = $('#mobileNav');

  function closeMobileNav() {
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  navToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
  });

  $$('.mobile-nav .nav-link').forEach((link) => link.addEventListener('click', closeMobileNav));

  /* ------------------------------- Scrollspy ------------------------------ */

  const navSections = $$('main section[id]');

  function updateActiveLink() {
    const pos = window.scrollY + 120;
    let currentId = navSections[0] ? navSections[0].id : 'home';
    navSections.forEach((sec) => {
      if (sec.offsetTop <= pos) currentId = sec.id;
    });
    $$('.nav-link').forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + currentId);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* --------------------------------- Init --------------------------------- */

  $('#year').textContent = new Date().getFullYear();
  renderProducts(getProducts());
  renderMarquee();
  renderCompare();
  renderReviews();
  renderCart();
  paintStars();
  if (isAdmin()) {
    showDashboard();
  } else {
    showLogin();
  }
})();
