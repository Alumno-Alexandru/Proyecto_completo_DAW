// ============================================
// ESTILOS DE AUTENTICACIÓN - Módulo separado (Tailwind CSS)
// ============================================

// Inyecta estilos CSS para el módulo de autenticación
function addAuthStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('auth-styles')) {
        return;
    }
    
    const styles = document.createElement('style');
    styles.id = 'auth-styles';
    styles.textContent = `
        /* Estilos personalizados con Tailwind */
        .auth-tab-btn.active {
            @apply bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg;
        }

        .auth-form-container.hidden {
            @apply hidden;
        }

        /* Animación para mostrar notificaciones */
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .animate-slide-in {
            animation: slideIn 0.3s ease-out;
        }

        /* Transiciones suaves para modales */
        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .auth-modal-overlay {
            @apply opacity-100 visible;
            animation: fadeInScale 0.3s ease-out;
        }

        /* Estilos para inputs con Tailwind */
        input[type="email"],
        input[type="password"],
        input[type="text"] {
            @apply w-full px-4 py-3 bg-black/30 border-2 border-blue-500/20 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all;
        }

        input::placeholder {
            @apply text-slate-500;
        }
    `;
    
    document.head.appendChild(styles);
}
