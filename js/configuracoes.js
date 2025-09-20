// js/configuracoes.js

class ConfiguracoesManager {
    constructor(app) {
        this.app = app;
        this.listenersInitialized = false; // Adicionado
    }

    init() {
        // A configuração de eventos foi movida para loadData
    }

    setupEventListeners() {
        if (this.listenersInitialized) return;
        const form = document.getElementById('churchInfoForm');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveInfo();
        });
        
        document.getElementById('backupBtn')?.addEventListener('click', () => this.createBackup());
        document.getElementById('restoreBtn')?.addEventListener('click', () => this.restoreBackup());
        this.listenersInitialized = true;
    }

    async loadData() {
        this.setupEventListeners(); // Chamado aqui, quando a página está visível
        if (this.app.auth.isAdmin()) {
            try {
                const response = await this.app.api.getChurchInfo();
                if (response.success) {
                    document.getElementById('churchName').value = response.data.name;
                    document.getElementById('churchAddress').value = response.data.address;
                }
            } catch (error) {
                console.error("Erro ao carregar informações da igreja:", error);
            }
        }
    }

    async saveInfo() {
        const name = document.getElementById('churchName').value;
        const address = document.getElementById('churchAddress').value;

        if (!name || !address) {
            this.app.showToast('Todos os campos de informação são obrigatórios.', 'error');
            return;
        }

        try {
            const response = await this.app.api.saveChurchInfo({ name, address });
            if (response.success) {
                this.app.showToast('Informações da igreja salvas com sucesso!', 'success');
            } else {
                this.app.showToast('Erro ao salvar informações.', 'error');
            }
        } catch(error) {
            this.app.showToast('Erro de sistema ao salvar as informações.', 'error');
        }
    }

    async createBackup() {
        if (!confirm('Deseja criar um arquivo de backup com todos os dados do sistema?')) return;
        
        try {
            const response = await this.app.api.createBackup();
            if (response.success) {
                this.app.showToast(response.message, 'success');
            }
        } catch (error) {
            this.app.showToast('Ocorreu um erro ao gerar o backup.', 'error');
        }
    }

    restoreBackup() {
        if (!confirm('ATENÇÃO: Restaurar um backup substituirá TODOS os dados atuais. Esta ação não pode ser desfeita. Deseja continuar?')) return;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');

            reader.onload = async readerEvent => {
                const content = readerEvent.target.result;
                const response = await this.app.api.restoreBackup(content);
                if (response.success) {
                    this.app.showToast('Backup restaurado com sucesso! O sistema será reiniciado.', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    this.app.showToast(response.error, 'error');
                }
            }
        }
        input.click();
    }
}