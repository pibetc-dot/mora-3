// ========== CREDENCIALES DE ADMIN (CAMBIAR ESTOS) ==========
const ADMIN_CREDENTIALS = {
  user: "admin",
  pass: "mora2022"
};

// ========== STORAGE ==========
const STORAGE = { 
  settings: 'moraSettingsV2', 
  orders: 'moraOrdersV2',
  webhook: 'moraWebhookV2',
  login: 'moraLoginAdminV2'
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
let isLoggedIn = loadJSON(STORAGE.login, false);

// ========== UTILIDADES ==========
function loadJSON(key, fallback) { 
  try { 
    const x = JSON.parse(localStorage.getItem(key)); 
    return x ?? fallback; 
  } catch { 
    return fallback; 
  } 
}

function saveJSON(key, value) { 
  localStorage.setItem(key, JSON.stringify(value)); 
}

function deepCopy(x) { 
  return JSON.parse(JSON.stringify(x)); 
}

function loadSettings() {
  const saved = loadJSON(STORAGE.settings, null);
  return saved ? { 
    ...deepCopy(DEFAULT_SETTINGS), 
    ...saved, 
    products: saved.products || deepCopy(DEFAULT_SETTINGS.products), 
    deliveryZones: saved.deliveryZones || deepCopy(DEFAULT_SETTINGS.deliveryZones), 
    paymentMethods: saved.paymentMethods || deepCopy(DEFAULT_SETTINGS.paymentMethods) 
  } : deepCopy(DEFAULT_SETTINGS);
}

function money(n) { 
  return `${settings.currency}${Number(n || 0).toLocaleString('es-AR')}`; 
}

function esc(v) { 
  return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); 
}

function toast(msg) { 
  const t = document.getElementById('toast'); 
  t.textContent = msg; 
  t.classList.add('show'); 
  setTimeout(() => t.classList.remove('show'), 3000); 
}

// ========== LOGIN ==========
function handleLogin(event) {
  event.preventDefault();
  
  const user = document.getElementById('user').value;
  const pass = document.getElementById('pass').value;
  
  if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
    isLoggedIn = true;
    saveJSON(STORAGE.login, true);
    showAdminScreen();
    toast('✅ Sesión iniciada');
  } else {
    toast('❌ Usuario o contraseña incorrectos');
    document.getElementById('pass').value = '';
  }
}

function logout() {
  isLoggedIn = false;
  saveJSON(STORAGE.login, false);
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('adminScreen').style.display = 'none';
  document.getElementById('loginForm').reset();
  toast('👋 Sesión cerrada');
}

function showAdminScreen() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminScreen').style.display = 'block';
  renderTabContent('business');
}

// ========== TABS ==========
function renderTabContent(tab) {
  const content = document.getElementById('tabContent');
  
  if (tab === 'business') {
    content.innerHTML = `
      <div class="admin-section">
        <h3>Configuración del negocio</h3>
        <div class="form-grid">
          <label>Nombre del negocio
            <input id="businessName" value="${esc(settings.businessName)}" type="text">
          </label>
          <label>Número de WhatsApp
            <input id="businessWhatsapp" value="${esc(settings.whatsappNumber)}" type="tel" placeholder="5491234567890">
          </label>
          <label>Moneda
            <input id="businessCurrency" value="${esc(settings.currency)}" type="text" maxlength="1">
          </label>
          <label>Label Retiro
            <input id="businessPickupLabel" value="${esc(settings.pickupLabel)}" type="text">
          </label>
          <label>Label Delivery
            <input id="businessDeliveryLabel" value="${esc(settings.deliveryLabel)}" type="text">
          </label>
        </div>
        <button class="btn btn-primary" onclick="saveBusinessSettings()">Guardar cambios</button>
      </div>
    `;
  } else if (tab === 'products') {
    content.innerHTML = `
      <div class="admin-section">
        <h3>Productos</h3>
        <div id="productsList"></div>
        <button class="btn btn-primary" onclick="addNewProduct()">+ Agregar producto</button>
      </div>
    `;
    renderProductsList();
  } else if (tab === 'zones') {
    content.innerHTML = `
      <div class="admin-section">
        <h3>Zonas de delivery</h3>
        <div id="zonesList"></div>
        <button class="btn btn-primary" onclick="addNewZone()">+ Agregar zona</button>
      </div>
    `;
    renderZonesList();
  } else if (tab === 'webhook') {
    const webhook = loadJSON(STORAGE.webhook, '');
    content.innerHTML = `
      <div class="admin-section">
        <h3>Google Sheets Webhook</h3>
        <p style="color: #666; margin-bottom: 1rem;">Pega aquí la URL del webhook para guardar pedidos en Google Sheets automáticamente.</p>
        <label>URL del Webhook
          <input id="webhookInput" value="${esc(webhook)}" type="text" placeholder="https://script.google.com/macros/d/..." style="width: 100%;">
        </label>
        <button class="btn btn-primary" onclick="saveWebhook()">Guardar</button>
      </div>
    `;
  } else if (tab === 'orders') {
    const orders = loadJSON(STORAGE.orders, []);
    content.innerHTML = `
      <div class="admin-section">
        <h3>Pedidos recibidos (${orders.length})</h3>
        <div id="ordersList" style="max-height: 500px; overflow-y: auto;">
          ${orders.length ? orders.reverse().map((o, i) => `
            <div style="padding: 1rem; background: #f9f9f9; margin-bottom: 0.5rem; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between;">
                <strong>${esc(o.name)}</strong>
                <strong>${money(o.total)}</strong>
              </div>
              <small>${esc(o.phone)}</small><br>
              <small style="color: #999;">${o.date}</small>
            </div>
          `).join('') : '<p>No hay pedidos aún.</p>'}
        </div>
      </div>
    `;
  }
}

function saveBusinessSettings() {
  settings.businessName = document.getElementById('businessName').value;
  settings.whatsappNumber = document.getElementById('businessWhatsapp').value;
  settings.currency = document.getElementById('businessCurrency').value;
  settings.pickupLabel = document.getElementById('businessPickupLabel').value;
  settings.deliveryLabel = document.getElementById('businessDeliveryLabel').value;
  saveJSON(STORAGE.settings, settings);
  toast('✅ Cambios guardados');
}

function saveWebhook() {
  const webhook = document.getElementById('webhookInput').value.trim();
  saveJSON(STORAGE.webhook, webhook);
  toast('✅ Webhook guardado');
}

function renderProductsList() {
  const list = document.getElementById('productsList');
  list.innerHTML = settings.products.map(p => `
    <div style="padding: 1rem; background: #f9f9f9; margin-bottom: 0.5rem; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <strong>${esc(p.name)}</strong><br>
          <small>${esc(p.category)}</small><br>
          <small style="color: #666;">${esc(p.desc)}</small><br>
          <strong style="color: #1a5f3f;">${money(p.price)}</strong>
        </div>
        <button class="btn btn-outline small" onclick="deleteProduct(${p.id})">✕</button>
      </div>
    </div>
  `).join('');
}

function deleteProduct(id) {
  if (confirm('¿Eliminar este producto?')) {
    settings.products = settings.products.filter(p => p.id !== id);
    saveJSON(STORAGE.settings, settings);
    renderProductsList();
    toast('✅ Producto eliminado');
  }
}

function addNewProduct() {
  const name = prompt('Nombre del producto:');
  if (!name) return;
  const id = Math.max(0, ...settings.products.map(p => p.id)) + 1;
  settings.products.push({
    id, category: 'Otros', name, desc: '', price: 0, emoji: '🍔', image: '', extras: []
  });
  saveJSON(STORAGE.settings, settings);
  renderProductsList();
  toast('✅ Producto agregado');
}

function renderZonesList() {
  const list = document.getElementById('zonesList');
  list.innerHTML = settings.deliveryZones.map(z => `
    <div style="padding: 1rem; background: #f9f9f9; margin-bottom: 0.5rem; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <strong>${esc(z.name)}</strong><br>
          <small>${money(z.price)}</small>
        </div>
        <button class="btn btn-outline small" onclick="deleteZone('${esc(z.id)}')">✕</button>
      </div>
    </div>
  `).join('');
}

function deleteZone(id) {
  if (confirm('¿Eliminar esta zona?')) {
    settings.deliveryZones = settings.deliveryZones.filter(z => z.id !== id);
    saveJSON(STORAGE.settings, settings);
    renderZonesList();
    toast('✅ Zona eliminada');
  }
}

function addNewZone() {
  const name = prompt('Nombre de la zona:');
  if (!name) return;
  const price = prompt('Precio del delivery:') || '0';
  settings.deliveryZones.push({
    id: 'z' + Date.now(), name, price: Number(price)
  });
  saveJSON(STORAGE.settings, settings);
  renderZonesList();
  toast('✅ Zona agregada');
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', function() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderTabContent(this.dataset.tab);
    });
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Mostrar login o admin
  if (isLoggedIn) {
    showAdminScreen();
  } else {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('adminScreen').style.display = 'none';
  }
});
