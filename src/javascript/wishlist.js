// ============================================
// LISTA DE DESEOS - Módulo separado
// ============================================

// Clase para gestionar favoritos
class Wishlist {
    constructor() {
        this.items = this.loadFromStorage();
    }

    // Alternar estado (añadir/quitar)
    toggle(title) {
        const index = this.items.indexOf(title);
        if (index > -1) {
            this.items.splice(index, 1);
        } else {
            this.items.push(title);
        }
        this.save();
    }

    // Comprobar si existe
    has(title) {
        return this.items.includes(title);
    }

    // Añadir
    add(title) {
        if (!this.items.includes(title)) {
            this.items.push(title);
            this.save();
        }
    }

    // Eliminar
    remove(title) {
        const index = this.items.indexOf(title);
        if (index > -1) {
            this.items.splice(index, 1);
            this.save();
        }
    }

    // Guardar
    save() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    }

    // Cargar
    loadFromStorage() {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    }

    getAll() {
        return this.items;
    }

    clear() {
        this.items = [];
        this.save();
    }
}
