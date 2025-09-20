// js/main.js (Versão Final Corrigida)

// Main Application Controller
class ChurchManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.api = new ApiService();
        this.initializedPages = new Set();
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            this.showLoadingScreen();
            
            // Instancia todos os gerenciadores
            this.auth = new AuthManager(this);
            this.navigation = new NavigationManager(this);
            this.dashboard = new DashboardManager(this);
            this.pessoas = new PessoasManager(this);
            this.entradas = new EntradasManager(this);
            this.saidas = new SaidasManager(this);
            this.projetos = new ProjetosManager(this);
            this.usuarios = new UsuariosManager(this);
            this.ministerios = new MinisteriosManager(this);
            this.logs = new LogsManager(this);
            this.parametros = new ParametrosManager(this);
            this.perfil = new PerfilManager(this);
            this.configuracoes = new ConfiguracoesManager(this);
            this.controleMensalManager = new ControleMensalManager(this); 
            
            await this.checkExistingSession();
            
            this.hideLoadingScreen();
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showToast('Erro ao inicializar aplicação', 'error');
            this.hideLoadingScreen();
        }
    }

    async checkExistingSession() {
        const session = localStorage.getItem('church_session');
        if (session) {
            try {
                const userData = JSON.parse(session);
                if (userData.expires && new Date(userData.expires) > new Date()) {
                    this.currentUser = userData;
                    this.showMainApp();
                    return;
                }
            } catch (error) {
                console.error('Invalid session data:', error);
                localStorage.removeItem('church_session');
            }
        }
        this.showLoginScreen();
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').classList.remove('hidden');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('registerScreen').classList.add('hidden');
        document.getElementById('recoveryScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').classList.add('hidden');
    }

    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('registerScreen').classList.add('hidden');
        document.getElementById('recoveryScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    showRegisterScreen() {
        document.getElementById('registerScreen').classList.remove('hidden');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('recoveryScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    showRecoveryScreen() {
        document.getElementById('recoveryScreen').classList.remove('hidden');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('registerScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('registerScreen').classList.add('hidden');
        document.getElementById('recoveryScreen').classList.add('hidden');
        
        this.updateUserInfo();
        this.navigation.init();
        
        this.navigateToPage('dashboard');
        
        this.setupAdminVisibility();
    }

    updateUserInfo() {
        if (this.currentUser) {
            const roleMap = {
                'Presidente': 'Presidente',
                'Tesoureiro': 'Tesoureiro', 
                'Secretario': 'Secretário'
            };
            const displayRole = roleMap[this.currentUser.role] || this.currentUser.role;
            document.getElementById('userWelcome').textContent = 
                `Utilizador: ${this.currentUser.username} (${displayRole})`;
        }
    }

    setupAdminVisibility() {
        const adminSections = document.querySelectorAll('.admin-only');
        const isAdmin = this.currentUser && this.currentUser.role === 'Presidente';
        adminSections.forEach(section => {
            section.style.display = isAdmin ? '' : 'none';
        });
    }

    navigateToPage(pageId) {
        const managerMap = {
            dashboard: this.dashboard,
            pessoas: this.pessoas,
            entradas: this.entradas,
            saidas: this.saidas,
            projetos: this.projetos,
            'controle-mensal': this.controleMensalManager,
            ministerios: this.ministerios,
            usuarios: this.usuarios,
            logs: this.logs,
            parametros: this.parametros,
            perfil: this.perfil,
            configuracoes: this.configuracoes
        };

        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        
        // --- CORREÇÃO APLICADA AQUI ---
        // Converte o pageId de kebab-case (ex: 'controle-mensal') para camelCase (ex: 'controleMensal')
        const pageIdAsCamelCase = pageId.replace(/-./g, x => x[1].toUpperCase());
        const targetPage = document.getElementById(pageIdAsCamelCase + 'Page');
        
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            document.getElementById('pageTitle').textContent = this.getPageTitle(pageId);

            const manager = managerMap[pageId];
            if (manager) {
                if (!this.initializedPages.has(pageId)) {
                    if (typeof manager.init === 'function') {
                        manager.init();
                    }
                    this.initializedPages.add(pageId);
                }
                
                if (typeof manager.loadData === 'function') {
                    manager.loadData();
                }
            }
        }
    }

    getPageTitle(pageId) {
        const titles = {
            'dashboard': 'Dashboard Financeiro',
            'pessoas': 'Gestão de Pessoas',
            'entradas': 'Registar Entradas',
            'saidas': 'Registar Saídas',
            'projetos': 'Gestão de Projetos',
            'controle-mensal': 'Controlo Mensal',
            'ministerios': 'Painel de Gestão de Ministérios',
            'usuarios': 'Gerir Utilizadores',
            'logs': 'Logs de Auditoria do Sistema',
            'parametros': 'Central de Listas e Categorias',
            'perfil': 'Meu Perfil',
            'configuracoes': 'Configurações',
            'sobre': 'Sobre'
        };
        return titles[pageId] || 'Sistema de Gestão';
    }

    logout() {
        localStorage.removeItem('church_session');
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.initializedPages.clear();
        this.showLoginScreen();
        this.showToast('Logout realizado com sucesso', 'success');
    }

    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div>${message}</div>`;
        container.appendChild(toast);
        setTimeout(() => {
            if (container.contains(toast)) container.removeChild(toast);
        }, duration);
        toast.addEventListener('click', () => {
            if (container.contains(toast)) container.removeChild(toast);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChurchManagementApp();
});