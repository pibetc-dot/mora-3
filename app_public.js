// ========== STORAGE ==========
const STORAGE = { 
  settings: 'moraSettingsV2', 
  cart: 'moraCartV2',
  orders: 'moraOrdersV2',
  webhook: 'moraWebhookV2'
};

const DEFAULT_SETTINGS = {
  businessName: 'Mora Hamburguesas',
  whatsappNumber: '5491169347203',
  currency: '$',
  pickupLabel: 'Retiro por local',
  deliveryLabel: 'Delivery',
  paymentMethods: ['Transferencia', 'Efectivo', 'Mercado Pago'],
  deliveryZones: [
    { id: 'z1', name: 'Zona 1', price: 0 },
    { id: 'z2', name: 'Zona 2', price: 0 }
  ],
  products: [
    { id: 1, category: 'Hamburguesas', name: 'Mora Clásica', desc: 'Carne, lechuga, tomate y cebolla', price: 350, emoji: '🍔', image: '', extras: [] },
    { id: 2, category: 'Hamburguesas', name: 'Mora Cheese', desc: 'Carne, cheddar, lechuga y tomate', price: 400, emoji: '🧀', image: '', extras: [] },
    { id: 3, category: 'Hamburguesas', name: 'Mora Completa', desc: 'Carne, queso, panceta, huevo y lechuga', price: 450, emoji: '⭐', image: '', extras: [] },
    { id: 4, category: 'Hamburguesas', name: 'Mora Bacon', desc: 'Carne, panceta crocante, queso y tomate', price: 420, emoji: '🥓', image: '', extras: [] },
    { id: 5, category: 'Papas', name: 'Papas Mora', desc: 'Porción de papas fritas', price: 150, emoji: '🍟', image: '', extras: [] },
    { id: 6, category: 'Bebidas', name: 'Bebida 500 ml', desc: 'Gaseosa o agua', price: 80, emoji: '🥤', image: '', extras: [] }
  ]
};

// ========== ESTADO ==========
let settings = loadSettings();
let cart = loadJSON(STORAGE.cart, []);
let selectedProduct = null;
let activeCategory = 'Todos';

// ========== UTILIDADES ==========
function loadJSON(key, fallback) { try { const x = JSON.parse(localStorage.getItem(key)); return x ?? fallback; } catch { return fallback; } }
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function deepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function loadSettings() {
  const saved = loadJSON(STORAGE.settings, null);
  return saved ? { ...deepCopy(DEFAULT_SETTINGS), ...saved, products: saved.products || deepCopy(DEFAULT_SETTINGS.products), deliveryZones: saved.deliveryZones || deepCopy(DEFAULT_SETTINGS.deliveryZones), paymentMethods: saved.paymentMethods || deepCopy(DEFAULT_SETTINGS.paymentMethods) } : deepCopy(DEFAULT_SETTINGS);
}
function money(n) { return `${settings.currency}${Number(n || 0).toLocaleString('es-AR')}`; }
function esc(v) { return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function product(id) { return settings.products.find(p => Number(p.id) === Number(id)); }
function categories() { return ['Todos', ...new Set(settings.products.map(p => p.category).filter(Boolean))]; }
function cartCount() { return cart.reduce((s,i)=>s+i.qty,0); }
function cartSubtotal() { return cart.reduce((s,i)=>s+i.unitPrice*i.qty,0); }
function selectedDeliveryPrice() { if (document.getElementById('fulfillment')?.value !== 'delivery') return 0; const z = settings.deliveryZones.find(x=>x.id === document.getElementById('deliveryZone')?.value); return Number(z?.price || 0); }
function total() { return cartSubtotal() + selectedDeliveryPrice(); }
function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }

function renderCategories() {
  document.getElementById('categoryTabs').innerHTML = categories().map(c=>`<button class="category-tab ${c===activeCategory?'active':''}" data-category="${esc(c)}" type="button">${esc(c)}</button>`).join('');
}

function renderMenu() {
  const list = settings.products.filter(p=>activeCategory==='Todos' || p.category===activeCategory);
  document.getElementById('menu').innerHTML = list.length ? list.map(p=>`
    <article class="product-card">
      <button class="product-open" data-product="${p.id}" type="button">
        <div class="product-image">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : `<span>${esc(p.emoji || '🍔')}</span>`}</div>
        <div class="product-info"><div class="product-top"><span class="product-category">${esc(p.category)}</span><strong>${money(p.price)}</strong></div><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p></div>
      </button>
      <button class="quick-add" data-quick-add="${p.id}" type="button">+ Agregar</button>
    </article>`).join('') : '<div class="empty-state">Todavía no hay productos.</div>';
}

function renderFormOptions() {
  document.getElementById('fulfillment').innerHTML = `<option value="pickup">${esc(settings.pickupLabel)}</option><option value="delivery">${esc(settings.deliveryLabel)}</option>`;
  document.getElementById('payment').innerHTML = settings.paymentMethods.map(p=>`<option>${esc(p)}</option>`).join('');
  document.getElementById('deliveryZone').innerHTML = settings.deliveryZones.map(z=>`<option value="${esc(z.id)}">${esc(z.name)}${z.price ? ` — ${money(z.price)}` : ''}</option>`).join('');
  updateDeliveryVisibility();
}

function renderCart() {
  document.getElementById('cartCount').textContent = cartCount();
  const box = document.getElementById('cart');
  if (!cart.length) box.innerHTML = '<div class="empty-cart">Tu carrito está vacío.<br><span>Elegí algo del menú y aparece acá 🍔</span></div>';
  else box.innerHTML = cart.map(i=>`<div class="cart-row"><div class="cart-main"><strong>${esc(i.name)}</strong><small>${money(i.unitPrice)} c/u</small></div><div class="qty"><button data-change="-1" data-key="${esc(i.key)}">−</button><b>${i.qty}</b><button data-change="1" data-key="${esc(i.key)}">+</button></div><strong class="row-price">${money(i.unitPrice*i.qty)}</strong><button class="remove" data-remove="${esc(i.key)}">×</button></div>`).join('');
  document.getElementById('summary').innerHTML = `<div><span>Productos</span><strong>${money(cartSubtotal())}</strong></div>${document.getElementById('fulfillment').value==='delivery'?`<div><span>Delivery</span><strong>${selectedDeliveryPrice()?money(selectedDeliveryPrice()):'Gratis'}</strong></div>`:''}<div class="grand"><span>Total</span><strong>${money(total())}</strong></div>`;
  document.getElementById('whatsapp').disabled = !cart.length;
}

function updateDeliveryVisibility() { document.getElementById('deliveryFields').hidden = document.getElementById('fulfillment').value !== 'delivery'; renderCart(); }

function openProduct(id) {
  selectedProduct = product(id); if (!selectedProduct) return;
  document.getElementById('modalCategory').textContent = selectedProduct.category || 'MORA';
  document.getElementById('modalTitle').textContent = selectedProduct.name;
  document.getElementById('modalDesc').textContent = selectedProduct.desc;
  document.getElementById('modalImage').innerHTML = selectedProduct.image ? `<img src="${esc(selectedProduct.image)}" alt="${esc(selectedProduct.name)}">` : esc(selectedProduct.emoji || '🍔');
  document.getElementById('modalPrice').textContent = money(selectedProduct.price);
  const options = selectedProduct.extras || [];
  document.getElementById('modalOptions').innerHTML = options.length ? `<div class="option-title">Extras</div>${options.map((x,i)=>`<label class="check-option"><input type="checkbox" data-extra-index="${i}"><span>${esc(x.name)}</span><b>+${money(x.price)}</b></label>`).join('')}` : '';
  setModal('productModal', true);
}

function setModal(id, open) { const m=document.getElementById(id); m.classList.toggle('open',open); m.setAttribute('aria-hidden',String(!open)); document.body.classList.toggle('modal-open',open); }

function addProduct(id, extras=[]) {
  const p=product(id); if(!p) return;
  const extraTotal=extras.reduce((s,x)=>s+Number(x.price||0),0); const key=`${p.id}|${extras.map(x=>x.name).sort().join(',')}`; const existing=cart.find(x=>x.key===key);
  if(existing) existing.qty++; else cart.push({key,id:p.id,name:p.name,unitPrice:Number(p.price)+extraTotal,qty:1,extras});
  saveJSON(STORAGE.cart,cart); renderCart(); toast('✅ Agregado');
}

function buildMessage() {
  const name=document.getElementById('name').value.trim(), phone=document.getElementById('phone').value.trim();
  const delivery=document.getElementById('fulfillment').value==='delivery'; const address=document.getElementById('address').value.trim();
  const zone=settings.deliveryZones.find(z=>z.id===document.getElementById('deliveryZone').value); const payment=document.getElementById('payment').value; const notes=document.getElementById('notes').value.trim();
  let message = `🍔 *${esc(settings.businessName).toUpperCase()}*\n\n`;
  message += `*Cliente:* ${esc(name)}\n`;
  if (phone) message += `*WhatsApp:* ${esc(phone)}\n`;
  if (delivery && address) message += `*Dirección:* ${esc(address)}\n`;
  if (delivery && zone) message += `*Zona:* ${esc(zone.name)}\n`;
  message += `*Pago:* ${esc(payment)}\n\n`;
  message += `*PRODUCTOS:*\n`;
  cart.forEach(item => { message += `• ${esc(item.name)} x${item.qty} = ${money(item.unitPrice*item.qty)}\n`; });
  message += `\n*TOTAL: ${money(total())}*\n\n`;
  if (notes) message += `*Notas:* ${esc(notes)}\n`;
  return { message, name, phone, address, payment, total: total(), date: new Date().toLocaleString('es-AR') };
}

function sendOrder() {
  if (!document.getElementById('name').value.trim()) { toast('❌ Nombre requerido'); return; }
  if (!document.getElementById('phone').value.trim()) { toast('❌ WhatsApp requerido'); return; }
  if (document.getElementById('fulfillment').value === 'delivery' && !document.getElementById('address').value.trim()) { toast('❌ Dirección requerida'); return; }
  if (!cart.length) { toast('❌ Carrito vacío'); return; }
  
  const { message, name, phone, address, payment, total, date } = buildMessage();
  const orders = loadJSON(STORAGE.orders, []);
  orders.push({ name, phone, address, payment, total, date });
  saveJSON(STORAGE.orders, orders);
  
  const webhook = loadJSON(STORAGE.webhook, '');
  if (webhook) {
    fetch(webhook, {
      method: 'POST',
      body: JSON.stringify({ name, phone, address, payment, total, date, products: cart.map(i => `${i.name} x${i.qty}`).join(', ') })
    }).catch(e => console.log('Webhook:', e));
  }
  
  const encodedMessage = encodeURIComponent(message);
  window.location.href = `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`;
  
  setTimeout(() => {
    cart = [];
    saveJSON(STORAGE.cart, cart);
    renderCart();
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('address').value = '';
    document.getElementById('notes').value = '';
  }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-product]')) openProduct(e.target.closest('[data-product]').dataset.product);
    if (e.target.closest('[data-quick-add]')) addProduct(e.target.closest('[data-quick-add]').dataset.quickAdd);
    if (e.target.closest('.category-tab')) {
      activeCategory = e.target.closest('.category-tab').dataset.category;
      renderCategories();
      renderMenu();
    }
    if (e.target.closest('[data-change]')) {
      const key = e.target.closest('[data-change]').dataset.key;
      const change = Number(e.target.closest('[data-change]').dataset.change);
      const item = cart.find(i => i.key === key);
      if (item) { item.qty = Math.max(1, item.qty + change); saveJSON(STORAGE.cart, cart); renderCart(); }
    }
    if (e.target.closest('[data-remove]')) {
      const key = e.target.closest('[data-remove]').dataset.remove;
      cart = cart.filter(i => i.key !== key);
      saveJSON(STORAGE.cart, cart);
      renderCart();
    }
    if (e.target.closest('[data-close-modal]')) setModal('productModal', false);
  });
  
  document.getElementById('modalAdd').addEventListener('click', () => {
    const extras = Array.from(document.querySelectorAll('[data-extra-index]:checked')).map(cb => {
      const idx = Number(cb.dataset.extraIndex);
      return selectedProduct.extras[idx];
    });
    addProduct(selectedProduct.id, extras);
    setModal('productModal', false);
  });
  
  document.getElementById('fulfillment').addEventListener('change', updateDeliveryVisibility);
  document.getElementById('menuCta').addEventListener('click', () => document.getElementById('menuSection').scrollIntoView({ behavior: 'smooth' }));
  document.getElementById('cartBtn').addEventListener('click', () => document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' }));
  document.getElementById('whatsapp').addEventListener('click', sendOrder);
  
  renderCategories();
  renderMenu();
  renderFormOptions();
  renderCart();
});
