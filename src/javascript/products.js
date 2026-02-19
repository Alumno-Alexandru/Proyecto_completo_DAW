// ============================================
// GESTIÓN DE PRODUCTOS - Módulo separado
// ============================================

class ProductManager {
    constructor() {
        this.cards = document.querySelectorAll('.juego-card');
        this.search = document.querySelector('.search-input');
        
        if (this.search) {
            this.search.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }
    }

    highlightCard(card) {
        this.cards.forEach(c => {
            c.classList.remove('active', 'dimmed');
        });
        card.classList.add('active');
    }

    filterProducts(query) {
        const q = query.toLowerCase();
        
        this.cards.forEach(card => {
            const title = card.querySelector('.juego-titulo')?.textContent.toLowerCase() || '';
            const label = card.querySelector('.juego-etiqueta')?.textContent.toLowerCase() || '';
            
            const match = title.includes(q) || label.includes(q);
            card.style.display = match ? '' : 'none';
        });
    }

    sortProducts(sortOption) {
        const container = document.querySelector('.juegos-container');
        const cardsArray = Array.from(this.cards);

        switch(sortOption) {
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
                    const discountA = parseInt(a.dataset.discount) || 0;
                    const discountB = parseInt(b.dataset.discount) || 0;
                    return discountB - discountA;
                });
                break;
        }

        cardsArray.forEach(card => {
            container.appendChild(card);
        });
    }

    getProductInfo(card) {
        return {
            title: card.querySelector('.juego-titulo')?.textContent || '',
            price: card.dataset.price || '0',
            image: card.querySelector('.juego-imagen')?.src || '',
            discount: card.dataset.discount || '0'
        };
    }
}


// ============================================
// NAVEGACIÓN - Módulo separado
// ============================================

class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.initializeNavigation();
    }

    initializeNavigation() {
        const currentPath = window.location.pathname.split('/').pop();
        
        this.navLinks.forEach(link => {
            const linkPath = link.href.split('/').pop();
            if (linkPath === currentPath || (!currentPath && linkPath === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    setActive(link) {
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    }
}
