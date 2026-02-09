// ==================== SUSCRIPCIONES ====================

// Estado global
let billingMode = 'monthly'; // 'monthly' o 'annual'
let currentPlan = 'free'; // Plan actual del usuario

// Precios
const priceList = {
    free: { monthly: 0, annual: 0 },
    pro: { monthly: 9.99, annual: 79.92 },
    premium: { monthly: 14.99, annual: 119.92 },
    vip: { monthly: 19.99, annual: 159.92 }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    setupBillingToggle();
    setupFAQ();
    setupSubscribeButtons();
});

// ==================== TOGGLE MENSUAL/ANUAL ====================
function setupBillingToggle() {
    const toggle = document.getElementById('billingToggle');
    const toggleCircle = toggle.querySelector('.toggle-circle');

    toggle.addEventListener('click', () => {
        if (billingMode === 'monthly') {
            // Cambiar a anual
            billingMode = 'annual';
            toggle.classList.remove('bg-gradient-to-r', 'from-cyan-500', 'to-blue-500');
            toggle.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-pink-600');
            toggleCircle.style.transform = 'translateX(24px)';
        } else {
            // Cambiar a mensual
            billingMode = 'monthly';
            toggle.classList.remove('bg-gradient-to-r', 'from-purple-600', 'to-pink-600');
            toggle.classList.add('bg-gradient-to-r', 'from-cyan-500', 'to-blue-500');
            toggleCircle.style.transform = 'translateX(0)';
        }

        updatePrices();
    });
}

// Actualizar precios según modo de facturación
function updatePrices() {
    const plans = document.querySelectorAll('.card-plan');

    plans.forEach(plan => {
        const priceMonthly = plan.querySelector('.price-monthly');
        const priceAnnual = plan.querySelector('.price-annual');
        const billingPeriod = plan.querySelector('.billing-period');

        if (billingMode === 'monthly') {
            priceMonthly.classList.remove('hidden');
            priceAnnual.classList.add('hidden');
            if (billingPeriod) {
                billingPeriod.textContent = 'al mes';
            }
        } else {
            priceMonthly.classList.add('hidden');
            priceAnnual.classList.remove('hidden');
            if (billingPeriod) {
                billingPeriod.textContent = 'al año';
            }
        }
    });

    // Animación
    plans.forEach(plan => {
        plan.style.transform = 'scale(0.95)';
        setTimeout(() => {
            plan.style.transform = 'scale(1)';
        }, 50);
    });
}

// ==================== SETUP FAQ ====================
function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const toggle = item.querySelector('.faq-toggle');
        const content = item.querySelector('.faq-content');
        const icon = item.querySelector('.faq-icon');

        toggle.addEventListener('click', () => {
            const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

            // Cerrar todos los demás
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherContent = otherItem.querySelector('.faq-content');
                    const otherIcon = otherItem.querySelector('.faq-icon');
                    otherContent.style.maxHeight = '0';
                    otherIcon.textContent = '+';
                }
            });

            // Toggle actual
            if (isOpen) {
                content.style.maxHeight = '0';
                icon.textContent = '+';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.textContent = '−';
            }
        });
    });
}

// ==================== SETUP SUBSCRIBE BUTTONS ====================
function setupSubscribeButtons() {
    const subscribeButtons = document.querySelectorAll('.btn-subscribe');

    subscribeButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            const plans = ['free', 'pro', 'premium', 'vip'];
            const selectedPlan = plans[index];

            if (selectedPlan === currentPlan) {
                // Si ya tienes este plan, mostrar opción de cancelar
                if (selectedPlan === 'free') {
                    showNotification('Ya tienes el plan gratis', 'info');
                } else {
                    openCancelModal(selectedPlan);
                }
                return;
            }

            if (selectedPlan === 'free') {
                showNotification('Volviendo a plan gratis...', 'info');
                currentPlan = 'free';
                updateUI();
            } else {
                // Cambiar directamente al nuevo plan sin modal de pago
                currentPlan = selectedPlan;
                updateUI();
                showNotification(`✅ ¡Bienvenido al plan ${selectedPlan.toUpperCase()}!`, 'success');
            }
        });
    });
}

// ==================== MODALES ====================
function openCancelModal(plan) {
    const modal = createCancelModal(plan);
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    const confirmBtn = modal.querySelector('.btn-confirm-cancel');
    confirmBtn.addEventListener('click', () => {
        cancelSubscription(plan);
        modal.remove();
    });
}

// Crear modal de cancelación
function createCancelModal(plan) {
    const div = document.createElement('div');
    div.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';

    const planLabels = {
        pro: 'Pro',
        premium: 'Premium',
        vip: 'VIP'
    };

    div.innerHTML = `
        <div class="bg-gradient-to-br from-slate-900 to-slate-950 border border-red-700/50 rounded-2xl p-8 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-red-400">⚠️ Cancelar Suscripción</h3>
                <button class="close-modal text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <div class="mb-6 p-4 bg-red-950/30 rounded-lg border border-red-700/50">
                <p class="text-gray-300 mb-3">¿Estás seguro de que deseas cancelar tu suscripción <span class="font-bold text-red-400">${planLabels[plan]}</span>?</p>
                <ul class="text-sm text-gray-400 space-y-2">
                    <li>❌ Perderás acceso a características exclusivas</li>
                    <li>❌ Perderás descuentos en juegos</li>
                    <li>✅ Podrás volver a suscribirte en cualquier momento</li>
                </ul>
            </div>

            <div class="flex gap-4">
                <button class="close-modal flex-1 border border-slate-700 text-gray-300 hover:text-white font-bold py-3 rounded-lg transition">
                    Mantener Suscripción
                </button>
                <button class="btn-confirm-cancel flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:shadow-red-600/50 text-white font-bold py-3 rounded-lg transition">
                    Confirmar Cancelación
                </button>
            </div>

            <p class="text-xs text-gray-500 text-center mt-4">Tu suscripción se cancelará inmediatamente.</p>
        </div>
    `;

    return div;
}

// Cancelar suscripción
function cancelSubscription(plan) {
    currentPlan = 'free';
    updateUI();
    showNotification(`Suscripción ${plan.toUpperCase()} cancelada. Volviste a plan Free 👋`, 'error');

    // Aquí iría la llamada a la API para cancelar
    console.log(`Suscripción cancelada: ${plan}`);
}

// Actualizar UI según plan actual
function updateUI() {
    const planNames = ['free', 'pro', 'premium', 'vip'];
    const buttons = document.querySelectorAll('.btn-subscribe');

    buttons.forEach((btn, index) => {
        const plan = planNames[index];
        if (plan === currentPlan) {
            // Limpieza de clases anteriores
            btn.className = 'btn-subscribe';
            
            if (plan === 'free') {
                btn.textContent = 'Tu Plan Actual';
                btn.classList.add('w-full', 'mb-8', 'bg-gradient-to-r', 'from-slate-800', 'to-slate-700', 'border', 'border-slate-600', 'hover:border-cyan-500', 'text-white', 'font-bold', 'py-3', 'rounded-lg', 'transition');
                btn.disabled = true;
            } else {
                btn.textContent = 'Cancelar Suscripción';
                btn.classList.add('w-full', 'mb-8', 'bg-gradient-to-r', 'from-red-600', 'to-red-700', 'hover:shadow-lg', 'hover:shadow-red-600/50', 'text-white', 'font-bold', 'py-3', 'rounded-lg', 'transition');
                btn.disabled = false;
            }
        } else {
            // Limpieza de clases anteriores
            btn.className = 'btn-subscribe';
            btn.disabled = false;
            
            if (plan === 'pro') {
                btn.textContent = 'Actualizar Ahora';
                btn.classList.add('w-full', 'mb-8', 'bg-gradient-to-r', 'from-cyan-500', 'to-blue-500', 'hover:shadow-lg', 'hover:shadow-cyan-500/50', 'text-white', 'font-bold', 'py-3', 'rounded-lg', 'transition');
            } else if (plan === 'premium') {
                btn.textContent = 'Actualizar Ahora';
                btn.classList.add('w-full', 'mb-8', 'bg-gradient-to-r', 'from-blue-600', 'to-blue-500', 'hover:shadow-lg', 'hover:shadow-blue-500/50', 'text-white', 'font-bold', 'py-3', 'rounded-lg', 'transition');
            } else if (plan === 'vip') {
                btn.textContent = 'Actualizar Ahora';
                btn.classList.add('w-full', 'mb-8', 'bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'hover:shadow-lg', 'hover:shadow-purple-500/50', 'text-white', 'font-bold', 'py-3', 'rounded-lg', 'transition');
            }
        }
    });
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    const div = document.createElement('div');
    
    let bgColor = 'bg-blue-500';
    if (type === 'success') {
        bgColor = 'bg-green-500';
    } else if (type === 'error') {
        bgColor = 'bg-red-500';
    }
    
    div.className = `fixed top-4 right-4 px-6 py-4 rounded-lg font-bold text-white z-[100] animate-pulse ${bgColor}`;
    div.textContent = message;

    document.body.appendChild(div);

    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.3s';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

// Inicializar UI al cargar
updateUI();
