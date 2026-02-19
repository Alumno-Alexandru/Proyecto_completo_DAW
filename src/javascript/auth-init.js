// ============================================
// INICIALIZACIÓN DE AUTENTICACIÓN - Módulo separado
// ============================================

let auth;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de autenticación
    auth = new Auth();
});
