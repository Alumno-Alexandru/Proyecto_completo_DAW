// ============================================
// CARRITO DE COMPRAS
// ============================================
class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadFromStorage();
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
        this.updateCount();
        this.updateCartDisplay();
        this.showNotification(`${product.title} añadido al carrito`);
    }

    remove(productTitle) {
        this.items = this.items.filter(item => item.title !== productTitle);
        this.save();
        this.updateCount();
        this.updateCartDisplay();
        this.showNotification('Producto eliminado del carrito');
    }

    updateQuantity(productTitle, quantity) {
        const item = this.items.find(item => item.title === productTitle);
        if (item) {
            item.quantity = Math.max(1, quantity);
            if (item.quantity === 0) {
                this.remove(productTitle);
            } else {
                this.save();
                this.updateCartDisplay();
            }
        }
    }

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('cart');
        this.items = saved ? JSON.parse(saved) : [];
    }

    updateCount() {
        const total = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = total;
        }
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    }

    updateCartDisplay() {
        const cartItemsList = document.getElementById('cartItemsList');
        
        if (this.items.length === 0) {
            cartItemsList.innerHTML = '<div class="empty-cart-message"><p class="text-gray-400 text-center py-8">Tu carrito está vacío</p></div>';
            this.updateCartSummary();
            return;
        }

        cartItemsList.innerHTML = this.items.map(item => `
            <div class="cart-item" data-product="${item.title}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <div>
                        <h3 class="cart-item-title">${item.title}</h3>
                        <p class="cart-item-price">${item.price}€</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn minus-btn" data-product="${item.title}">-</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn plus-btn" data-product="${item.title}">+</button>
                        <button class="remove-item-btn" data-product="${item.title}" title="Eliminar">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Agregar event listeners a los botones
        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productTitle = e.target.dataset.product;
                const item = this.items.find(i => i.title === productTitle);
                if (item) {
                    this.updateQuantity(productTitle, item.quantity - 1);
                }
            });
        });

        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productTitle = e.target.dataset.product;
                const item = this.items.find(i => i.title === productTitle);
                if (item) {
                    this.updateQuantity(productTitle, item.quantity + 1);
                }
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productTitle = e.target.dataset.product;
                this.remove(productTitle);
            });
        });

        this.updateCartSummary();
    }

    updateCartSummary() {
        const subtotal = this.getSubtotal();
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        const discountsEl = document.getElementById('discounts');

        if (subtotalEl) {
            subtotalEl.textContent = subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        }

        // Simular descuentos (puedes ajustar esto según tus necesidades)
        const discount = subtotal > 50 ? subtotal * 0.1 : 0; // 10% descuento si es mayor a 50€
        const total = subtotal - discount;

        if (discountsEl) {
            discountsEl.textContent = '-' + discount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        }

        if (totalEl) {
            totalEl.textContent = total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        }

        // Actualizar estado del botón de pago
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.items.length === 0;
        }
    }

    openCart() {
        this.cartModal.classList.add('active');
        this.cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this.cartModal.classList.remove('active');
        this.cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// ============================================
// LISTA DE DESEOS
// ============================================
class Wishlist {
    constructor() {
        this.items = [];
        this.loadFromStorage();
    }

    toggle(productTitle) {
        const index = this.items.indexOf(productTitle);
        if (index > -1) {
            this.items.splice(index, 1);
        } else {
            this.items.push(productTitle);
        }
        this.save();
    }

    has(productTitle) {
        return this.items.includes(productTitle);
    }

    save() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('wishlist');
        this.items = saved ? JSON.parse(saved) : [];
    }

    // Utility methods used by pages.js
    add(productTitle) {
        if (!this.items.includes(productTitle)) {
            this.items.push(productTitle);
            this.save();
        }
    }

    remove(productTitle) {
        const idx = this.items.indexOf(productTitle);
        if (idx > -1) {
            this.items.splice(idx, 1);
            this.save();
        }
    }
}

// ============================================
// EFECTOS DE TARJETAS
// ============================================
class CardInteractions {
    constructor() {
        this.cards = document.querySelectorAll('.juego-card');
        this.initializeCardHovers();
    }

    initializeCardHovers() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.highlightCard(card);
            });

            card.addEventListener('mouseleave', () => {
                this.resetCards();
            });
        });
    }

    highlightCard(card) {
        this.cards.forEach(c => {
            if (c !== card) {
                c.classList.add('dimmed');
            }
        });
        card.classList.remove('dimmed');
        card.classList.add('active');
    }

    resetCards() {
        this.cards.forEach(c => {
            c.classList.remove('dimmed', 'active');
        });
    }
}

// ============================================
// BUSCADOR Y FILTROS
// ============================================
class ProductSearch {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.filterSelect = document.querySelector('.filter-select');
        this.cards = document.querySelectorAll('.juego-card');
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }
        
        // Sorting is handled by `elecciones.js` (separated file)
    }

    handleSearch(event) {
        const query = event.target.value.toLowerCase();
        
        this.cards.forEach(card => {
            const title = card.querySelector('.juego-titulo').textContent.toLowerCase();
            const label = card.querySelector('.juego-etiqueta').textContent.toLowerCase();
            
            if (title.includes(query) || label.includes(query)) {
                card.style.display = '';
                card.style.opacity = '1';
            } else {
                card.style.display = 'none';
            }
        });
    }

    handleSort(event) {
        const sortOption = event.target.value;
        const container = document.querySelector('.juegos-container');
        const cardsArray = Array.from(this.cards);

        switch(sortOption) {
            case 'Ordenar por: Relevancia':
                // Mantener orden original
                break;
            case 'Precio: Menor a Mayor':
                cardsArray.sort((a, b) => {
                    const priceA = parseFloat(a.dataset.price);
                    const priceB = parseFloat(b.dataset.price);
                    return priceA - priceB;
                });
                break;
            case 'Precio: Mayor a Menor':
                cardsArray.sort((a, b) => {
                    const priceA = parseFloat(a.dataset.price);
                    const priceB = parseFloat(b.dataset.price);
                    return priceB - priceA;
                });
                break;
            case 'Descuento Mayor':
                cardsArray.sort((a, b) => {
                    const discountA = parseInt(a.dataset.discount);
                    const discountB = parseInt(b.dataset.discount);
                    return discountB - discountA;
                });
                break;
        }

        // Reinsertar elementos en el orden correcto
        cardsArray.forEach(card => container.appendChild(card));
    }
}

// ============================================
// NAVEGACIÓN
// ============================================
class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.initializeNavigation();
    }

    initializeNavigation() {
        this.navLinks.forEach(link => {
            // Marcar el enlace activo basado en la URL actual
            if (link.href.includes(window.location.pathname.split('/').pop())) {
                link.classList.add('active');
            }

            link.addEventListener('click', (e) => {
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
let cart; // Variable global
let wishlist; // Variable global

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carrito
    cart = new ShoppingCart();
    cart.updateCount();
    cart.updateCartDisplay();

    // Inicializar lista de deseos
    wishlist = new Wishlist();

    // Inicializar interacciones de tarjetas
    new CardInteractions();

    // Inicializar búsqueda y filtros
    new ProductSearch();

    // Inicializar navegación
    new Navigation();

    // ============================================
    // EVENTOS DEL CARRITO MODAL
    // ============================================

    // Abrir carrito
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cart.openCart();
        });
    }

    // Cerrar carrito
    const closeCartBtn = document.querySelector('.close-cart-btn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
            cart.closeCart();
        });
    }

    // Cerrar carrito al hacer click en el overlay
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', function() {
            cart.closeCart();
        });
    }

    // Botón continuar comprando
    const continueShopping = document.querySelector('.continue-shopping-btn');
    if (continueShopping) {
        continueShopping.addEventListener('click', function() {
            cart.closeCart();
        });
    }

    // Botón proceder al pago
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.items.length > 0) {
                const total = cart.getSubtotal();
                cart.showNotification(`Procesando pago de ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€...`);
                // Aquí iría la lógica de pago real
                setTimeout(() => {
                    cart.showNotification('¡Compra realizada con éxito!');
                    cart.items = [];
                    cart.save();
                    cart.updateCount();
                    cart.updateCartDisplay();
                    cart.closeCart();
                }, 2000);
            }
        });
    }

    // ============================================
    // EVENTOS DE PRODUCTOS
    // ============================================

    // Configurar botones "Añadir al carrito"
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.juego-card');
            const product = {
                title: card.querySelector('.juego-titulo').textContent,
                price: card.dataset.price,
                image: card.querySelector('.juego-imagen').src
            };
            cart.add(product);
        });
    });

    // Configurar botones "Wishlist"
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const card = btn.closest('.juego-card');
        const productTitle = card.querySelector('.juego-titulo').textContent;
        
        // Actualizar estado visual si está en wishlist
        if (wishlist.has(productTitle)) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            wishlist.toggle(productTitle);
            btn.classList.toggle('active');
            const isAdded = btn.classList.contains('active');
            cart.showNotification(isAdded ? '❤️ Añadido a favoritos' : '💔 Eliminado de favoritos');
        });
    });

    // Perfil
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            // Si el sistema de autenticación está inicializado, abrir perfil/modal
            if (window.auth && typeof auth.showProfile === 'function') {
                auth.showProfile();
                return;
            }
            if (window.auth && typeof auth.showAuthModal === 'function') {
                auth.showAuthModal('login');
                return;
            }
            // Fallback: no mostrar la notificación "próximamente"
        });
    }

    // Botones CTA
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('Explorar') || text.includes('Ver Ofertas')) {
                document.querySelector('.juegos-container').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Tarjetas de categorías
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            cart.showNotification('Navegando a categoría...');
        });
    });
});

// ============================================
// PORTADA - EVENT LISTENERS
// ============================================

// Botones de la sección de opciones
const exploreBtn = document.querySelector('.explore-btn');
if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Botón Explorar Catálogo Completo (final de portada)
const ctaButtons = document.querySelectorAll('button.btn-primary.btn-lg');
if (ctaButtons.length > 0) {
    ctaButtons[ctaButtons.length - 1].addEventListener('click', () => {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Opciones principales - navegación
const optionCards = document.querySelectorAll('.option-card');
optionCards.forEach(card => {
    card.addEventListener('click', () => {
        const page = card.dataset.page;
        cart.openCart(); // Abre el carrito como muestra
        notification.showNotification('Categoría seleccionada: ' + page);
    });
});

// Opciones secundarias - botones
const secondaryButtons = document.querySelectorAll('.btn-secondary-small');
    secondaryButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        // Actualmente no hay acción; evitar mostrar "próximamente"
        // Podríamos navegar o abrir un modal si se requiere
    });
});

// ============================================
// UTILIDADES
// ============================================

// Objeto de notificaciones
const notification = {
    showNotification: function(message) {
        const container = document.createElement('div');
        container.className = 'notification';
        container.textContent = message;
        document.body.appendChild(container);
        setTimeout(() => {
            container.remove();
        }, 3000);
    }
};
const style = document.createElement('style');

style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #06b6d4, #3b82f6);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
        animation: slideIn 0.3s ease-out;
        z-index: 9999;
        font-weight: 500;
    }

    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
// ============================================
// MENÚ HAMBURGUESA RESPONSIVE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (hamburgerBtn && mobileMenu) {
        // Toggle menu when hamburger is clicked
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('show');
            hamburgerBtn.classList.toggle('active');
        });

        // Close menu when a link is clicked
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('show');
                hamburgerBtn.classList.remove('active');
                // Update active link
                mobileNavLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('show');
                hamburgerBtn.classList.remove('active');
            }
        });

        // Close menu on window resize (when it goes to desktop)
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                mobileMenu.classList.remove('show');
                hamburgerBtn.classList.remove('active');
            }
        });

        // Set active link based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        mobileNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
});