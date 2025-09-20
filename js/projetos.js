// Projetos Manager
class ProjetosManager {
    constructor(app) {
        this.app = app;
        this.currentProjetos = [];
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add project button
        const addBtn = document.getElementById('addProjetoBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openProjetoModal());
        }
    }

    async loadData() {
        try {
            const response = await this.app.api.getProjetos();
            
            if (response.success) {
                this.currentProjetos = response.data;
                this.updateTable();
            } else {
                this.app.showToast('Erro ao carregar projetos', 'error');
            }
        } catch (error) {
            console.error('Load projetos error:', error);
            this.app.showToast('Erro ao carregar dados', 'error');
        }
    }

    updateTable() {
        const tbody = document.querySelector('#projetosTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.currentProjetos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">Nenhum projeto encontrado</td>
                </tr>
            `;
            return;
        }

        this.currentProjetos.forEach(projeto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${projeto.id}</td>
                <td>${escapeHtml(projeto.nome)}</td>
                <td>
                    <span class="status-badge ${projeto.ativo ? 'ativo' : 'inativo'}">
                        ${projeto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.projetos.editProjeto(${projeto.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.projetos.deleteProjeto(${projeto.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    openProjetoModal(projetoId = null) {
        this.app.showToast('Modal de projeto em desenvolvimento', 'info');
        // TODO: Implement project modal
    }

    async editProjeto(projetoId) {
        this.app.showToast('Edição de projeto em desenvolvimento', 'info');
        // TODO: Implement edit functionality
    }

    async deleteProjeto(projetoId) {
        const projeto = this.currentProjetos.find(p => p.id === projetoId);
        if (!projeto) return;

        const confirmMsg = `Tem certeza que deseja inativar o projeto "${projeto.nome}"?`;
        if (!confirm(confirmMsg)) {
            return;
        }

        this.app.showToast('Exclusão de projeto em desenvolvimento', 'info');
        // TODO: Implement delete functionality
    }
}