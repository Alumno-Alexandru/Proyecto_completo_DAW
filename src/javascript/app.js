// ============================================
// CARRITO DE COMPRAS
// ============================================
// Clase principal para gestionar el carrito
class ShoppingCart {
    constructor() {
        this.items = this.loadFromStorage();
        this.cartModal = document.getElementById('cartModal');
        this.cartOverlay = document.getElementById('cartOverlay');
    }

    // Añade un producto al carrito
    add(product) {
        const existing = this.items.find(item => item.title === product.title);
        if (existing) existing.quantity++;
        else this.items.push({ ...product, quantity: 1 });
        this.save();
        this.updateUI();
        this.showNotification(`${product.title} añadido al carrito`);
    }

    // Elimina un producto del carrito
    remove(productTitle) {
        this.items = this.items.filter(item => item.title !== productTitle);
        this.save();
        this.updateUI();
        this.showNotification('Producto eliminado');
    }

    // Actualiza la cantidad de un producto
    updateQuantity(productTitle, qty) {
        const item = this.items.find(i => i.title === productTitle);
        if (item) {
            item.quantity = Math.max(1, qty);
            if (item.quantity === 0) this.remove(productTitle);
            else {
                this.save();
                this.updateUI();
            }
        }
    }

    // Guarda y carga del localStorage
    save() { localStorage.setItem('cart', JSON.stringify(this.items)); }
    loadFromStorage() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
    
    // Actualiza toda la interfaz del carrito
    updateUI() {
        this.updateCount();
        this.updateCartDisplay();
    }

    // Actualiza el contador rojo del icono
    updateCount() {
        const count = this.items.reduce((s, i) => s + i.quantity, 0);
        const el = document.querySelector('.cart-count');
        if (el) el.textContent = count;
    }

    // Calcula el subtotal
    getSubtotal() { return this.items.reduce((s, i) => s + (parseFloat(i.price) * i.quantity), 0); }

    // Renderiza la lista de items en el modal
    updateCartDisplay() {
        const list = document.getElementById('cartItemsList');
        list.innerHTML = !this.items.length ? '<p class="text-center py-8">Tu carrito está vacío</p>' : 
            this.items.map(item => `<div class="cart-item" data-product="${item.title}"><img src="${item.image}" alt="${item.title}" class="cart-item-image"><div class="cart-item-details"><h3>${item.title}</h3><p>${item.price}€</p><button class="qty-btn minus-btn" data-product="${item.title}">-</button><span>${item.quantity}</span><button class="qty-btn plus-btn" data-product="${item.title}">+</button><button class="remove-item-btn" data-product="${item.title}">🗑️</button></div></div>`).join('');
        this.updateCartSummary();
    }

    // Actualiza los totales y descuentos
    updateCartSummary() {
        const fmt = (n) => n.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        const sub = this.getSubtotal();
        const disc = sub > 50 ? sub * 0.1 : 0;
        const total = sub - disc;
        
        const els = { subtotal: document.getElementById('subtotal'), total: document.getElementById('total'), discounts: document.getElementById('discounts') };
        if (els.subtotal) els.subtotal.textContent = fmt(sub) + ' €';
        if (els.discounts) els.discounts.textContent = '-' + fmt(disc) + ' €';
        if (els.total) els.total.textContent = fmt(total) + ' €';
        
        const btn = document.querySelector('.checkout-btn');
        if (btn) btn.disabled = this.items.length === 0;
    }

    // Abre el modal
    openCart() {
        this.cartModal?.classList.add('active');
        this.cartOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Cierra el modal
    closeCart() {
        this.cartModal?.classList.remove('active');
        this.cartOverlay?.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Muestra notificación temporal
    showNotification(msg) {
        const el = document.createElement('div');
        el.className = 'notification';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }
}


// ============================================
// LISTA DE DESEOS
// ============================================
// Clase para gestionar favoritos
class Wishlist {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('wishlist') || '[]');
    }
    toggle(title) {
        const idx = this.items.indexOf(title);
        if (idx > -1) this.items.splice(idx, 1);
        else this.items.push(title);
        this.save();
    }
    has(title) { return this.items.includes(title); }
    save() { localStorage.setItem('wishlist', JSON.stringify(this.items)); }
}

// ============================================
// EFECTOS Y BÚSQUEDA
// ============================================
// Clase para gestionar productos y filtrado
class ProductManager {
    constructor() {
        this.cards = document.querySelectorAll('.juego-card');
        this.search = document.querySelector('.search-input');
        if (this.search) this.search.addEventListener('input', e => this.filterProducts(e.target.value));
    }

    // Resalta una tarjeta
    highlightCard(card) {
        this.cards.forEach(c => c.classList.remove('active', 'dimmed'));
        card.classList.add('active');
    }

    // Filtra productos por texto
    filterProducts(query) {
        const q = query.toLowerCase();
        this.cards.forEach(card => {
            const title = card.querySelector('.juego-titulo')?.textContent.toLowerCase() || '';
            const label = card.querySelector('.juego-etiqueta')?.textContent.toLowerCase() || '';
            card.style.display = (title.includes(q) || label.includes(q)) ? '' : 'none';
        });
    }
}

// ============================================
// NAVEGACIÓN
// ============================================
// Clase para gestionar enlaces activos
class Navigation {
    constructor() {
        const path = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.href.includes(path)) link.classList.add('active');
        });
    }
}

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
let cart, wishlist;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    wishlist = new Wishlist();
    new ProductManager();
    new Navigation();

    // Eventos del carrito
    document.querySelector('.cart-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        cart.openCart();
    });
    
    document.querySelector('.close-cart-btn')?.addEventListener('click', () => cart.closeCart());
    document.getElementById('cartOverlay')?.addEventListener('click', () => cart.closeCart());
    document.querySelector('.continue-shopping-btn')?.addEventListener('click', () => cart.closeCart());

    // Delegación: botones de cantidad
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('minus-btn')) {
            const title = e.target.dataset.product;
            const item = cart.items.find(i => i.title === title);
            if (item) cart.updateQuantity(title, item.quantity - 1);
        }
        if (e.target.classList.contains('plus-btn')) {
            const title = e.target.dataset.product;
            const item = cart.items.find(i => i.title === title);
            if (item) cart.updateQuantity(title, item.quantity + 1);
        }
        if (e.target.classList.contains('remove-item-btn')) {
            cart.remove(e.target.dataset.product);
        }
    });

    // Botón checkout
    document.querySelector('.checkout-btn')?.addEventListener('click', () => {
        if (cart.items.length === 0) return;
        const total = cart.getSubtotal();
        cart.showNotification(`Procesando pago de ${total.toLocaleString('es-ES', {minimumFractionDigits: 2})}€...`);
        setTimeout(() => {
            cart.showNotification('¡Compra realizada con éxito!');
            cart.items = [];
            cart.save();
            cart.updateUI();
            cart.closeCart();
        }, 2000);
    });

    // Botones de producto
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const card = e.target.closest('.juego-card');
            cart.add({
                title: card.querySelector('.juego-titulo')?.textContent,
                price: card.dataset.price,
                image: card.querySelector('.juego-imagen')?.src
            });
        }
        if (e.target.classList.contains('wishlist-btn')) {
            const card = e.target.closest('.juego-card');
            const title = card.querySelector('.juego-titulo')?.textContent;
            wishlist.toggle(title);
            e.target.classList.toggle('active');
            cart.showNotification(e.target.classList.contains('active') ? '❤️ Añadido' : '💔 Eliminado');
        }
    });

    // Perfil
    document.querySelector('.profile-btn')?.addEventListener('click', () => {
        if (window.auth?.showProfile) auth.showProfile();
        else if (window.auth?.showAuthModal) auth.showAuthModal('login');
    });

    // Menú hamburguesa
    const burger = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    if (burger && menu) {
        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
            burger.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!burger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
                burger.classList.remove('active');
            }
        });
    }

    cart.updateUI();
});