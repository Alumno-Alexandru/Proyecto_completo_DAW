// ============================================
// LISTA DE DESEOS - Módulo separado
// ============================================

class Wishlist {
    constructor() {
        this.items = this.loadFromStorage();
    }

    toggle(title) {
        const index = this.items.indexOf(title);
        if (index > -1) {
            this.items.splice(index, 1);
        } else {
            this.items.push(title);
        }
        this.save();
    }

    has(title) {
        return this.items.includes(title);
    }

    add(title) {
        if (!this.items.includes(title)) {
            this.items.push(title);
            this.save();
        }
    }

    remove(title) {
        const index = this.items.indexOf(title);
        if (index > -1) {
            this.items.splice(index, 1);
            this.save();
        }
    }

    save() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    }

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
