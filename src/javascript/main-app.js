// ============================================
// INICIALIZACIÓN PRINCIPAL - Módulo separado
// ============================================

let cart, wishlist;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes
    cart = new ShoppingCart();
    wishlist = new Wishlist();
    new ProductManager();
    new Navigation();

    initCartEvents();
    initProductEvents();
    initNavigationEvents();
    initMobileMenu();

    // Actualizar UI inicial
    cart.updateUI();
});


function initCartEvents() {
    // Abrir carrito
    document.querySelector('.cart-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        cart.openCart();
    });
    
    // Cerrar carrito
    document.querySelector('.close-cart-btn')?.addEventListener('click', () => {
        cart.closeCart();
    });
    
    document.getElementById('cartOverlay')?.addEventListener('click', () => {
        cart.closeCart();
    });
    
    document.querySelector('.continue-shopping-btn')?.addEventListener('click', () => {
        cart.closeCart();
    });

    // Botones de cantidad
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('minus-btn')) {
            const title = e.target.dataset.product;
            const item = cart.items.find(i => i.title === title);
            if (item) {
                cart.updateQuantity(title, item.quantity - 1);
            }
        }
        
        if (e.target.classList.contains('plus-btn')) {
            const title = e.target.dataset.product;
            const item = cart.items.find(i => i.title === title);
            if (item) {
                cart.updateQuantity(title, item.quantity + 1);
            }
        }
        
        if (e.target.classList.contains('remove-item-btn')) {
            cart.remove(e.target.dataset.product);
        }
    });

    // Botón checkout
    document.querySelector('.checkout-btn')?.addEventListener('click', () => {
        if (cart.items.length === 0) return;
        
        const total = cart.getSubtotal();
        const formattedTotal = total.toLocaleString('es-ES', {minimumFractionDigits: 2});
        cart.showNotification(`Procesando pago de ${formattedTotal}€...`);
        
        setTimeout(() => {
            cart.showNotification('¡Compra realizada con éxito!');
            cart.items = [];
            cart.save();
            cart.updateUI();
            cart.closeCart();
        }, 2000);
    });
}


function initProductEvents() {
    document.addEventListener('click', (e) => {
        // Añadir al carrito
        if (e.target.classList.contains('add-to-cart-btn')) {
            const card = e.target.closest('.juego-card');
            const product = {
                title: card.querySelector('.juego-titulo')?.textContent,
                price: card.dataset.price,
                image: card.querySelector('.juego-imagen')?.src
            };
            cart.add(product);
        }
        
        // Wishlist
        if (e.target.classList.contains('wishlist-btn')) {
            const card = e.target.closest('.juego-card');
            const title = card.querySelector('.juego-titulo')?.textContent;
            
            wishlist.toggle(title);
            e.target.classList.toggle('active');
            
            const isAdded = e.target.classList.contains('active');
            const msg = isAdded ? '❤️ Añadido a favoritos' : '💔 Eliminado de favoritos';
            cart.showNotification(msg);
        }
    });
}


function initNavigationEvents() {
    // Perfil
    document.querySelector('.profile-btn')?.addEventListener('click', () => {
        if (window.auth?.showProfile) {
            auth.showProfile();
        } else if (window.auth?.showAuthModal) {
            auth.showAuthModal('login');
        }
    });

    // Botones CTA
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('Explorar') || text.includes('Ver Ofertas')) {
                const container = document.querySelector('.juegos-container');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Categorías
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            cart.showNotification('Navegando a categoría...');
        });
    });
}


function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (!hamburgerBtn || !mobileMenu) return;

    // Toggle menu
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle('show');
        hamburgerBtn.classList.toggle('active');
    });

    // Cerrar al hacer click en un enlace
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('show');
            hamburgerBtn.classList.remove('active');
            mobileNavLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.remove('show');
            hamburgerBtn.classList.remove('active');
        }
    });

    // Cerrar al redimensionar
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            mobileMenu.classList.remove('show');
            hamburgerBtn.classList.remove('active');
        }
    });

    // Marcar activo según página actual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    mobileNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}
