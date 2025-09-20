// js/ministerios.js

class MinisteriosManager {
    constructor(app) {
        this.app = app;
        this.ministerios = [];
        this.categorias = [];
        this.selectedMinisterioId = null;
        this.listenersInitialized = false; // Adicionado
    }

    init() {
        // A configuração de eventos foi movida para loadData
    }

    setupEventListeners() {
        if (this.listenersInitialized) return;
        const addBtn = document.getElementById('addMinisterioBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openMinisterioModal());
        }
        this.listenersInitialized = true;
    }

    async loadData() {
        this.setupEventListeners(); // Chamado aqui, quando a página está visível
        try {
            const [ministeriosRes, categoriasRes] = await Promise.all([
                this.app.api.getMinisterios(),
                this.app.api.getCategoriasMinisterio()
            ]);

            if (ministeriosRes.success) this.ministerios = ministeriosRes.data;
            if (categoriasRes.success) this.categorias = categoriasRes.data;

            this.render();
        } catch (error) {
            console.error("Erro ao carregar dados de ministérios:", error);
            this.app.showToast('Não foi possível carregar os ministérios', 'error');
        }
    }

    render() {
        const container = document.getElementById('ministeriosContainer');
        if (!container) return;
        container.innerHTML = '';

        const grouped = this.categorias.map(cat => ({
            ...cat,
            ministerios: this.ministerios.filter(m => m.categoriaId === cat.id)
        })).filter(cat => cat.ministerios.length > 0);


        grouped.forEach(category => {
            const hub = this.createCategoryHub(category);
            container.appendChild(hub);
        });
    }

    createCategoryHub(category) {
        const hubDiv = document.createElement('div');
        hubDiv.className = 'category-hub';

        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <h3>${escapeHtml(category.nome)}</h3>
            <i class="fas fa-chevron-down toggle-icon"></i>
        `;

        const tableContainer = document.createElement('div');
        tableContainer.className = 'ministerios-table-container';
        
        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome do Ministério</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${category.ministerios.map(m => `
                    <tr data-ministerio-id="${m.id}">
                        <td>${m.id}</td>
                        <td>${escapeHtml(m.nome)}</td>
                        <td>
                             <div class="table-actions">
                                <button class="btn btn-sm btn-primary edit-ministerio-btn" data-id="${m.id}"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-danger delete-ministerio-btn" data-id="${m.id}"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        tableContainer.appendChild(table);
        hubDiv.appendChild(header);
        hubDiv.appendChild(tableContainer);

        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            tableContainer.classList.toggle('collapsed');
        });

        hubDiv.querySelectorAll('.edit-ministerio-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                 e.stopPropagation();
                 this.openMinisterioModal(btn.dataset.id)
            });
        });

        hubDiv.querySelectorAll('.delete-ministerio-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteMinisterio(btn.dataset.id);
            });
        });

        return hubDiv;
    }

    async openMinisterioModal(id = null) {
        const modal = document.getElementById('ministerioModal');
        const form = document.getElementById('ministerioForm');
        const title = document.getElementById('ministerioModalTitle');

        form.reset();
        form.dataset.id = '';

        const categoriaSelect = document.getElementById('ministerioCategoria');
        categoriaSelect.innerHTML = this.categorias.map(c => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join('');

        if (id) {
            title.textContent = 'Editar Ministério';
            const ministerio = this.ministerios.find(m => m.id == id);
            if (ministerio) {
                form.dataset.id = id;
                document.getElementById('ministerioNome').value = ministerio.nome;
                categoriaSelect.value = ministerio.categoriaId;
            }
        } else {
            title.textContent = 'Adicionar Novo Ministério';
        }

        modal.classList.add('show');

        document.getElementById('closeMinisterioModal').onclick = () => modal.classList.remove('show');
        document.getElementById('cancelMinisterioModal').onclick = () => modal.classList.remove('show');
        
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveMinisterio();
        };
    }
    
    async saveMinisterio() {
        const form = document.getElementById('ministerioForm');
        const id = form.dataset.id;
        const data = {
            nome: document.getElementById('ministerioNome').value,
            categoriaId: document.getElementById('ministerioCategoria').value
        };

        if(!data.nome || !data.categoriaId) {
            this.app.showToast('Todos os campos são obrigatórios.', 'error');
            return;
        }
        
        try {
            const response = id 
                ? await this.app.api.updateMinisterio(id, data) 
                : await this.app.api.createMinisterio(data, this.app.currentUser.username);

            if(response.success) {
                this.app.showToast(`Ministério salvo com sucesso!`, 'success');
                document.getElementById('ministerioModal').classList.remove('show');
                this.loadData();
            } else {
                this.app.showToast(response.error, 'error');
            }
        } catch(error) {
            console.error('Save ministerio error:', error);
            this.app.showToast('Erro ao salvar ministério', 'error');
        }
    }

    async deleteMinisterio(id) {
        const ministerio = this.ministerios.find(m => m.id == id);
        if(!ministerio) return;
        
        if (!confirm(`Tem a certeza que deseja excluir o ministério "${ministerio.nome}"?`)) {
            return;
        }

        try {
            const response = await this.app.api.deleteMinisterio(id);
            if(response.success) {
                this.app.showToast('Ministério excluído com sucesso!', 'success');
                this.loadData();
            } else {
                this.app.showToast(response.error, 'error');
            }
        } catch (error) {
            console.error('Delete ministerio error:', error);
            this.app.showToast('Erro ao excluir ministério', 'error');
        }
    }
}