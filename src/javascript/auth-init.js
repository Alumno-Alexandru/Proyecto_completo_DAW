// ============================================
// INICIALIZACIÓN DE AUTENTICACIÓN - Módulo separado
// ============================================

let auth;

// Inicializa la autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de autenticación
    auth = new Auth();
});
