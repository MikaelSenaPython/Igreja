// js/entradas.js (CORRIGIDO)

class EntradasManager {
    constructor(app) {
        this.app = app;
        this.currentEntradas = [];
        this.filters = {};
    }

    init() {
        this.setupEventListeners();
        this.setupStaticFilters();
    }

    setupEventListeners() {
        document.getElementById('addEntradaBtn')?.addEventListener('click', () => this.openEntradaModal());
        document.getElementById('filterEntradasBtn')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('clearEntradasFilterBtn')?.addEventListener('click', () => this.clearFilters());
        this.setupModalEvents();
    }

    // Carrega filtros estáticos uma vez
    setupStaticFilters() {
        this.populateYearFilter();
        this.populateMonthFilter();
    }

    setupModalEvents() {
        const modal = document.getElementById('entradaModal');
        document.getElementById('closeEntradaModal')?.addEventListener('click', () => this.closeEntradaModal());
        document.getElementById('cancelEntradaModal')?.addEventListener('click', () => this.closeEntradaModal());
        document.getElementById('saveEntradaBtn')?.addEventListener('click', () => this.saveEntrada());
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeEntradaModal();
        });
    }

    populateYearFilter() {
        const yearFilter = document.getElementById('entradaAnoFilter');
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
        const monthFilter = document.getElementById('entradaMesFilter');
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
            const [tiposRes, projetosRes, ministeriosRes] = await Promise.all([
                this.app.api.getTiposEntrada(),
                this.app.api.getProjetos(),
                this.app.api.getMinisterios()
            ]);

            if (tiposRes.success) this.populateTypeFilter(tiposRes.data);
            if (projetosRes.success) this.populateProjectFilter(projetosRes.data);
            if (ministeriosRes.success) this.populateMinistryFilter(ministeriosRes.data);

        } catch (error) {
            console.error('Load filter options error:', error);
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

    populateTypeFilter(tipos) {
        const typeFilter = document.getElementById('entradaTipoFilter');
        if (!typeFilter) return;
        const currentValue = typeFilter.value;
        typeFilter.innerHTML = '<option value="">Todos os tipos</option>';
        tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.nome;
            option.textContent = tipo.nome;
            typeFilter.appendChild(option);
        });
        typeFilter.value = currentValue;
    }

    populateProjectFilter(projetos) { this.populateSelect('entradaProjetoFilter', projetos.filter(p=>p.ativo), 'Todos os projetos'); }
    
    populateMinistryFilter(ministerios) {
        const ministryFilter = document.getElementById('entradaMinisterioFilter');
        if (!ministryFilter) return;
        const currentValue = ministryFilter.value;
        ministryFilter.innerHTML = '<option value="">Todos os ministérios</option><option value="geral">Caixa Geral</option>';
        ministerios.forEach(ministerio => {
            const option = document.createElement('option');
            option.value = ministerio.id;
            option.textContent = ministerio.nome;
            ministryFilter.appendChild(option);
        });
        ministryFilter.value = currentValue;
    }
    
    async populateModalOptions(entradaData = null) {
        try {
            const [tiposRes, projetosRes, ministeriosRes, pessoasRes] = await Promise.all([
                this.app.api.getTiposEntrada(),
                this.app.api.getProjetos(),
                this.app.api.getMinisterios(),
                this.app.api.getPessoas()
            ]);

            if (tiposRes.success) this.populateSelect('entradaTipo', tiposRes.data, 'Selecione um tipo', 'nome', 'nome');
            if (projetosRes.success) this.populateSelect('entradaProjeto', projetosRes.data.filter(p => p.ativo), 'Nenhum projeto');
            if (ministeriosRes.success) this.populateSelect('entradaMinisterio', ministeriosRes.data, 'Caixa Geral');
            if (pessoasRes.success) this.populateSelect('entradaMembro', pessoasRes.data.filter(p => p.status === 'Ativo'), 'Doador Anônimo', 'id', 'nomeCompleto');
            
            if (entradaData) {
                document.getElementById('entradaTipo').value = entradaData.tipo;
                document.getElementById('entradaProjeto').value = entradaData.projetoId || '';
                document.getElementById('entradaMinisterio').value = entradaData.ministerioId || '';
                document.getElementById('entradaMembro').value = entradaData.membroId || '';
            }

        } catch (error) {
            console.error("Erro ao popular opções do modal:", error);
            this.app.showToast('Erro ao carregar dados para o formulário.', 'error');
        }
    }

    async loadData() {
        await this.refreshFilterOptions();
        try {
            const response = await this.app.api.getEntradas(this.filters);
            if (response.success) {
                this.currentEntradas = response.data;
                this.updateTable();
            } else {
                this.app.showToast('Erro ao carregar entradas', 'error');
            }
        } catch (error) {
            console.error('Load entradas error:', error);
            this.app.showToast('Erro ao carregar dados', 'error');
        }
    }

    applyFilters() {
        this.filters = {
            ano: document.getElementById('entradaAnoFilter').value,
            mes: document.getElementById('entradaMesFilter').value,
            tipo: document.getElementById('entradaTipoFilter').value,
            projetoId: document.getElementById('entradaProjetoFilter').value,
            ministerioId: document.getElementById('entradaMinisterioFilter').value
        };
        this.loadData();
        this.app.showToast('Filtros aplicados', 'info');
    }

    clearFilters() {
        document.getElementById('entradaAnoFilter').value = '';
        document.getElementById('entradaMesFilter').value = '';
        document.getElementById('entradaTipoFilter').value = '';
        document.getElementById('entradaProjetoFilter').value = '';
        document.getElementById('entradaMinisterioFilter').value = '';
        this.filters = {};
        this.loadData();
        this.app.showToast('Filtros limpos', 'info');
    }

    updateTable() {
        const tbody = document.querySelector('#entradasTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (this.currentEntradas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center">Nenhuma entrada encontrada</td></tr>`;
            return;
        }
        this.currentEntradas.forEach(entrada => {
            const row = document.createElement('tr');
            row.className = 'tr-success';
            row.innerHTML = `
                <td>${entrada.id}</td>
                <td>${formatDate(entrada.data)}</td>
                <td>${escapeHtml(entrada.nomeMembro)}</td>
                <td>${escapeHtml(entrada.tipo)}</td>
                <td>${entrada.nomeProjeto || '---'}</td>
                <td>${entrada.nomeMinisterio}</td>
                <td class="text-right">${formatCurrency(entrada.valor)}</td>
                <td>${entrada.registradoPor}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.entradas.editEntrada(${entrada.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="app.entradas.deleteEntrada(${entrada.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async openEntradaModal(entradaId = null) {
        const modal = document.getElementById('entradaModal');
        const form = document.getElementById('entradaForm');
        form.dataset.id = '';
        
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        if (entradaId) {
            document.getElementById('entradaModalTitle').textContent = 'Editar Entrada';
            const entrada = this.currentEntradas.find(e => e.id === entradaId);
            if (!entrada) return;
            form.dataset.id = entradaId;
            document.getElementById('entradaData').value = formatDateForInput(entrada.data);
            document.getElementById('entradaValor').value = entrada.valor;
            document.getElementById('entradaObservacoes').value = entrada.observacoes || '';
            await this.populateModalOptions(entrada);
        } else {
            document.getElementById('entradaModalTitle').textContent = 'Adicionar Nova Entrada';
            this.clearEntradaForm();
            await this.populateModalOptions();
        }

        form.querySelector('input')?.focus();
    }

    clearEntradaForm() {
        const form = document.getElementById('entradaForm');
        form.reset();
        document.getElementById('entradaData').value = getCurrentDate();
        clearFormValidation(form);
    }

    async saveEntrada() {
        const form = document.getElementById('entradaForm');
        const saveBtn = document.getElementById('saveEntradaBtn');
        if (!validateRequiredFields(form)) return;

        const id = form.dataset.id;
        const entradaData = {
            data: document.getElementById('entradaData').value,
            valor: parseFloat(document.getElementById('entradaValor').value),
            tipo: document.getElementById('entradaTipo').value,
            membroId: document.getElementById('entradaMembro').value ? parseInt(document.getElementById('entradaMembro').value) : null,
            projetoId: document.getElementById('entradaProjeto').value ? parseInt(document.getElementById('entradaProjeto').value) : null,
            ministerioId: document.getElementById('entradaMinisterio').value ? parseInt(document.getElementById('entradaMinisterio').value) : null,
            observacoes: document.getElementById('entradaObservacoes').value
        };

        try {
            setButtonLoading(saveBtn, true);
            const response = id
                ? await this.app.api.updateEntrada(id, entradaData, this.app.currentUser.username) // <-- CORRIGIDO
                : await this.app.api.createEntrada(entradaData, this.app.currentUser.username);

            if (response.success) {
                this.app.showToast('Entrada salva com sucesso!', 'success');
                this.closeEntradaModal();
                this.loadData();
            } else {
                this.app.showToast(response.error || 'Erro ao salvar entrada', 'error');
            }
        } catch (error) {
            console.error('Save entrada error:', error);
            this.app.showToast('Erro ao salvar dados', 'error');
        } finally {
            setButtonLoading(saveBtn, false);
        }
    }

    editEntrada(entradaId) {
        this.openEntradaModal(entradaId);
    }

    async deleteEntrada(entradaId) {
        const entrada = this.currentEntradas.find(e => e.id === entradaId);
        if (!entrada) return;
        if (!confirm(`Tem certeza que deseja excluir esta entrada de ${formatCurrency(entrada.valor)}?`)) return;

        try {
            const response = await this.app.api.deleteEntrada(entradaId, this.app.currentUser.username); // <-- CORRIGIDO
            if (response.success) {
                this.app.showToast('Entrada excluída com sucesso!', 'success');
                this.loadData();
            } else {
                this.app.showToast(response.error || 'Erro ao excluir', 'error');
            }
        } catch (error) {
            this.app.showToast('Erro ao excluir entrada', 'error');
        }
    }

    closeEntradaModal() {
        const modal = document.getElementById('entradaModal');
        modal.classList.remove('show');
        // CORREÇÃO: Adicionado para garantir que o modal seja escondido
        modal.style.display = 'none'; 
        this.clearEntradaForm();
    }
}