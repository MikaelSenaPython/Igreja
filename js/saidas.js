// js/saidas.js (CORRIGIDO)

class SaidasManager {
    constructor(app) {
        this.app = app;
        this.currentSaidas = [];
        this.filters = {};
    }

    init() {
        this.setupEventListeners();
        this.setupStaticFilters();
    }

    setupEventListeners() {
        document.getElementById('addSaidaBtn')?.addEventListener('click', () => this.openSaidaModal());
        document.getElementById('filterSaidasBtn')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('clearSaidasFilterBtn')?.addEventListener('click', () => this.clearFilters());
        this.setupModalEvents();
    }
    
    setupStaticFilters() {
        this.populateYearFilter();
        this.populateMonthFilter();
    }
    
    setupModalEvents() {
        const modal = document.getElementById('saidaModal');
        document.getElementById('closeSaidaModal')?.addEventListener('click', () => this.closeSaidaModal());
        document.getElementById('cancelSaidaModal')?.addEventListener('click', () => this.closeSaidaModal());
        document.getElementById('saveSaidaBtn')?.addEventListener('click', () => this.saveSaida());
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeSaidaModal();
        });
    }

    populateYearFilter() {
        const yearFilter = document.getElementById('saidaAnoFilter');
        if (!yearFilter) return;
        const years = getYearsArray();
        yearFilter.innerHTML = '<option value="">Todos os anos</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    populateMonthFilter() {
        const monthFilter = document.getElementById('saidaMesFilter');
        if (!monthFilter) return;
        const months = getMonthsArray();
        monthFilter.innerHTML = '<option value="">Todos os meses</option>';
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = month;
            monthFilter.appendChild(option);
        });
    }

    async refreshFilterOptions() {
        try {
            const [categoriasRes, projetosRes, ministeriosRes] = await Promise.all([
                this.app.api.getCategoriasSaida(),
                this.app.api.getProjetos(),
                this.app.api.getMinisterios()
            ]);

            if (categoriasRes.success) this.populateCategoryFilter(categoriasRes.data);
            if (projetosRes.success) this.populateSelect('saidaProjetoFilter', projetosRes.data.filter(p => p.ativo), 'Todos os projetos');
            if (ministeriosRes.success) {
                const ministryFilter = document.getElementById('saidaMinisterioFilter');
                if (!ministryFilter) return;
                const currentValue = ministryFilter.value;
                ministryFilter.innerHTML = '<option value="">Todos os ministérios</option><option value="geral">Caixa Geral</option>';
                ministeriosRes.data.forEach(ministerio => {
                    const option = document.createElement('option');
                    option.value = ministerio.id;
                    option.textContent = ministerio.nome;
                    ministryFilter.appendChild(option);
                });
                ministryFilter.value = currentValue;
            }
        } catch (error) {
            console.error('Load filter options error:', error);
        }
    }

    populateCategoryFilter(categorias) {
        const categoryFilter = document.getElementById('saidaCategoriaFilter');
        if(!categoryFilter) return;
        const currentValue = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="">Todas as categorias</option>';
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nome;
            option.textContent = cat.nome;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = currentValue;
    }

    async populateModalOptions(saidaData = null) {
        try {
            const [categoriasRes, projetosRes, ministeriosRes] = await Promise.all([
                this.app.api.getCategoriasSaida(),
                this.app.api.getProjetos(),
                this.app.api.getMinisterios()
            ]);

            if (categoriasRes.success) this.populateSelect('saidaCategoria', categoriasRes.data, 'Selecione uma categoria', 'nome', 'nome');
            if (projetosRes.success) this.populateSelect('saidaProjeto', projetosRes.data.filter(p => p.ativo), 'Nenhum projeto');
            if (ministeriosRes.success) this.populateSelect('saidaMinisterio', ministeriosRes.data, 'Caixa Geral');

            if (saidaData) {
                document.getElementById('saidaCategoria').value = saidaData.categoria;
                document.getElementById('saidaProjeto').value = saidaData.projetoId || '';
                document.getElementById('saidaMinisterio').value = saidaData.ministerioId || '';
            }
        } catch (error) {
             console.error("Erro ao popular opções do modal de saída:", error);
            this.app.showToast('Erro ao carregar dados para o formulário.', 'error');
        }
    }

    populateSelect(selectId, options, defaultLabel, valueKey = 'id', textKey = 'nome') {
        const select = document.getElementById(selectId);
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = `<option value="">${defaultLabel}</option>`;
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option[valueKey];
            opt.textContent = option[textKey];
            select.appendChild(opt);
        });
        select.value = currentValue;
    }

    async loadData() {
        await this.refreshFilterOptions();
        try {
            const response = await this.app.api.getSaidas(this.filters);
            if (response.success) {
                this.currentSaidas = response.data;
                this.updateTable();
            } else {
                this.app.showToast('Erro ao carregar saídas', 'error');
            }
        } catch (error) {
            console.error('Load saídas error:', error);
        }
    }

    applyFilters() {
        this.filters = {
            ano: document.getElementById('saidaAnoFilter').value,
            mes: document.getElementById('saidaMesFilter').value,
            categoria: document.getElementById('saidaCategoriaFilter').value,
            projetoId: document.getElementById('saidaProjetoFilter').value,
            ministerioId: document.getElementById('saidaMinisterioFilter').value
        };
        this.loadData();
    }

    clearFilters() {
        document.getElementById('saidaAnoFilter').value = '';
        document.getElementById('saidaMesFilter').value = '';
        document.getElementById('saidaCategoriaFilter').value = '';
        document.getElementById('saidaProjetoFilter').value = '';
        document.getElementById('saidaMinisterioFilter').value = '';
        this.filters = {};
        this.loadData();
    }

    updateTable() {
        const tbody = document.querySelector('#saidasTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (this.currentSaidas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center">Nenhuma saída encontrada</td></tr>`;
            return;
        }
        this.currentSaidas.forEach(saida => {
            const row = document.createElement('tr');
            row.className = 'tr-danger';
            row.innerHTML = `
                <td>${saida.id}</td>
                <td>${formatDate(saida.data)}</td>
                <td class="text-danger">${escapeHtml(saida.descricao)}</td>
                <td>${escapeHtml(saida.categoria)}</td>
                <td>${saida.nomeProjeto || '---'}</td>
                <td>${saida.nomeMinisterio}</td>
                <td class="text-right">${formatCurrency(saida.valor)}</td>
                <td>${saida.registradoPor}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.saidas.editSaida(${saida.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="app.saidas.deleteSaida(${saida.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async openSaidaModal(saidaId = null) {
        const modal = document.getElementById('saidaModal');
        const form = document.getElementById('saidaForm');
        form.dataset.id = '';
        
        modal.classList.add('show');
        modal.style.display = 'flex';

        if (saidaId) {
            document.getElementById('saidaModalTitle').textContent = 'Editar Saída';
            const saida = this.currentSaidas.find(s => s.id === saidaId);
            if (!saida) return;
            form.dataset.id = saidaId;
            document.getElementById('saidaData').value = formatDateForInput(saida.data);
            document.getElementById('saidaValor').value = saida.valor;
            document.getElementById('saidaDescricao').value = saida.descricao;
            document.getElementById('saidaObservacoes').value = saida.observacoes || '';
            await this.populateModalOptions(saida);
        } else {
            document.getElementById('saidaModalTitle').textContent = 'Adicionar Nova Saída';
            this.clearSaidaForm();
            await this.populateModalOptions();
        }
        form.querySelector('input')?.focus();
    }

    clearSaidaForm() {
        const form = document.getElementById('saidaForm');
        form.reset();
        document.getElementById('saidaData').value = getCurrentDate();
        clearFormValidation(form);
    }
    
    async saveSaida() {
        const form = document.getElementById('saidaForm');
        const saveBtn = document.getElementById('saveSaidaBtn');
        if (!validateRequiredFields(form)) return;

        const id = form.dataset.id;
        const saidaData = {
            data: document.getElementById('saidaData').value,
            valor: parseFloat(document.getElementById('saidaValor').value),
            descricao: document.getElementById('saidaDescricao').value,
            categoria: document.getElementById('saidaCategoria').value,
            projetoId: document.getElementById('saidaProjeto').value ? parseInt(document.getElementById('saidaProjeto').value) : null,
            ministerioId: document.getElementById('saidaMinisterio').value ? parseInt(document.getElementById('saidaMinisterio').value) : null,
            observacoes: document.getElementById('saidaObservacoes').value
        };

        try {
            setButtonLoading(saveBtn, true);
            const response = id
                ? await this.app.api.updateSaida(id, saidaData)
                : await this.app.api.createSaida(saidaData, this.app.currentUser.username);

            if (response.success) {
                this.app.showToast('Saída salva com sucesso!', 'success');
                this.closeSaidaModal();
                this.loadData();
            } else {
                this.app.showToast(response.error || 'Erro ao salvar saída', 'error');
            }
        } catch (error) {
            console.error("Save saida error:", error);
            this.app.showToast('Erro ao salvar dados', 'error');
        } finally {
            setButtonLoading(saveBtn, false);
        }
    }

    editSaida(saidaId) {
        this.openSaidaModal(saidaId);
    }

    async deleteSaida(saidaId) {
        const saida = this.currentSaidas.find(s => s.id === saidaId);
        if (!saida) return;
        if (!confirm(`Tem certeza que deseja excluir a saída "${saida.descricao}" de ${formatCurrency(saida.valor)}?`)) return;
        
        try {
            const response = await this.app.api.deleteSaida(saidaId);
            if (response.success) {
                this.app.showToast('Saída excluída com sucesso!', 'success');
                this.loadData();
            } else {
                this.app.showToast(response.error || 'Erro ao excluir', 'error');
            }
        } catch (error) {
            this.app.showToast('Erro ao excluir saída', 'error');
        }
    }

    closeSaidaModal() {
        const modal = document.getElementById('saidaModal');
        modal.classList.remove('show');
        // CORREÇÃO: Adicionado para garantir que o modal seja escondido
        modal.style.display = 'none';
        this.clearSaidaForm();
    }
}