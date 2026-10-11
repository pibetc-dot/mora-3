# 📁 Estructura de la App Mora Hamburguesas

## 🎯 VERSIONES DISPONIBLES

### **OPCIÓN 1: SEPARADO (Recomendado)**

Dos archivos HTML diferentes:

#### **`index.html` + `app_public.js`** (Para CLIENTES)
- URL: `https://morahamburguesas.vercel.app/`
- Solo menú + carrito + pedidos
- Sin login, sin admin
- Limpio y directo

#### **`admin.html` + `app_admin_only.js`** (Para TI)
- URL: `https://morahamburguesas.vercel.app/admin.html`
- Login con usuario/contraseña
- Panel completo de control
- Gestión de productos, zonas, webhook de Google Sheets

---

### **OPCIÓN 2: COMBINADO**

#### **`index_secure.html` + `app_secure.js`**
- Todo en un lugar
- Login cuando necesites
- Clientes ven la app pública, vos accedes al admin desde un botón oculto

---

## 📋 ARCHIVOS

### **Cliente (Público)**
- `index_public.html` - HTML de la app pública
- `app_public.js` - Lógica de menú, carrito, WhatsApp

### **Admin (Privado)**
- `index_admin_login.html` - HTML con login
- `app_admin_only.js` - Login + Panel de control

### **Estilos**
- `styles_secure.css` - CSS para ambas versiones

---

## 🚀 CÓMO CONFIGURAR EN GITHUB

### **Opción 1: Separado (Mi recomendación)**

```
En tu repo GitHub:
├── index.html (=index_public.html)
├── admin.html (=index_admin_login.html)
├── app_public.js
├── app_admin_only.js
└── styles.css (=styles_secure.css)
```

**URLs en Vercel:**
- App pública: `morahamburguesas.vercel.app` (o raíz)
- Panel admin: `morahamburguesas.vercel.app/admin.html`

---

## 🔐 CREDENCIALES DEFAULT

```javascript
Usuario: admin
Contraseña: mora2022
```

**Cambiar en `app_admin_only.js` (líneas 8-11):**

```javascript
const ADMIN_CREDENTIALS = {
  user: "admin",
  pass: "mora2022"
};
```

---

## 📊 FUNCIONALIDADES

### **App Pública (`app_public.js`)**
✅ Ver menú por categorías
✅ Agregar al carrito
✅ Enviar pedido por WhatsApp
✅ Cálculo automático de delivery
✅ Guardado en localStorage (por si refrescan)

### **Panel Admin (`app_admin_only.js`)**
✅ Login protegido
✅ Editar nombre del negocio
✅ Editar número de WhatsApp
✅ Agregar/eliminar productos
✅ Gestionar zonas de delivery
✅ **Google Sheets webhook** (guardar pedidos automáticamente)
✅ Ver historial de pedidos

---

## 🌐 GOOGLE SHEETS INTEGRACIÓN

1. **En el panel admin** → Tab "Google Sheets"
2. **Pega la URL del webhook**
3. Los pedidos se guardan automáticamente en tu Google Sheet

(Te ayudo a crear el Google Apps Script después)

---

## 📱 RESPONSIVE

- ✅ Mobile first
- ✅ Funciona en cualquier dispositivo
- ✅ Optimizado para WhatsApp Web

---

## 🎨 COLORES

```
Verde Mora: #1a5f3f
Verde claro: #2a7f5f
Gris claro: #f9f9f9
```

Todos configurables en el CSS.

---

## ⚙️ STORAGE (Datos Locales)

Los datos se guardan en `localStorage` del navegador:

```javascript
moraSettingsV2     // Configuración
moraCartV2         // Carrito actual
moraOrdersV2       // Historial de pedidos
moraWebhookV2      // URL de Google Sheets
moraLoginAdminV2   // Estado de login
```

---

## 💡 FLUJO DE USO

### **Cliente:**
1. Abre `morahamburguesas.vercel.app`
2. Ve el menú
3. Agrega al carrito
4. Completa datos
5. Envía por WhatsApp

### **Vos (Admin):**
1. Abre `/admin.html`
2. Login con usuario/contraseña
3. Gestiona todo
4. Los cambios se guardan en localStorage
5. Próxima vez que entres, siguen igual

---

## 📝 PRÓXIMOS PASOS

1. ✅ Subir archivos a GitHub
2. ✅ Cambiar credenciales
3. ⏳ Configurar Google Sheets webhook
4. ⏳ Agregar fotos reales de productos
5. ⏳ Personalizar estilos (colores, tipografía)

