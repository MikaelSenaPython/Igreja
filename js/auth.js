// Authentication Manager
class AuthManager {
    constructor(app) {
        this.app = app;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Recovery form
        const recoveryForm = document.getElementById('recoveryForm');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => this.handleRecovery(e));
        }

        // Navigation links
        const registerLink = document.getElementById('registerLink');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.app.showRegisterScreen();
            });
        }

        const backToLoginLink = document.getElementById('backToLoginLink');
        if (backToLoginLink) {
            backToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.app.showLoginScreen();
            });
        }

        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.app.showRecoveryScreen();
            });
        }

        const backToLoginFromRecovery = document.getElementById('backToLoginFromRecovery');
        if (backToLoginFromRecovery) {
            backToLoginFromRecovery.addEventListener('click', (e) => {
                e.preventDefault();
                this.app.showLoginScreen();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Enter key handling
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin(e);
                }
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target.closest('form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validation
        if (!username || !password) {
            this.app.showToast('Por favor, preencha todos os campos', 'error');
            return;
        }

        try {
            setButtonLoading(submitBtn, true);
            
            const response = await this.app.api.login(username, password);
            
            if (response.success) {
                const userData = response.data;
                
                // Set session expiration
                const expiry = new Date();
                if (rememberMe) {
                    expiry.setDate(expiry.getDate() + 30); // 30 days
                } else {
                    expiry.setHours(expiry.getHours() + 8); // 8 hours
                }
                
                userData.expires = expiry.toISOString();
                
                // Store session
                localStorage.setItem('church_session', JSON.stringify(userData));
                
                // Set current user
                this.app.currentUser = userData;
                
                // Show main app
                this.app.showMainApp();
                
                this.app.showToast(`Bem-vindo, ${userData.username}!`, 'success');
                
                // Clear form
                form.reset();
                
            } else {
                this.app.showToast(response.error || 'Erro ao fazer login', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.app.showToast('Erro de conexão. Tente novamente.', 'error');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target.closest('form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const role = document.getElementById('regRole').value;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            this.app.showToast('Por favor, preencha todos os campos', 'error');
            return;
        }

        if (!validateEmail(email)) {
            this.app.showToast('Por favor, insira um email válido', 'error');
            return;
        }

        if (password.length < 4) {
            this.app.showToast('A senha deve ter pelo menos 4 caracteres', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.app.showToast('As senhas não conferem', 'error');
            return;
        }

        try {
            setButtonLoading(submitBtn, true);
            
            const response = await this.app.api.register({
                username,
                email,
                password,
                role // CORRIGIDO: agora estamos enviando a variável correta
            });
            
            if (response.success) {
                this.app.showToast(`Usuário '${username}' registrado com sucesso!`, 'success');
                this.app.showLoginScreen();
                form.reset();
            } else {
                this.app.showToast(response.error || 'Erro ao registrar usuário', 'error');
            }
            
        } catch (error) {
            console.error('Register error:', error);
            this.app.showToast('Erro de conexão. Tente novamente.', 'error');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    }

    async handleRecovery(e) {
        e.preventDefault();
        
        const form = e.target.closest('form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('recoveryEmail').value.trim();

        // Validation
        if (!email) {
            this.app.showToast('Por favor, insira seu email', 'error');
            return;
        }

        if (!validateEmail(email)) {
            this.app.showToast('Por favor, insira um email válido', 'error');
            return;
        }

        try {
            setButtonLoading(submitBtn, true);
            
            const response = await this.app.api.recoverPassword(email);
            
            if (response.success) {
                this.app.showToast(response.message || 'Código enviado para seu email', 'success');
                this.app.showLoginScreen();
                form.reset();
            } else {
                this.app.showToast(response.error || 'Erro ao enviar código', 'error');
            }
            
        } catch (error) {
            console.error('Recovery error:', error);
            this.app.showToast('Erro de conexão. Tente novamente.', 'error');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    }

    handleLogout() {
        if (confirm('Tem certeza que deseja sair do sistema?')) {
            this.app.logout();
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.app.currentUser !== null;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.app.currentUser && this.app.currentUser.role === role;
    }

    // Check if user is admin (Presidente)
    isAdmin() {
        return this.hasRole('Presidente');
    }
}