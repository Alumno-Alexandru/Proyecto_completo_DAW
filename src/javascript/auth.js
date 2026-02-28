// ============================================
// SISTEMA DE AUTENTICACIÓN - Módulo separado
// ============================================

// Clase principal de autenticación
class Auth {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.users = this.loadUsers();
        this.addAuthStyles();
        this.updateUI();
    }

    // Agregar estilos CSS necesarios
    addAuthStyles() {
        if (document.getElementById('auth-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'auth-styles';
        styles.textContent = `
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

            .animate-slide-in {
                animation: slideIn 0.3s ease-out;
            }

            .auth-tab-btn.active {
                @apply bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg;
            }

            .auth-form-container.hidden {
                @apply hidden;
            }

            #authOverlay > div {
                animation: fadeInScale 0.3s ease-out;
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Carga usuarios simulados
    // Cargar usuarios desde localStorage o usar datos por defecto
    loadUsers() {
        const storedUsers = localStorage.getItem('gitgame_users');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }
        
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

    // Proceso de login
    // Iniciar sesión
    login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.users.find(u => 
                    u.email.toLowerCase() === email.toLowerCase() && 
                    u.password === password
                );

                if (user) {
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

    // Proceso de registro
    // Registrar nuevo usuario
    async register(name, email, password, confirmPassword) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!name || !email || !password) {
                    return reject(new Error('Completa todos los campos'));
                }
                if (password !== confirmPassword) {
                    return reject(new Error('Las contraseñas no coinciden'));
                }
                if (password.length < 6) {
                    return reject(new Error('Mínimo 6 caracteres'));
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    return reject(new Error('Email inválido'));
                }
                if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                    return reject(new Error('Email ya registrado'));
                }
                
                const avatars = ['🎮', '🎲', '🎯', '🚀', '⭐', '💎'];
                const newUser = {
                    id: Date.now(),
                    email: email.toLowerCase(),
                    password: password,
                    name: name.trim(),
                    avatar: avatars[Math.random() * 6 | 0],
                    isAdmin: false
                };
                
                this.users.push(newUser);
                this.saveUsers();
                
                const sessionUser = {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    avatar: newUser.avatar,
                    isAdmin: false
                };
                
                localStorage.setItem('gitgame_session', JSON.stringify(sessionUser));
                this.currentUser = sessionUser;
                this.updateUI();
                this.showNotification('Cuenta creada', 'success');
                resolve(sessionUser);
            }, 500);
        });
    }

    // Proceso de logout
    // Cerrar sesión
    async logout() {
        localStorage.removeItem('gitgame_session');
        this.currentUser = null;
        this.updateUI();
        this.showNotification('Sesión cerrada');
    }

    // Actualiza el botón de perfil en la UI
    // Actualizar la UI con el estado del usuario
    updateUI() {
        const btn = document.querySelector('.profile-btn');
        if (!btn) return;
        
        if (this.currentUser) {
            btn.innerHTML = `
                <div class="relative w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                    ${this.currentUser.avatar}
                </div>
                <span class="hidden md:inline text-sm font-medium">${this.currentUser.name}</span>
            `;
            btn.classList.add('logged-in');
            btn.onclick = () => this.showUserMenu(btn);
        } else {
            btn.innerHTML = '<svg class="w-6 h-6" fill="currentColor"><use xlink:href="../src/img/sprites.svg#icon-profile"></use></svg>';
            btn.classList.remove('logged-in');
            btn.onclick = () => this.showAuthModal();
        }
    }

    // Muestra el modal de login/registro
    // Mostrar modal de autenticación
    showAuthModal(mode = 'login') {
        let overlay = document.getElementById('authOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'authOverlay';
            overlay.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 opacity-0 invisible pointer-events-none transition-all duration-300';
            overlay.innerHTML = this.getAuthModalHTML();
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeAuthModal();
            });
            document.body.appendChild(overlay);
        }
        overlay.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
        overlay.classList.add('opacity-100', 'visible');
        document.body.style.overflow = 'hidden';
        this.switchAuthMode(mode);
    }

    // Genera el HTML del modal
    // HTML del modal de autenticación
    getAuthModalHTML() {
        return `
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl p-10 w-full max-w-md relative shadow-2xl">
                <button class="absolute top-4 right-4 bg-transparent border-0 text-slate-400 hover:text-white cursor-pointer text-2xl transition-colors" onclick="auth.closeAuthModal()">✕</button>
                <h2 class="text-center text-white text-2xl font-bold mb-6">🎮 Bienvenido</h2>
                
                <div class="flex gap-2 mb-6 bg-black/30 p-1 rounded-xl">
                    <button class="auth-tab-btn active flex-1 py-3 border-0 bg-transparent text-slate-300 cursor-pointer rounded-lg transition-all font-medium" data-mode="login" onclick="auth.switchAuthMode('login')">Iniciar Sesión</button>
                    <button class="auth-tab-btn flex-1 py-3 border-0 bg-transparent text-slate-300 cursor-pointer rounded-lg transition-all font-medium" data-mode="register" onclick="auth.switchAuthMode('register')">Registrarse</button>
                </div>

                <form id="loginForm" class="auth-form-container active" onsubmit="auth.handleLogin(event)">
                    <input type="email" id="loginEmail" placeholder="correo@ejemplo.com" class="w-full px-4 py-3 bg-black/30 border-2 border-blue-500/20 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                    <input type="password" id="loginPassword" placeholder="••••••••" class="w-full px-4 py-3 bg-black/30 border-2 border-blue-500/20 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                    <button type="submit" class="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 border-0 rounded-xl text-white font-semibold cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">Iniciar Sesión</button>
                    <div id="loginError" class="text-red-500 text-sm mt-3 text-center"></div>
                </form>

                <form id="registerForm" class="auth-form-container hidden" onsubmit="auth.handleRegister(event)">
                    <input type="text" id="registerName" placeholder="Tu nombre" class="w-full px-4 py-3 bg-black/30 border-2 border-blue-500/20 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                    <input type="email" id="registerEmail" placeholder="correo@ejemplo.com" class="w-full px-4 py-3 bg-black/30 border-2 border-blue-500/20 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                    <input type="password" id="registerPassword" placeholder="Mínimo 6 caracteres" class="w-full px-4 py-3 bg-black/30 border-2 border-blue-500/20 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required minlength="6">
                    <input type="password" id="registerConfirmPassword" placeholder="Confirmar contraseña" class="w-full px-4 py-3 bg-black/30 border-2 border-blue-500/20 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                    <button type="submit" class="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 border-0 rounded-xl text-white font-semibold cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">Crear Cuenta</button>
                    <div id="registerError" class="text-red-500 text-sm mt-3 text-center"></div>
                </form>

                <div class="pt-4 text-xs text-slate-400 text-center">Demo: admin@gitgame.com / admin123</div>
            </div>
        `;
    }

    // Cambia entre pestaña login y registro
    // Cambiar modo entre login y registro
    switchAuthMode(mode) {
        const overlay = document.getElementById('authOverlay');
        if (!overlay) return;
        
        const forms = overlay.querySelectorAll('.auth-form-container');
        const tabs = overlay.querySelectorAll('.auth-tab-btn');
        
        forms.forEach(form => form.classList.add('hidden'));
        tabs.forEach(tab => tab.classList.remove('active'));
        
        if (mode === 'login') {
            document.getElementById('loginForm').classList.remove('hidden');
            tabs[0].classList.add('active');
        } else {
            document.getElementById('registerForm').classList.remove('hidden');
            tabs[1].classList.add('active');
        }
        
        document.getElementById('loginError').textContent = '';
        document.getElementById('registerError').textContent = '';
    }

    // Maneja el submit de login
    // Manejar envío del formulario de login
    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '';
        
        try {
            await this.login(email, password);
            this.closeAuthModal();
        } catch (error) {
            errorDiv.textContent = error.message;
        }
    }

    // Maneja el submit de registro
    // Manejar envío del formulario de registro
    async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const errorDiv = document.getElementById('registerError');
        errorDiv.textContent = '';
        
        try {
            await this.register(name, email, password, confirmPassword);
            this.closeAuthModal();
        } catch (error) {
            errorDiv.textContent = error.message;
        }
    }

    // Cierra el modal
    // Cerrar modal de autenticación
    closeAuthModal() {
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.classList.add('opacity-0', 'invisible', 'pointer-events-none');
            overlay.classList.remove('opacity-100', 'visible');
            document.body.style.overflow = 'auto';
        }
    }

    // Muestra menú desplegable de usuario
    // Mostrar menú de usuario
    showUserMenu(btn) {
        let menu = document.getElementById('userMenu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'userMenu';
            menu.className = 'fixed bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl p-2 min-w-xs z-50 opacity-0 invisible pointer-events-none transition-all duration-200';
            document.body.appendChild(menu);
        }
        
        const rect = btn.getBoundingClientRect();
        menu.style.top = (rect.bottom + 10) + 'px';
        menu.style.right = (window.innerWidth - rect.right) + 'px';
        menu.innerHTML = `
            <div class="flex items-center gap-3 px-3 py-3 border-b border-slate-400/10 mb-2 text-white">
                <span class="text-2xl">${this.currentUser.avatar}</span>
                <div>
                    <strong class="block">${this.currentUser.name}</strong>
                    <small class="text-slate-400 block">${this.currentUser.email}</small>
                </div>
            </div>
            <a href="#" class="block px-3 py-2 text-slate-300 no-underline rounded-lg text-sm transition-all hover:bg-blue-500/10 hover:text-white" onclick="auth.showProfile(); return false;">👤 Mi Perfil</a>
            <a href="favoritos.html" class="block px-3 py-2 text-slate-300 no-underline rounded-lg text-sm transition-all hover:bg-blue-500/10 hover:text-white">❤️ Mis Favoritos</a>
            <a href="#" class="block px-3 py-2 text-slate-300 no-underline rounded-lg text-sm transition-all hover:bg-blue-500/10 hover:text-white" onclick="auth.handleLogout(); return false;">🚪 Cerrar Sesión</a>
        `;
        menu.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
        menu.classList.add('opacity-100', 'visible');
        
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target) && !btn.contains(e.target)) {
                    menu.classList.add('opacity-0', 'invisible', 'pointer-events-none');
                    menu.classList.remove('opacity-100', 'visible');
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 100);
    }

    // Muestra modal de perfil
    // Mostrar perfil del usuario
    showProfile() {
        const menu = document.getElementById('userMenu');
        if (menu) {
            menu.classList.add('opacity-0', 'invisible', 'pointer-events-none');
            menu.classList.remove('opacity-100', 'visible');
        }
        
        if (!this.currentUser) {
            this.showAuthModal('login');
            return;
        }
        
        let overlay = document.getElementById('profileOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'profileOverlay';
            overlay.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 opacity-0 invisible pointer-events-none transition-all duration-300';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl p-10 w-full max-w-md relative shadow-2xl">
                <button class="absolute top-4 right-4 bg-transparent border-0 text-slate-400 hover:text-white cursor-pointer text-2xl transition-colors" onclick="(function() { const el = document.getElementById('profileOverlay'); if (el) { el.classList.add('opacity-0', 'invisible', 'pointer-events-none'); el.classList.remove('opacity-100', 'visible'); document.body.style.overflow='auto'; } })()">✕</button>
                <div class="text-center py-5">
                    <div class="text-5xl mb-3">${this.currentUser.avatar}</div>
                    <h2 class="text-white text-2xl font-bold mb-1">${this.currentUser.name}</h2>
                    <p class="text-slate-400 mb-6">${this.currentUser.email}</p>
                    <button class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 border-0 rounded-xl text-white font-semibold cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5" onclick="(function() { const el = document.getElementById('profileOverlay'); if (el) { el.classList.add('opacity-0', 'invisible', 'pointer-events-none'); el.classList.remove('opacity-100', 'visible'); document.body.style.overflow='auto'; } })()">Cerrar</button>
                </div>
            </div>
        `;
        overlay.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
        overlay.classList.add('opacity-100', 'visible');
        document.body.style.overflow = 'hidden';
    }

    // Ejecuta logout
    // Manejar logout
    async handleLogout() {
        await this.logout();
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgClass = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
        notification.className = `fixed top-5 right-5 px-4 py-3 ${bgClass} text-white rounded-lg z-50 animate-slide-in`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}
