// ============================================
// DATOS DE JUEGOS - Cargados desde db.json
// ============================================

let allGames = [];

// Carga los datos de los juegos desde el archivo JSON
// Cargar datos de juegos desde db.json
async function loadGamesFromDB() {
    try {
        const response = await fetch('../src/data/db.json');
        if (!response.ok) {
            throw new Error(`Error al cargar db.json: ${response.status}`);
        }
        const data = await response.json();
        allGames = data.games;
        console.log('Juegos cargados correctamente desde db.json:', allGames.length);
    } catch (error) {
        console.error('Error cargando juegos:', error);
        // Fallback: usar datos locales si la carga falla
        allGames = [];
    }
}

// ============================================
// FUNCIÓN PARA CREAR TARJETA DE JUEGO
// ============================================

// Genera el HTML para una tarjeta de juego individual
function createGameCard(game) {
    let badgeHTML = '';
    
    if (game.isFree) {
        badgeHTML = '<span class="badge-free">GRATIS</span>';
    } else if (game.discount > 0) {
        badgeHTML = `<span class="descuento-badge">-${game.discount}%</span>`;
    }

    const originalPrice = game.discount > 0 ? (game.price / (1 - game.discount / 100)).toFixed(2) : game.price;

    let priceHTML = '';
    if (game.isFree) {
        priceHTML = `<span class="precio-actual text-lg font-bold">GRATIS</span>`;
    } else if (game.discount > 0) {
        priceHTML = `
            <div>
                <span class="precio-anterior line-through text-gray-400">${originalPrice} €</span>
                <span class="precio-actual text-lg font-bold ml-2">${game.price.toFixed(2)} €</span>
            </div>
        `;
    } else {
        priceHTML = `<span class="precio-actual text-lg font-bold">${game.price.toFixed(2)} €</span>`;
    }

    return `
        <div class="juego-card" data-price="${game.price}" data-discount="${game.discount}">
            ${badgeHTML}
            <div class="card-image-container">
                <img src="${game.image}" class="juego-imagen" alt="${game.title}">
                <button class="add-to-cart-btn">Añadir al carrito</button>
            </div>
            <div class="juego-info">
                <p class="juego-etiqueta">${game.label}</p>
                <h3 class="juego-titulo">${game.title}</h3>
                <div class="stars">${game.rating}</div>
                <div class="juego-precios mt-4 flex items-center justify-between">
                    ${priceHTML}
                    <button class="wishlist-btn">♡</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// CARGAR JUEGOS EN PÁGINA
// ============================================

// Renderiza los juegos en la página según el tipo (todos, gratis, ofertas)
async function loadGamesOnPage(pageType) {
    // Asegurar que los juegos estén cargados
    if (allGames.length === 0) {
        await loadGamesFromDB();
    }

    const container = document.querySelector('.juegos-container');
    if (!container) return;

    let gamesToDisplay = [];

    if (pageType === 'all-games') {
        gamesToDisplay = allGames;
    } else if (pageType === 'free-games') {
        gamesToDisplay = allGames.filter(game => game.isFree);
    } else if (pageType === 'special-offers') {
        gamesToDisplay = allGames.filter(game => game.discount > 0 && !game.isFree).sort((a, b) => b.discount - a.discount);
    }

    container.innerHTML = gamesToDisplay.map(game => createGameCard(game)).join('');

    // Re-inicializar eventos de interactividad
    initializeGameCards();
}

// ============================================
// CARGAR FAVORITOS
// ============================================

// Carga y muestra los juegos guardados en la lista de deseos
async function loadWishlist() {
    // Asegurar que los juegos estén cargados
    if (allGames.length === 0) {
        await loadGamesFromDB();
    }

    const wishlistContainer = document.getElementById('wishlist-container');
    const emptyMessage = document.getElementById('empty-wishlist');

    if (!wishlistContainer) return;

    const wishlist = new Wishlist();
    const favoriteGames = allGames.filter(game => wishlist.has(game.title));

    if (favoriteGames.length === 0) {
        wishlistContainer.style.display = 'none';
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
        wishlistContainer.innerHTML = favoriteGames.map(game => createGameCard(game)).join('');
        initializeGameCards();
    }
}

// ============================================
// INICIALIZAR EVENTOS DE TARJETAS
// ============================================

// Configura los eventos de click (carrito, favoritos) para las tarjetas
function initializeGameCards() {
    // Botones de añadir al carrito
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.juego-card');
            const titleElement = card.querySelector('.juego-titulo');
            const priceElement = card.querySelector('.precio-actual');
            
            const price = parseFloat(card.dataset.price) || 0;
            const discount = parseInt(card.dataset.discount) || 0;

            const product = {
                title: titleElement.textContent,
                price: price,
                discount: discount,
                image: card.querySelector('.juego-imagen').src
            };

            if (typeof cart !== 'undefined') {
                cart.add(product);
            }
        });
    });

    // Botones de wishlist
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.juego-card');
            const titleElement = card.querySelector('.juego-titulo');
            const title = titleElement.textContent;

            if (typeof wishlist !== 'undefined') {
                wishlist.toggle(title);
                
                if (wishlist.has(title)) {
                    btn.textContent = '❤️';
                    if (typeof showNotification === 'function') showNotification('Añadido a favoritos');
                } else {
                    btn.textContent = '♡';
                    if (typeof showNotification === 'function') showNotification('Eliminado de favoritos');

                    // Si estamos en la página de favoritos, eliminar la tarjeta visualmente al instante
                    if (window.location.href.includes('favoritos.html') || window.location.href.includes('wishlist.html')) {
                        card.remove();
                        // Verificar si quedó vacío
                        const container = document.getElementById('wishlist-container');
                        if (container && container.children.length === 0) {
                            container.style.display = 'none';
                            document.getElementById('empty-wishlist').style.display = 'block';
                        }
                    }
                }
            }
        });

        // Marcar si ya está en favoritos
        const card = btn.closest('.juego-card');
        const title = card.querySelector('.juego-titulo').textContent;
        if (typeof wishlist !== 'undefined' && wishlist.has(title)) {
            btn.textContent = '❤️';
        }
    });

    // Hover effects
    document.querySelectorAll('.juego-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            document.querySelectorAll('.juego-card').forEach(c => {
                if (c !== this) c.classList.add('opacity-30');
            });
        });

        card.addEventListener('mouseleave', function () {
            document.querySelectorAll('.juego-card').forEach(c => {
                c.classList.remove('opacity-30');
            });
        });
    });
}

// ============================================
// DETECTAR PÁGINA Y CARGAR CONTENIDO
// ============================================

// Muestra una notificación flotante en pantalla
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 transition-all duration-500 transform translate-y-[-20px] opacity-0';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animación de entrada
    setTimeout(() => {
        notification.classList.remove('translate-y-[-20px]', 'opacity-0');
    }, 10);

    // Desaparecer después de 3 segundos
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Configura la alerta al hacer clic en pagar
function setupCheckoutAlert() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            showNotification('¡Gracias por tu compra! Tu pedido ha sido procesado correctamente.');
            document.querySelector('.close-cart-btn')?.click();
        });
    }
}

// Inicialización principal cuando carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que app.js se haya ejecutado completamente
    setTimeout(async () => {
        const currentURL = window.location.href;
        
        // Support both English and Spanish filenames used in the project
        if (currentURL.includes('all-games.html') || currentURL.includes('todos-los-juegos.html')) {
            await loadGamesOnPage('all-games');
        } else if (currentURL.includes('free-games.html') || currentURL.includes('juegos-gratis.html')) {
            await loadGamesOnPage('free-games');
        } else if (currentURL.includes('special-offers.html') || currentURL.includes('ofertas-especiales.html')) {
            await loadGamesOnPage('special-offers');
        } else if (currentURL.includes('wishlist.html') || currentURL.includes('favoritos.html')) {
            await loadWishlist();
        }

        setupCheckoutAlert();
    }, 100);
});
