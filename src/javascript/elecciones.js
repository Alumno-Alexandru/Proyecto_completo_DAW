// elecciones.js - manejo de elecciones/ordenación (separado)

// Configura el selector de ordenamiento
document.addEventListener('DOMContentLoaded', () => {
    const filterSelect = document.querySelector('.filter-select');
    const container = document.querySelector('.juegos-container');

    if (!filterSelect || !container) return;

    filterSelect.addEventListener('change', (e) => {
        const sortOption = e.target.value;
        const cards = Array.from(container.querySelectorAll('.juego-card'));

        let sorted = cards.slice();
        switch (sortOption) {
            case 'Ordenar por: Relevancia':
                sorted = cards.slice();
                break;
            case 'Precio: Menor a Mayor':
                sorted = cards.slice().sort((a, b) => (parseFloat(a.dataset.price) || 0) - (parseFloat(b.dataset.price) || 0));
                break;
            case 'Precio: Mayor a Menor':
                sorted = cards.slice().sort((a, b) => (parseFloat(b.dataset.price) || 0) - (parseFloat(a.dataset.price) || 0));
                break;
            case 'Descuento Mayor':
                sorted = cards.slice().sort((a, b) => (parseInt(b.dataset.discount || 0)) - (parseInt(a.dataset.discount || 0)));
                break;
            default:
                sorted = cards.slice();
                break;
        }

        // FLIP animation: First -> Last -> Invert -> Play
        const firstRects = new Map();
        cards.forEach(card => firstRects.set(card, card.getBoundingClientRect()));

        // Reinsert in new order (this will move elements instantly in DOM)
        sorted.forEach(card => container.appendChild(card));

        // Measure last positions and apply transforms to animate
        sorted.forEach(card => {
            const first = firstRects.get(card);
            const last = card.getBoundingClientRect();
            const dx = first.left - last.left;
            const dy = first.top - last.top;

            if (dx !== 0 || dy !== 0) {
                // Apply inverse transform
                card.style.transform = `translate(${dx}px, ${dy}px)`;
                card.style.transition = 'transform 0s';
                // Play animation on next frame
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        card.style.transition = 'transform 300ms ease';
                        card.style.transform = '';
                        const cleanup = () => {
                            card.style.transition = '';
                            card.removeEventListener('transitionend', cleanup);
                        };
                        card.addEventListener('transitionend', cleanup);
                    });
                });
            }
        });
    });
});
