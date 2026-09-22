const CART_KEY = 'fg_cart';
function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount() }
function updateCartCount() { const count = getCart().reduce((s, p) => s + (p.qty || 1), 0); document.querySelectorAll('#cartCount').forEach(e => e.textContent = count) }
function addToCart(id) { const cart = getCart(); const found = cart.find(p => p.id === id); if (found) found.qty++; else { const p = PRODUCTS.find(x => x.id === id); if (p) cart.push({ ...p, qty: 1 }) } saveCart(cart); showToast('Producto agregado a la cotización') }
function showToast(text) { const e = document.getElementById('toast'); if (!e) return; e.textContent = text; e.style.display = 'block'; setTimeout(() => e.style.display = 'none', 2200) }
document.addEventListener('DOMContentLoaded', () => { updateCartCount(); const toggle = document.getElementById('menuToggle'), nav = document.getElementById('mainNav'); if (toggle) toggle.onclick = () => nav.classList.toggle('open') });
