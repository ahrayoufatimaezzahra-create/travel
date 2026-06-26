// ============================================================
// OREBOL.COM — App Logic
// ============================================================

const PRODUCTS = [
  { id: 1, name: 'Canvas Tote Bag', category: 'accessories', price: 39.99, oldPrice: 59.99, emoji: '👜', rating: 4.8, reviews: 312, badge: 'Sale' },
  { id: 2, name: 'Linen Shirt', category: 'clothing', price: 64.99, oldPrice: null, emoji: '👕', rating: 4.6, reviews: 187, badge: 'New' },
  { id: 3, name: 'Running Sneakers', category: 'footwear', price: 119.99, oldPrice: 149.99, emoji: '👟', rating: 4.9, reviews: 504, badge: 'Sale' },
  { id: 4, name: 'Ceramic Vase Set', category: 'home', price: 48.99, oldPrice: null, emoji: '🏺', rating: 4.7, reviews: 93, badge: 'New' },
  { id: 5, name: 'Gold Hoop Earrings', category: 'accessories', price: 29.99, oldPrice: 44.99, emoji: '💛', rating: 4.8, reviews: 261, badge: 'Sale' },
  { id: 6, name: 'Wool Trench Coat', category: 'clothing', price: 189.99, oldPrice: null, emoji: '🧥', rating: 4.9, reviews: 134, badge: 'Top Pick' },
  { id: 7, name: 'Leather Chelsea Boots', category: 'footwear', price: 154.99, oldPrice: 199.99, emoji: '👢', rating: 4.7, reviews: 228, badge: 'Sale' },
  { id: 8, name: 'Scented Candle', category: 'home', price: 22.99, oldPrice: null, emoji: '🕯️', rating: 4.6, reviews: 417, badge: null },
];

let cart = [];
let activeFilter = 'all';

// ── RENDER PRODUCTS ─────────────────────────────────────────
function renderProducts(filter) {
  const grid = document.getElementById('productsGrid');
  const items = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  grid.innerHTML = items.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-card__img" style="background:${getBg(p.category)}">
        ${p.badge ? `<div class="product-card__badge">${p.badge}</div>` : ''}
        <span>${p.emoji}</span>
      </div>
      <div class="product-card__body">
        <div class="product-card__cat">${p.category}</div>
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__rating">
          <span class="stars">★★★★★</span>
          ${p.rating} (${p.reviews})
        </div>
        <div class="product-card__footer">
          <div class="product-card__price">
            ${p.oldPrice ? `<del>$${p.oldPrice}</del>` : ''}
            $${p.price.toFixed(2)}
          </div>
          <button class="btn-add" data-id="${p.id}" aria-label="Add to cart">+</button>
        </div>
      </div>
    </div>
  `).join('');

  // Add to cart listeners
  grid.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.id)));
  });
}

function getBg(cat) {
  const map = { accessories: '#fef3c7', clothing: '#e0f2fe', footwear: '#f3e8ff', home: '#dcfce7' };
  return map[cat] || '#f1f5f9';
}

// ── FILTER ──────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderProducts(activeFilter);
  });
});

// Category cards filter
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    const filter = card.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === filter);
    });
    activeFilter = filter;
    renderProducts(activeFilter);
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  });
});

// ── CART ─────────────────────────────────────────────────────
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
  showToast(`${product.name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartItemCount').textContent = count;
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;

  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footerEl.style.display = 'none';
  } else {
    footerEl.style.display = 'block';
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item__emoji">${item.emoji}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">$${(item.price * item.qty).toFixed(2)}</div>
          <div class="cart-item__qty">
            <button onclick="changeQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${item.id}, 1)">+</button>
            <span class="cart-item__remove" onclick="removeFromCart(${item.id})">Remove</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// ── CART SIDEBAR TOGGLE ──────────────────────────────────────
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCartFn() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartFn);
cartOverlay.addEventListener('click', closeCartFn);

// ── MOBILE NAV ───────────────────────────────────────────────
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

// ── TOAST ────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── NEWSLETTER ───────────────────────────────────────────────
document.getElementById('newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  showToast('Thanks for subscribing! 🎉');
  e.target.reset();
});

// ── CONTACT ──────────────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  showToast('Message sent! We\'ll reply within 24h.');
  e.target.reset();
});

// ── INIT ─────────────────────────────────────────────────────
renderProducts('all');
