// ============================================
// SISTEMA DE AUTENTICACIÓN - GitGame Store
// ============================================

class Auth {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.users = this.loadUsers();
        this.init();
    }

    // Inicializar eventos y UI
    init() {
        this.updateUI();
        this.setupEventListeners();
    }

    // Cargar usuarios desde localStorage o usar datos por defecto
    loadUsers() {
        const storedUsers = localStorage.getItem('gitgame_users');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }
        // Usuarios de ejemplo (demo)
        const defaultUsers = [
            {
                id: 1,
                email: 'admin@gitgame.com',
                password: 'admin123',
                name: 'Administrador',
                avatar: '👑',
                createdAt: '2024-01-01',
                isAdmin: true
            },
            {
                id: 2,
                email: 'usuario@gitgame.com',
                password: 'usuario123',
                name: 'Usuario Demo',
                avatar: '🎮',
                createdAt: '2024-01-15',
                isAdmin: false
            }
        ];
        localStorage.setItem('gitgame_users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    // Guardar usuarios en localStorage
    saveUsers() {
        localStorage.setItem('gitgame_users', JSON.stringify(this.users));
    }

    // Obtener usuario actual de la sesión
    getCurrentUser() {
        const session = localStorage.getItem('gitgame_session');
        return session ? JSON.parse(session) : null;
    }

    // Iniciar sesión
    login(email, password) {
        return new Promise((resolve, reject) => {
            // Simular delay de red
            setTimeout(() => {
                const user = this.users.find(u => 
                    u.email.toLowerCase() === email.toLowerCase() && 
                    u.password === password
                );

                if (user) {
                    // No guardar contraseña en la sesión
                    const sessionUser = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        avatar: user.avatar,
                        isAdmin: user.isAdmin,
                        loginAt: new Date().toISOString()
                    };
                    localStorage.setItem('gitgame_session', JSON.stringify(sessionUser));
                    this.currentUser = sessionUser;
                    this.updateUI();
                    this.showNotification('¡Bienvenido de nuevo, ' + user.name + '!', 'success');
                    resolve(sessionUser);
                } else {
                    reject(new Error('Correo o contraseña incorrectos'));
                }
            }, 500);
        });
    }

    // Registrar nuevo usuario
    register(name, email, password, confirmPassword) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Validaciones
                if (!name || !email || !password || !confirmPassword) {
                    reject(new Error('Por favor completa todos los campos'));
                    return;
                }

                if (password !== confirmPassword) {
                    reject(new Error('Las contraseñas no coinciden'));
                    return;
                }

                if (password.length < 6) {
                    reject(new Error('La contraseña debe tener al menos 6 caracteres'));
                    return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    reject(new Error('Por favor ingresa un correo válido'));
                    return;
                }

                // Verificar si el email ya existe
                const existingUser = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
                if (existingUser) {
                    reject(new Error('Este correo ya está registrado'));
                    return;
                }

                // Crear nuevo usuario
                const newUser = {
                    id: Date.now(),
                    email: email.toLowerCase(),
                    password: password,
                    name: name.trim(),
                    avatar: this.getRandomAvatar(),
                    createdAt: new Date().toISOString().split('T')[0],
                    isAdmin: false
                };

                this.users.push(newUser);
                this.saveUsers();

                // Iniciar sesión automáticamente
                const sessionUser = {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    avatar: newUser.avatar,
                    isAdmin: newUser.isAdmin,
                    loginAt: new Date().toISOString()
                };
                localStorage.setItem('gitgame_session', JSON.stringify(sessionUser));
                this.currentUser = sessionUser;
                this.updateUI();
                this.showNotification('¡Cuenta creada exitosamente! ¡Bienvenido, ' + newUser.name + '!', 'success');
                resolve(sessionUser);
            }, 500);
        });
    }

    // Cerrar sesión
    logout() {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.removeItem('gitgame_session');
                this.currentUser = null;
                this.updateUI();
                this.showNotification('Sesión cerrada correctamente');
                resolve(true);
            }, 300);
        });
    }

    // Obtener avatar aleatorio
    getRandomAvatar() {
        const avatars = ['🎮', '🎲', '🎯', '🎨', '🚀', '⭐', '💎', '🔥', '👾', '🦖', '🐉', '⚔️'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    // Actualizar UI según estado de sesión
    updateUI() {
        const profileBtn = document.querySelector('.profile-btn');
        const navContainer = document.querySelector('.nav-tools-container');
        
        if (this.currentUser) {
            // Usuario logueado - actualizar botón de perfil
            if (profileBtn) {
                profileBtn.innerHTML = `
                    <div class="user-avatar">${this.currentUser.avatar}</div>
                    <span class="user-name">${this.currentUser.name}</span>
                `;
                profileBtn.classList.add('logged-in');
                profileBtn.onclick = () => this.showUserMenu(profileBtn);
            }
        } else {
            // Usuario no logueado
            if (profileBtn) {
                profileBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor">
                        <use xlink:href="../src/img/sprites.svg#icon-profile"></use>
                    </svg>
                `;
                profileBtn.classList.remove('logged-in');
                profileBtn.onclick = () => this.showAuthModal();
            }
        }
    }

    // Mostrar modal de autenticación
    showAuthModal(mode = 'login') {
        // Crear modal si no existe
        let modal = document.getElementById('authModal');
        if (!modal) {
            modal = this.createAuthModal();
            document.body.appendChild(modal);
        }

        // Mostrar modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Cambiar al modo solicitado
        this.switchAuthMode(mode);
    }

    // Crear estructura del modal
    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'auth-modal-overlay';
        modal.innerHTML = `
            <div class="auth-modal">
                <button class="auth-close-btn" onclick="auth.closeAuthModal()">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor">
                        <use xlink:href="../src/img/sprites.svg#icon-close"></use>
                    </svg>
                </button>
                
                <!-- Logo -->
                <div class="auth-logo">
                    <div class="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span class="text-2xl">🎮</span>
                    </div>
                    <h2 class="auth-title">¡Bienvenido!</h2>
                    <p class="auth-subtitle">Inicia sesión para acceder a tu cuenta</p>
                </div>

                <!-- Pestañas -->
                <div class="auth-tabs">
                    <button class="auth-tab active" data-mode="login" onclick="auth.switchAuthMode('login')">
                        Iniciar Sesión
                    </button>
                    <button class="auth-tab" data-mode="register" onclick="auth.switchAuthMode('register')">
                        Registrarse
                    </button>
                </div>

                <!-- Formulario de Login -->
                <form id="loginForm" class="auth-form active" onsubmit="auth.handleLogin(event)">
                    <div class="form-group">
                        <label for="loginEmail">Correo Electrónico</label>
                        <input type="email" id="loginEmail" placeholder="tu@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Contraseña</label>
                        <input type="password" id="loginPassword" placeholder="••••••••" required>
                    </div>
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="rememberMe">
                            <span>Recordarme</span>
                        </label>
                        <a href="#" class="forgot-link" onclick="return false;">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                    <button type="submit" class="auth-submit-btn">
                        <span class="btn-text">Iniciar Sesión</span>
                        <span class="btn-loading" style="display: none;">Iniciando...</span>
                    </button>
                    <div class="form-error" id="loginError"></div>
                </form>

                <!-- Formulario de Registro -->
                <form id="registerForm" class="auth-form" onsubmit="auth.handleRegister(event)">
                    <div class="form-group">
                        <label for="registerName">Nombre Completo</label>
                        <input type="text" id="registerName" placeholder="Tu nombre" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Correo Electrónico</label>
                        <input type="email" id="registerEmail" placeholder="tu@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Contraseña</label>
                        <input type="password" id="registerPassword" placeholder="Mínimo 6 caracteres" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="registerConfirmPassword">Confirmar Contraseña</label>
                        <input type="password" id="registerConfirmPassword" placeholder="••••••••" required>
                    </div>
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="acceptTerms" required>
                            <span>Acepto los <a href="#" onclick="return false;">términos y condiciones</a></span>
                        </label>
                    </div>
                    <button type="submit" class="auth-submit-btn register-btn">
                        <span class="btn-text">Crear Cuenta</span>
                        <span class="btn-loading" style="display: none;">Creando...</span>
                    </button>
                    <div class="form-error" id="registerError"></div>
                </form>

                <!-- Separador -->
                <div class="auth-separator">
                    <span>o continúa con</span>
                </div>

                <!-- Social Login (demo) -->
                <div class="social-login">
                    <button class="social-btn google" onclick="auth.socialLogin('Google')">
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                    </button>
                    <button class="social-btn github" onclick="auth.socialLogin('GitHub')">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                    </button>
                </div>

                <!-- Demo accounts -->
                <div class="demo-accounts">
                    <p class="demo-title">Cuentas de demostración:</p>
                    <div class="demo-account" onclick="auth.fillDemo('login')">
                        <span>👤</span> admin@gitgame.com / admin123
                    </div>
                    <div class="demo-account" onclick="auth.fillDemo('register')">
                        <span>🎮</span> Nuevo usuario
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    // Cambiar entre login y registro
    switchAuthMode(mode) {
        const modal = document.getElementById('authModal');
        const loginTab = modal.querySelector('[data-mode="login"]');
        const registerTab = modal.querySelector('[data-mode="register"]');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const title = modal.querySelector('.auth-title');
        const subtitle = modal.querySelector('.auth-subtitle');

        if (mode === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            title.textContent = '¡Bienvenido de nuevo!';
            subtitle.textContent = 'Inicia sesión para acceder a tu cuenta';
        } else {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
            title.textContent = 'Crear Cuenta';
            subtitle.textContent = 'Únete a GitGame Store hoy mismo';
        }

        // Limpiar errores
        document.getElementById('loginError').textContent = '';
        document.getElementById('registerError').textContent = '';
    }

    // Llenar formulario demo
    fillDemo(type) {
        if (type === 'login') {
            document.getElementById('loginEmail').value = 'admin@gitgame.com';
            document.getElementById('loginPassword').value = 'admin123';
        } else {
            document.getElementById('registerName').value = 'Nuevo Usuario';
            document.getElementById('registerEmail').value = 'nuevo@ejemplo.com';
            document.getElementById('registerPassword').value = 'password123';
            document.getElementById('registerConfirmPassword').value = 'password123';
        }
    }

    // Manejar envío de login
    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.querySelector('#loginForm .auth-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        const errorDiv = document.getElementById('loginError');

        // Mostrar loading
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
        errorDiv.textContent = '';

        try {
            await this.login(email, password);
            this.closeAuthModal();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.add('show');
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    // Manejar envío de registro
    async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const submitBtn = document.querySelector('#registerForm .auth-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        const errorDiv = document.getElementById('registerError');

        // Mostrar loading
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
        errorDiv.textContent = '';

        try {
            await this.register(name, email, password, confirmPassword);
            this.closeAuthModal();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.add('show');
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    // Cerrar modal
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Menú de usuario
    showUserMenu(btn) {
        // Crear menú si no existe
        let menu = document.getElementById('userMenu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'userMenu';
            menu.className = 'user-menu';
            document.body.appendChild(menu);
        }

        const rect = btn.getBoundingClientRect();
        menu.style.top = rect.bottom + 10 + 'px';
        menu.style.right = (window.innerWidth - rect.right) + 'px';
        menu.innerHTML = `
            <div class="user-menu-header">
                <div class="user-avatar-large">${this.currentUser.avatar}</div>
                <div class="user-info">
                    <span class="user-fullname">${this.currentUser.name}</span>
                    <span class="user-email">${this.currentUser.email}</span>
                </div>
            </div>
            <div class="user-menu-items">
                <a href="#" class="user-menu-item" onclick="auth.showProfile(); return false;">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor">
                        <use xlink:href="../src/img/sprites.svg#icon-profile"></use>
                    </svg>
                    Mi Perfil
                </a>
                <a href="favoritos.html" class="user-menu-item">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor">
                        <use xlink:href="../src/img/sprites.svg#icon-favorites"></use>
                    </svg>
                    Mis Favoritos
                </a>
                <a href="#" class="user-menu-item" onclick="return false;">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor">
                        <use xlink:href="../src/img/sprites.svg#icon-orders"></use>
                    </svg>
                    Historial de Compras
                </a>
                <div class="user-menu-divider"></div>
                <a href="#" class="user-menu-item logout" onclick="auth.handleLogout(); return false;">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor">
                        <use xlink:href="../src/img/sprites.svg#icon-logout"></use>
                    </svg>
                    Cerrar Sesión
                </a>
            </div>
        `;
        menu.classList.add('active');

        // Cerrar al hacer click fuera
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.remove('active');
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }

    // Mostrar perfil (modal simple)
    showProfile() {
        const menu = document.getElementById('userMenu');
        if (menu) menu.classList.remove('active');

        if (!this.currentUser) {
            this.showAuthModal('login');
            return;
        }

        let modal = document.getElementById('profileModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'profileModal';
            modal.className = 'auth-modal-overlay';
            modal.innerHTML = `
                <div class="auth-modal">
                    <button class="auth-close-btn" onclick="document.getElementById('profileModal')?.remove(); document.body.style.overflow='auto';">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor">
                            <use xlink:href="../src/img/sprites.svg#icon-close"></use>
                        </svg>
                    </button>
                    <div class="auth-logo">
                        <div class="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl">${this.currentUser.avatar}</span>
                        </div>
                        <h2 class="auth-title">${this.currentUser.name}</h2>
                        <p class="auth-subtitle">${this.currentUser.email}</p>
                    </div>
                    <div class="profile-content" style="color:#cbd5e1; padding: 0 10px 20px;">
                        <p><strong>Miembro desde:</strong> ${this.currentUser.createdAt || '—'}</p>
                        <p><strong>Rol:</strong> ${this.currentUser.isAdmin ? 'Administrador' : 'Usuario'}</p>
                        <div style="margin-top:20px;">
                            <button class="auth-submit-btn" onclick="document.getElementById('profileModal')?.remove(); document.body.style.overflow='auto';">Cerrar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Cerrar sesión desde menú
    async handleLogout() {
        const menu = document.getElementById('userMenu');
        if (menu) menu.classList.remove('active');
        await this.logout();
    }

    // Login social (demo)
    async socialLogin(provider) {
        this.showNotification(`Inicio de sesión con ${provider} (demo)`);
        // Simular login social
        await this.login('demo@' + provider.toLowerCase() + '.com', 'demo');
        this.closeAuthModal();
    }

    // Configurar event listeners globales
    setupEventListeners() {
        // Cerrar modal al hacer click en overlay
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-modal-overlay')) {
                this.closeAuthModal();
            }
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAuthModal();
            }
        });
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        `;
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 10);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
let auth;

document.addEventListener('DOMContentLoaded', function() {
    auth = new Auth();
});

// Agregar estilos del modal si no existen
(function addAuthStyles() {
    if (document.getElementById('auth-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'auth-styles';
    styles.textContent = `
        /* Modal Overlay */
        .auth-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .auth-modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        /* Modal */
        .auth-modal {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 20px;
            padding: 40px;
            width: 100%;
            max-width: 420px;
            position: relative;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s ease;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            max-height: 90vh;
            overflow-y: auto;
        }

        /* Custom scrollbar para el modal de autenticación */
        .auth-modal {
            scrollbar-width: thin; /* Firefox */
            scrollbar-color: #7dd3fc transparent; /* Firefox: thumb color, track color */
        }

        .auth-modal::-webkit-scrollbar {
            width: 8px;
        }

        .auth-modal::-webkit-scrollbar-track {
            background: transparent;
        }

        .auth-modal::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #7dd3fc, #38bdf8); /* color azul cielo */
            border-radius: 999px;
            border: 2px solid rgba(0,0,0,0.12);
        }

        .auth-modal::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #60a5fa, #0284c7);
        }
        
        .auth-modal-overlay.active .auth-modal {
            transform: translateY(0) scale(1);
        }
        
        /* Close Button */
        .auth-close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: all 0.2s;
        }
        
        .auth-close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        /* Logo */
        .auth-logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .auth-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: white;
            margin-bottom: 5px;
        }
        
        .auth-subtitle {
            color: #94a3b8;
            font-size: 0.9rem;
        }
        
        /* Tabs */
        .auth-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            background: rgba(0, 0, 0, 0.3);
            padding: 5px;
            border-radius: 12px;
        }
        
        .auth-tab {
            flex: 1;
            padding: 12px;
            border: none;
            background: transparent;
            color: #94a3b8;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        .auth-tab:hover {
            color: white;
        }
        
        .auth-tab.active {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        
        /* Forms */
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #e2e8f0;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .form-group input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(59, 130, 246, 0.2);
            border-radius: 10px;
            color: white;
            font-size: 1rem;
            transition: all 0.2s;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        .form-group input::placeholder {
            color: #64748b;
        }
        
        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #94a3b8;
            font-size: 0.9rem;
            cursor: pointer;
        }
        
        .checkbox-label input {
            width: 18px;
            height: 18px;
            accent-color: #3b82f6;
        }
        
        .forgot-link {
            color: #3b82f6;
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.2s;
        }
        
        .forgot-link:hover {
            color: #60a5fa;
        }
        
        .auth-submit-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        
        .auth-submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        
        .auth-submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }
        
        .form-error {
            color: #ef4444;
            font-size: 0.9rem;
            margin-top: 15px;
            text-align: center;
            display: none;
        }
        
        .form-error.show {
            display: block;
            animation: shake 0.3s ease;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* Separator */
        .auth-separator {
            display: flex;
            align-items: center;
            margin: 25px 0;
            color: #64748b;
            font-size: 0.85rem;
        }
        
        .auth-separator::before,
        .auth-separator::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(148, 163, 184, 0.2);
        }
        
        .auth-separator span {
            padding: 0 15px;
        }
        
        /* Social Login */
        .social-login {
            display: flex;
            gap: 10px;
        }
        
        .social-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            color: white;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .social-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
        }
        
        .social-btn.google:hover {
            border-color: #ea4335;
        }
        
        .social-btn.github:hover {
            border-color: white;
        }
        
        /* Demo Accounts */
        .demo-accounts {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .demo-title {
            color: #64748b;
            font-size: 0.8rem;
            text-align: center;
            margin-bottom: 10px;
        }
        
        .demo-account {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px dashed rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            color: #94a3b8;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 8px;
        }
        
        .demo-account:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: #3b82f6;
            color: white;
        }
        
        /* User Menu */
        .user-menu {
            position: fixed;
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 16px;
            padding: 10px;
            min-width: 260px;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.2s ease;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        
        .user-menu.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .user-menu-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            margin-bottom: 8px;
        }
        
        .user-avatar-large {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        
        .user-info {
            display: flex;
            flex-direction: column;
        }
        
        .user-fullname {
            color: white;
            font-weight: 600;
            font-size: 0.95rem;
        }
        
        .user-email {
            color: #64748b;
            font-size: 0.8rem;
        }
        
        .user-menu-items {
            padding: 5px;
        }
        
        .user-menu-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            color: #94a3b8;
            text-decoration: none;
            border-radius: 8px;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        
        .user-menu-item:hover {
            background: rgba(59, 130, 246, 0.1);
            color: white;
        }
        
        .user-menu-item.logout {
            color: #ef4444;
        }
        
        .user-menu-item.logout:hover {
            background: rgba(239, 68, 68, 0.1);
        }
        
        .user-menu-divider {
            height: 1px;
            background: rgba(148, 163, 184, 0.1);
            margin: 8px 0;
        }
        
        /* Profile Button Logged In */
        .profile-btn.logged-in {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px 6px 6px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 25px;
        }
        
        .profile-btn.logged-in:hover {
            background: rgba(59, 130, 246, 0.2);
        }
        
        .user-avatar {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
        }
        
        .user-name {
            color: white;
            font-size: 0.85rem;
            font-weight: 500;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        /* Notification enhancements */
        .notification.success {
            background: linear-gradient(135deg, #059669, #10b981);
        }
        
        .notification.error {
            background: linear-gradient(135deg, #dc2626, #ef4444);
        }
    `;
    document.head.appendChild(styles);
})();
