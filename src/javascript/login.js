// Sistema de autenticación optimizado - GitGame Store
// Clase principal de autenticación
class Auth {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.users = this.loadUsers();
        this.updateUI();
    }

    // Inicializar eventos y UI
    init() {
        this.updateUI();
        this.setupEventListeners();
    }

    // Carga usuarios simulados
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

    // Guarda usuarios
    // Guardar usuarios en localStorage
    saveUsers() {
        localStorage.setItem('gitgame_users', JSON.stringify(this.users));
    }

    // Obtiene usuario actual
    // Obtener usuario actual de la sesión
    getCurrentUser() {
        const session = localStorage.getItem('gitgame_session');
        return session ? JSON.parse(session) : null;
    }

    // Proceso de login
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

    // Proceso de registro
    // Registrar nuevo usuario
    async register(name, email, password, confirmPassword) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!name || !email || !password) return reject(new Error('Completa todos los campos'));
                if (password !== confirmPassword) return reject(new Error('Las contraseñas no coinciden'));
                if (password.length < 6) return reject(new Error('Mínimo 6 caracteres'));
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reject(new Error('Email inválido'));
                if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) return reject(new Error('Email ya registrado'));
                const newUser = {id: Date.now(), email: email.toLowerCase(), password, name: name.trim(), avatar: ['🎮', '🎲', '🎯', '🚀', '⭐', '💎'][Math.random()*6|0], isAdmin: false};
                this.users.push(newUser);
                this.saveUsers();
                const sessionUser = {id: newUser.id, email: newUser.email, name: newUser.name, avatar: newUser.avatar, isAdmin: false};
                localStorage.setItem('gitgame_session', JSON.stringify(sessionUser));
                this.currentUser = sessionUser;
                this.updateUI();
                this.showNotification(`Cuenta creada`, 'success');
                resolve(sessionUser);
            }, 500);
        });
    }

    // Proceso de logout
    async logout() {
        localStorage.removeItem('gitgame_session');
        this.currentUser = null;
        this.updateUI();
        this.showNotification('Sesión cerrada');
    }

    // Actualiza UI
    updateUI() {
        const btn = document.querySelector('.profile-btn');
        if (!btn) return;
        if (this.currentUser) {
            btn.innerHTML = `<div class="user-avatar">${this.currentUser.avatar}</div><span>${this.currentUser.name}</span>`;
            btn.classList.add('logged-in');
            btn.onclick = () => this.showUserMenu(btn);
        } else {
            btn.innerHTML = '<svg class="w-6 h-6" fill="currentColor"><use xlink:href="../src/img/sprites.svg#icon-profile"></use></svg>';
            btn.classList.remove('logged-in');
            btn.onclick = () => this.showAuthModal();
        }
    }

    // Muestra modal
    showAuthModal(mode = 'login') {
        let modal = document.getElementById('authModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'authModal';
            modal.className = 'auth-modal-overlay';
            modal.innerHTML = `<div class="auth-modal"><button class="auth-close-btn" onclick="auth.closeAuthModal()">✕</button><h2 style="text-align:center;color:white;margin-bottom:20px">🎮 Bienvenido</h2><div class="auth-tabs"><button class="auth-tab active" data-mode="login" onclick="auth.switchAuthMode('login')">Iniciar Sesión</button><button class="auth-tab" data-mode="register" onclick="auth.switchAuthMode('register')">Registrarse</button></div><form id="loginForm" class="auth-form active" onsubmit="auth.handleLogin(event)"><input type="email" id="loginEmail" placeholder="correo@ejemplo.com" required><input type="password" id="loginPassword" placeholder="••••••••" required><button type="submit" class="auth-submit-btn">Iniciar Sesión</button><div id="loginError" style="color:#ef4444;font-size:0.9rem;margin-top:10px;text-align:center"></div></form><form id="registerForm" class="auth-form" onsubmit="auth.handleRegister(event)"><input type="text" id="registerName" placeholder="Tu nombre" required><input type="email" id="registerEmail" placeholder="correo@ejemplo.com" required><input type="password" id="registerPassword" placeholder="Mínimo 6 caracteres" required minlength="6"><input type="password" id="registerConfirmPassword" placeholder="Confirmar contraseña" required><button type="submit" class="auth-submit-btn">Crear Cuenta</button><div id="registerError" style="color:#ef4444;font-size:0.9rem;margin-top:10px;text-align:center"></div></form><div style="padding:1rem 0;font-size:0.8rem;color:#94a3b8;text-align:center">Demo: admin@gitgame.com / admin123</div></div>`;
            document.body.appendChild(modal);
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.switchAuthMode(mode);
    }

    // Cambia modo login/registro
    switchAuthMode(mode) {
        const modal = document.getElementById('authModal');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const loginTab = modal.querySelector('[data-mode="login"]');
        const registerTab = modal.querySelector('[data-mode="register"]');
        if (mode === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        }
        document.getElementById('loginError').textContent = '';
        document.getElementById('registerError').textContent = '';
    }

    // Maneja submit login
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

    // Maneja submit registro
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

    // Cierra modal
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Muestra menú usuario
    showUserMenu(btn) {
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
        menu.innerHTML = `<div class="user-menu-header"><span style="font-size:2rem">${this.currentUser.avatar}</span><div><strong>${this.currentUser.name}</strong><br><small>${this.currentUser.email}</small></div></div><a href="#" class="user-menu-item" onclick="auth.showProfile(); return false;">👤 Mi Perfil</a><a href="../../html/favoritos.html" class="user-menu-item">❤️ Mis Favoritos</a><a href="#" class="user-menu-item" onclick="auth.handleLogout(); return false;">🚪 Cerrar Sesión</a>`;
        menu.classList.add('active');
        setTimeout(() => document.addEventListener('click', (e) => {if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove('active');}, 100));
    }

    // Muestra perfil
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
            document.body.appendChild(modal);
        }
        modal.innerHTML = `<div class="auth-modal"><button class="auth-close-btn" onclick="document.getElementById('profileModal').remove(); document.body.style.overflow='auto'">✕</button><div style="text-align:center;padding:20px"><div style="font-size:3rem;margin-bottom:10px">${this.currentUser.avatar}</div><h2 style="color:white;margin-bottom:5px">${this.currentUser.name}</h2><p style="color:#94a3b8;margin-bottom:20px">${this.currentUser.email}</p><button class="auth-submit-btn" onclick="document.getElementById('profileModal').remove(); document.body.style.overflow='auto'">Cerrar</button></div></div>`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Maneja logout
    async handleLogout() {
        await this.logout();
    }

    // Muestra notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `position:fixed;top:20px;right:20px;padding:1rem;border-radius:8px;color:white;background:${type==='success'?'#10b981':'#ef4444'};z-index:9999`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}


// Inicialización
let auth;
document.addEventListener('DOMContentLoaded', () => {
    auth = new Auth();
    addAuthStyles();
});

// Estilos CSS inyectados
function addAuthStyles() {
    if (document.getElementById('auth-styles')) return;
    const styles = document.createElement('style');
    styles.id = 'auth-styles';
    styles.textContent = `.auth-modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;visibility:hidden;transition:all 0.3s}.auth-modal-overlay.active{opacity:1;visibility:visible}.auth-modal{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid rgba(59,130,246,0.3);border-radius:20px;padding:40px;width:100%;max-width:420px;position:relative;transform:translateY(20px)scale(0.95);transition:all 0.3s;box-shadow:0 25px 50px rgba(0,0,0,0.5)}.auth-modal-overlay.active .auth-modal{transform:translateY(0)scale(1)}.auth-close-btn{position:absolute;top:15px;right:15px;background:0;border:0;color:#94a3b8;cursor:pointer;font-size:1.5rem;transition:all 0.2s}.auth-close-btn:hover{color:white}.auth-tabs{display:flex;gap:10px;margin-bottom:25px;background:rgba(0,0,0,0.3);padding:5px;border-radius:12px}.auth-tab{flex:1;padding:12px;border:0;background:0;color:#94a3b8;cursor:pointer;border-radius:8px;transition:all 0.2s}.auth-tab.active{background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;box-shadow:0 4px 15px rgba(59,130,246,0.4)}.auth-form{display:none}.auth-form.active{display:block}.auth-form input{width:100%;padding:14px;background:rgba(0,0,0,0.3);border:2px solid rgba(59,130,246,0.2);border-radius:10px;color:white;font-size:1rem;margin-bottom:15px;transition:all 0.2s;box-sizing:border-box}.auth-form input:focus{outline:0;border-color:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,0.1)}.auth-submit-btn{width:100%;padding:14px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border:0;border-radius:10px;color:white;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(59,130,246,0.4)}.auth-submit-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(59,130,246,0.5)}.user-menu{position:fixed;background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid rgba(59,130,246,0.3);border-radius:16px;padding:10px;min-width:260px;z-index:10000;opacity:0;visibility:hidden;transform:translateY(-10px);transition:all 0.2s;box-shadow:0 20px 40px rgba(0,0,0,0.4)}.user-menu.active{opacity:1;visibility:visible;transform:translateY(0)}.user-menu-header{display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid rgba(148,163,184,0.1);margin-bottom:8px;color:white}.user-menu-item{display:block;padding:10px 12px;color:#94a3b8;text-decoration:none;border-radius:8px;font-size:0.9rem;transition:all 0.2s}.user-menu-item:hover{background:rgba(59,130,246,0.1);color:white}.user-avatar{width:28px;height:28px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.9rem}.user-name{color:white;font-size:0.85rem;font-weight:500}.profile-btn.logged-in{display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:25px}.profile-btn.logged-in:hover{background:rgba(59,130,246,0.2)}`;
    document.head.appendChild(styles);
}
