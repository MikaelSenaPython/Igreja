// js/parametros.js

class ParametrosManager {
    constructor(app) {
        this.app = app;
        this.activeTabKey = 'tiposEntrada';
        this.selectedItems = {};
        this.listenersInitialized = false; // Adicionado
        this.lists = {
            tiposEntrada: { title: 'Tipos de Entrada', singular: 'Tipo de Entrada', data: [] },
            categoriasSaida: { title: 'Categorias de Saída', singular: 'Categoria de Saída', data: [] },
            etiquetas: { title: 'Etiquetas Pastorais', singular: 'Etiqueta Pastoral', data: [] },
        };
    }

    init() {
        // A configuração de eventos foi movida para loadData
    }

    setupEventListeners() {
        if (this.listenersInitialized) return;
        const tabs = document.querySelectorAll('.param-tabs .tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        this.listenersInitialized = true;
    }

    async loadData() {
        this.setupEventListeners(); // Chamado aqui, quando a página está visível
        try {
            const [tiposEntradaRes, categoriasSaidaRes, etiquetasRes] = await Promise.all([
                this.app.api.getTiposEntrada(),
                this.app.api.getCategoriasSaida(),
                this.app.api.getEtiquetas()
            ]);

            if (tiposEntradaRes.success) this.lists.tiposEntrada.data = tiposEntradaRes.data;
            if (categoriasSaidaRes.success) this.lists.categoriasSaida.data = categoriasSaidaRes.data;
            if (etiquetasRes.success) this.lists.etiquetas.data = etiquetasRes.data;

            this.selectedItems = {};
            this.renderAllTabs();

        } catch (error) {
            console.error("Erro ao carregar listas de parâmetros:", error);
            this.app.showToast('Erro ao carregar parâmetros', 'error');
        }
    }

    switchTab(tabKey) {
        this.activeTabKey = tabKey;

        // Atualiza botões das abas
        document.querySelectorAll('.param-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabKey);
        });

        // Atualiza conteúdo das abas
        document.querySelectorAll('.param-tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tabContent === tabKey);
        });
    }

    renderAllTabs() {
        Object.keys(this.lists).forEach(key => {
            this.renderTabContent(key);
        });
        // Garante que a aba ativa padrão esteja visível
        this.switchTab(this.activeTabKey);
    }

    renderTabContent(listKey) {
        const listInfo = this.lists[listKey];
        const container = document.querySelector(`.param-tab-content[data-tab-content="${listKey}"]`);
        if (!container) return;

        // Garante que haja um item selecionado (mesmo que vazio) para a aba
        if (!this.selectedItems[listKey]) {
            this.selectedItems[listKey] = { id: null, nome: '' };
        }
        const selectedItem = this.selectedItems[listKey];

        container.innerHTML = this.generateManagementUI(listInfo, listKey, selectedItem);
        this.populateTable(listKey);
        this.bindActionButtons(listKey);
    }
    
    generateManagementUI(listInfo, listKey, selectedItem) {
        return `
            <div class="management-section">
                <div class="management-actions">
                    <h3>Gerir ${listInfo.singular}</h3>
                    <div class="form-group">
                        <label for="itemName-${listKey}">Nome:</label>
                        <input type="text" id="itemName-${listKey}" class="form-control" value="${escapeHtml(selectedItem.nome || '')}">
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-success" data-action="save" data-key="${listKey}"><i class="fas fa-save"></i> Salvar</button>
                        <button class="btn btn-secondary" data-action="new" data-key="${listKey}"><i class="fas fa-plus"></i> Novo</button>
                    </div>
                     <div class="btn-group">
                         <button class="btn btn-danger" data-action="delete" data-key="${listKey}" ${!selectedItem.id ? 'disabled' : ''}>
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
                <div class="management-list">
                    <h3>${listInfo.title} Existentes</h3>
                    <div class="data-table-container">
                        <table class="data-table" id="paramTable-${listKey}">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    populateTable(listKey) {
        const listInfo = this.lists[listKey];
        const selectedItem = this.selectedItems[listKey];
        const tbody = document.querySelector(`#paramTable-${listKey} tbody`);
        if (!tbody) return;

        tbody.innerHTML = listInfo.data.map(item => `
            <tr data-id="${item.id}" class="${selectedItem && selectedItem.id == item.id ? 'selected' : ''}">
                <td>${item.id}</td>
                <td>${escapeHtml(item.nome)}</td>
            </tr>
        `).join('');

        tbody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.dataset.id;
                this.selectedItems[listKey] = listInfo.data.find(item => item.id == id) || { id: null, nome: '' };
                this.renderTabContent(listKey);
            });
        });
    }
    
    bindActionButtons(listKey) {
        const container = document.querySelector(`.param-tab-content[data-tab-content="${listKey}"]`);
        container.querySelector(`[data-action="save"]`).addEventListener('click', () => this.saveItem(listKey));
        container.querySelector(`[data-action="new"]`).addEventListener('click', () => this.clearSelection(listKey));
        
        const deleteBtn = container.querySelector(`[data-action="delete"]`);
        if(deleteBtn) {
           deleteBtn.addEventListener('click', () => this.deleteItem(listKey));
        }
    }

    clearSelection(listKey) {
        this.selectedItems[listKey] = { id: null, nome: '' };
        this.renderTabContent(listKey);
    }

    async saveItem(listKey) {
        const nameInput = document.getElementById(`itemName-${listKey}`);
        const newName = nameInput.value.trim();
        if (!newName) {
            this.app.showToast('O nome não pode estar vazio.', 'error');
            return;
        }

        const selectedItem = this.selectedItems[listKey];

        try {
            let response;
            if (selectedItem && selectedItem.id) {
                // Update
                response = await this.app.api.manageList(listKey, 'update', { id: selectedItem.id, nome: newName });
            } else {
                // Add
                response = await this.app.api.manageList(listKey, 'add', { nome: newName });
            }

            if (response.success) {
                this.app.showToast(`${this.lists[listKey].singular} salvo com sucesso!`, 'success');
                await this.loadData(); // Recarrega todos os dados e renderiza
            } else {
                this.app.showToast(response.error, 'error');
            }
        } catch (error) {
            this.app.showToast('Erro de sistema ao salvar.', 'error');
        }
    }

    async deleteItem(listKey) {
        const selectedItem = this.selectedItems[listKey];
        if (!selectedItem || !selectedItem.id) return;
        
        if (!confirm(`Tem a certeza que deseja excluir "${selectedItem.nome}"?`)) return;

        try {
            const response = await this.app.api.manageList(listKey, 'delete', { id: selectedItem.id });
            if (response.success) {
                this.app.showToast('Item excluído com sucesso!', 'success');
                await this.loadData(); // Recarrega todos os dados e renderiza
            } else {
                this.app.showToast(response.error, 'error');
            }
        } catch (error) {
             this.app.showToast('Erro de sistema ao excluir.', 'error');
        }
    }
}