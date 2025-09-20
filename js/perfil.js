class PerfilManager {
    constructor(app) {
        this.app = app;
        this.listenersInitialized = false; // Adicionado
    }

    init() {
        // A configuração de eventos foi movida para loadData
    }

    setupEventListeners() {
        if (this.listenersInitialized) return;
        // Tab switching
        const tabs = document.querySelectorAll('#perfilPage .param-tabs .tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Save password button
        document.getElementById('savePasswordBtn')?.addEventListener('click', () => this.saveNewPassword());
        this.listenersInitialized = true;
    }

    async loadData() {
        this.setupEventListeners(); // Chamado aqui, quando a página está visível
        this.clearPasswordForm();
        try {
            const response = await this.app.api.getUserAssociations(this.app.currentUser.id);
            if (response.success) {
                this.displayAssociations(response.data);
            } else {
                this.app.showToast('Erro ao carregar associações.', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar dados do perfil:', error);
        }
    }
    
    switchTab(tabKey) {
        document.querySelectorAll('#perfilPage .param-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabKey);
        });
        document.querySelectorAll('#perfilPage .param-tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tabContent === tabKey);
        });
    }

    displayAssociations({ ministerios, etiquetas }) {
        const minList = document.getElementById('profileMinistriesList');
        const etqList = document.getElementById('profileEtiquetasList');

        minList.innerHTML = ministerios.length > 0 
            ? ministerios.map(nome => `<li>${escapeHtml(nome)}</li>`).join('')
            : '<li>Nenhum ministério associado.</li>';

        etqList.innerHTML = etiquetas.length > 0
            ? etiquetas.map(nome => `<li>${escapeHtml(nome)}</li>`).join('')
            : '<li>Nenhuma etiqueta associada.</li>';
    }

    clearPasswordForm() {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    }

    async saveNewPassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            this.app.showToast('Todos os campos são obrigatórios.', 'error');
            return;
        }

        if (newPassword.length < 4) {
            this.app.showToast('A nova senha deve ter pelo menos 4 caracteres.', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            this.app.showToast('As novas senhas não conferem.', 'error');
            return;
        }

        const saveBtn = document.getElementById('savePasswordBtn');
        try {
            setButtonLoading(saveBtn, true);
            const response = await this.app.api.changePassword(this.app.currentUser.id, currentPassword, newPassword);

            if (response.success) {
                this.app.showToast('Senha alterada com sucesso!', 'success');
                this.clearPasswordForm();
            } else {
                this.app.showToast(response.error, 'error');
            }
        } catch(error) {
            console.error('Erro ao alterar senha:', error);
            this.app.showToast('Ocorreu um erro de sistema ao tentar alterar a senha.', 'error');
        } finally {
            setButtonLoading(saveBtn, false);
        }
    }
}