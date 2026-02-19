// ============================================
// CARRITO DE COMPRAS - Módulo separado
// ============================================

class ShoppingCart {
    constructor() {
        this.items = this.loadFromStorage();
        this.cartModal = document.getElementById('cartModal');
        this.cartOverlay = document.getElementById('cartOverlay');
    }

    add(product) {
        const existing = this.items.find(item => item.title === product.title);
        if (existing) {
            existing.quantity++;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.save();
        this.updateUI();
        this.showNotification(`${product.title} añadido al carrito`);
    }

    remove(productTitle) {
        this.items = this.items.filter(item => item.title !== productTitle);
        this.save();
        this.updateUI();
        this.showNotification('Producto eliminado');
    }

    updateQuantity(productTitle, qty) {
        const item = this.items.find(i => i.title === productTitle);
        if (item) {
            item.quantity = Math.max(1, qty);
            if (item.quantity === 0) {
                this.remove(productTitle);
            } else {
                this.save();
                this.updateUI();
            }
        }
    }

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    loadFromStorage() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }

    updateUI() {
        this.updateCount();
        this.updateCartDisplay();
    }

    updateCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    }

    updateCartDisplay() {
        const cartItemsList = document.getElementById('cartItemsList');
        
        if (this.items.length === 0) {
            cartItemsList.innerHTML = '<p class="text-center py-8">Tu carrito está vacío</p>';
        } else {
            cartItemsList.innerHTML = this.items.map(item => this.createCartItemHTML(item)).join('');
        }
        
        this.updateCartSummary();
    }

    createCartItemHTML(item) {
        return `
            <div class="flex gap-4 p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors" data-product="${item.title}">
                <img src="${item.image}" alt="${item.title}" class="w-20 h-20 object-cover rounded">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-white">${item.title}</h3>
                    <p class="text-blue-400 font-bold text-lg">${item.price}€</p>
                    <div class="flex gap-2 items-center mt-3">
                        <button class="qty-btn minus-btn px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition" data-product="${item.title}">−</button>
                        <span class="px-4 py-1 bg-slate-800 rounded">${item.quantity}</span>
                        <button class="qty-btn plus-btn px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition" data-product="${item.title}">+</button>
                        <button class="remove-item-btn ml-4 px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition" data-product="${item.title}">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }

    updateCartSummary() {
        const fmt = (n) => n.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        const sub = this.getSubtotal();
        const disc = sub > 50 ? sub * 0.1 : 0;
        const total = sub - disc;
        
        const subtotalEl = document.getElementById('subtotal');
        const discountsEl = document.getElementById('discounts');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = fmt(sub) + ' €';
        if (discountsEl) discountsEl.textContent = '-' + fmt(disc) + ' €';
        if (totalEl) totalEl.textContent = fmt(total) + ' €';
        
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.items.length === 0;
        }
    }

    openCart() {
        if (this.cartModal) this.cartModal.classList.add('active');
        if (this.cartOverlay) this.cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        if (this.cartModal) this.cartModal.classList.remove('active');
        if (this.cartOverlay) this.cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    showNotification(msg) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-5 right-5 px-4 py-3 bg-emerald-500 text-white rounded-lg shadow-lg z-50 animate-slide-in';
        notification.textContent = msg;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}
