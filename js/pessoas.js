// Pessoas Manager
class PessoasManager {
    constructor(app) {
        this.app = app;
        this.currentPessoas = [];
        this.selectedPersonId = null;
    }

    init() {
        this.setupEventListeners();
        this.setupSearchFilter();
    }

    setupEventListeners() {
        // Add person button
        const addBtn = document.getElementById('addPersonBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openPersonModal());
        }

        // Edit person button
        const editBtn = document.getElementById('editPersonBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.openPersonModal(this.selectedPersonId));
        }

        // Delete person button
        const deleteBtn = document.getElementById('deletePersonBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deletePerson());
        }

        // Person modal events
        this.setupPersonModalEvents();

        // Table row click events
        this.setupTableEvents();

        // Tab switching
        this.setupTabSwitching();
    }

    setupSearchFilter() {
        const searchInput = document.getElementById('personSearch');
        if (searchInput) {
            const debouncedSearch = debounce((searchTerm) => {
                this.filterPessoas(searchTerm);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    setupPersonModalEvents() {
        // Modal close events
        const closeBtn = document.getElementById('closePersonModal');
        const cancelBtn = document.getElementById('cancelPersonModal');
        const saveBtn = document.getElementById('savePersonBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePersonModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closePersonModal());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePerson());
        }

        // Tab switching in modal
        const tabBtns = document.querySelectorAll('#personModal .tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchModalTab(tabId);
            });
        });

        // Close modal when clicking outside
        const modal = document.getElementById('personModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePersonModal();
                }
            });
        }
    }

    setupTableEvents() {
        // This will be called after table is populated
    }

    setupTabSwitching() {
        const personTabs = document.querySelectorAll('.person-tabs .tab-btn');
        const personTabContents = document.querySelectorAll('[id$="Tab"]');

        personTabs.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Update active button
                personTabs.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active content
                personTabContents.forEach(content => content.classList.remove('active'));
                const targetContent = document.getElementById(`person${tabId.charAt(0).toUpperCase() + tabId.slice(1)}Tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    async loadData() {
        try {
            const response = await this.app.api.getPessoas();
            
            if (response.success) {
                this.currentPessoas = response.data;
                this.updateTable();
                this.clearPersonDetails();
            } else {
                this.app.showToast('Erro ao carregar pessoas', 'error');
            }
        } catch (error) {
            console.error('Load pessoas error:', error);
            this.app.showToast('Erro ao carregar dados', 'error');
        }
    }

    async filterPessoas(searchTerm) {
        try {
            const response = await this.app.api.getPessoas(searchTerm);
            
            if (response.success) {
                this.currentPessoas = response.data;
                this.updateTable();
                this.clearPersonDetails();
            }
        } catch (error) {
            console.error('Filter pessoas error:', error);
        }
    }

    updateTable() {
        const tbody = document.querySelector('#pessoasTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.currentPessoas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">Nenhuma pessoa encontrada</td>
                </tr>
            `;
            return;
        }

        this.currentPessoas.forEach(pessoa => {
            const row = document.createElement('tr');
            row.dataset.personId = pessoa.id;
            row.innerHTML = `
                <td>${pessoa.id}</td>
                <td>${escapeHtml(pessoa.nomeCompleto)}</td>
                <td>
                    <span class="status-badge ${pessoa.status.toLowerCase()}">
                        ${pessoa.status}
                    </span>
                </td>
            `;
            
            row.addEventListener('click', () => this.selectPerson(pessoa.id));
            tbody.appendChild(row);
        });
    }

    selectPerson(personId) {
        // Update selected state in table
        document.querySelectorAll('#pessoasTable tbody tr').forEach(row => {
            row.classList.remove('selected');
        });

        const selectedRow = document.querySelector(`#pessoasTable tbody tr[data-person-id="${personId}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }

        this.selectedPersonId = personId;
        this.loadPersonDetails(personId);
    }

    async loadPersonDetails(personId) {
        try {
            const response = await this.app.api.getPessoa(personId);
            
            if (response.success) {
                this.displayPersonDetails(response.data);
            } else {
                this.app.showToast('Erro ao carregar detalhes da pessoa', 'error');
            }
        } catch (error) {
            console.error('Load person details error:', error);
            this.app.showToast('Erro ao carregar detalhes', 'error');
        }
    }

    displayPersonDetails(pessoa) {
        // Update header info
        document.querySelector('#personDetailsPanel h3').textContent = pessoa.nomeCompleto;
        document.querySelector('#personDetailsPanel > p').textContent = 
            `Telefone: ${pessoa.telefone || 'N/A'} | Endereço: ${pessoa.endereco || 'N/A'}`;

        // Update personal info
        document.getElementById('personStatus').textContent = pessoa.status || '--';
        document.getElementById('personFunction').textContent = pessoa.funcaoEclesiastica || '--';
        document.getElementById('personBirthDate').textContent = formatDate(pessoa.dataNascimento);
        document.getElementById('personMaritalStatus').textContent = pessoa.estadoCivil || '--';
        document.getElementById('personBaptismDate').textContent = formatDate(pessoa.dataBatismo);
        document.getElementById('personMemberSince').textContent = formatDate(pessoa.dataCadastro);

        // Update groups info (simplified for now)
        document.getElementById('personMinistries').textContent = 'Nenhum';
        document.getElementById('personTags').textContent = 'Nenhuma';

        // Enable action buttons
        document.getElementById('editPersonBtn').disabled = false;
        document.getElementById('deletePersonBtn').disabled = false;
    }

    clearPersonDetails() {
        this.selectedPersonId = null;
        
        // Clear header
        document.querySelector('#personDetailsPanel h3').textContent = 'Selecione uma pessoa';
        document.querySelector('#personDetailsPanel > p').textContent = 'Informações de contato aparecerão aqui';

        // Clear personal info
        document.getElementById('personStatus').textContent = '--';
        document.getElementById('personFunction').textContent = '--';
        document.getElementById('personBirthDate').textContent = '--';
        document.getElementById('personMaritalStatus').textContent = '--';
        document.getElementById('personBaptismDate').textContent = '--';
        document.getElementById('personMemberSince').textContent = '--';

        // Clear groups info
        document.getElementById('personMinistries').textContent = 'Nenhum';
        document.getElementById('personTags').textContent = 'Nenhuma';

        // Disable action buttons
        document.getElementById('editPersonBtn').disabled = true;
        document.getElementById('deletePersonBtn').disabled = true;

        // Remove selection from table
        document.querySelectorAll('#pessoasTable tbody tr').forEach(row => {
            row.classList.remove('selected');
        });
    }

    async openPersonModal(personId = null) {
        const modal = document.getElementById('personModal');
        const form = document.getElementById('personForm');
        
        if (personId) {
            // Edit mode
            document.getElementById('personModalTitle').textContent = 'Editar Ficha de Pessoa';
            await this.loadPersonForEdit(personId);
        } else {
            // Add mode
            document.getElementById('personModalTitle').textContent = 'Adicionar Nova Pessoa';
            this.clearPersonForm();
        }

        // Load ministries and tags for associations tab
        await this.loadAssociationsData();

        // Show modal
        modal.classList.add('show');
        modal.style.display = 'flex';

        // Focus on first input
        const firstInput = form.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    async loadPersonForEdit(personId) {
        try {
            const response = await this.app.api.getPessoa(personId);
            
            if (response.success) {
                const pessoa = response.data;
                this.populatePersonForm(pessoa);
            } else {
                this.app.showToast('Erro ao carregar dados da pessoa', 'error');
            }
        } catch (error) {
            console.error('Load person for edit error:', error);
            this.app.showToast('Erro ao carregar dados', 'error');
        }
    }

    populatePersonForm(pessoa) {
        document.getElementById('nomeCompleto').value = pessoa.nomeCompleto || '';
        document.getElementById('telefone').value = pessoa.telefone || '';
        document.getElementById('endereco').value = pessoa.endereco || '';
        document.getElementById('dataNascimento').value = formatDateForInput(pessoa.dataNascimento);
        document.getElementById('estadoCivil').value = pessoa.estadoCivil || '';
        document.getElementById('dataBatismo').value = formatDateForInput(pessoa.dataBatismo);
        document.getElementById('dataCadastro').value = formatDateForInput(pessoa.dataCadastro);
        document.getElementById('status').value = pessoa.status || 'Ativo';
        document.getElementById('funcaoEclesiastica').value = pessoa.funcaoEclesiastica || 'Membro';
    }

    clearPersonForm() {
        const form = document.getElementById('personForm');
        form.reset();
        
        // Set default values
        document.getElementById('status').value = 'Ativo';
        document.getElementById('funcaoEclesiastica').value = 'Membro';
        document.getElementById('dataCadastro').value = getCurrentDate();
        
        // Clear validation states
        clearFormValidation(form);
    }

    async loadAssociationsData() {
        try {
            // Load ministries
            const ministeriosResponse = await this.app.api.getMinisterios();
            if (ministeriosResponse.success) {
                this.populateMinisteriosList(ministeriosResponse.data);
            }

            // Load tags
            const etiquetasResponse = await this.app.api.getEtiquetas();
            if (etiquetasResponse.success) {
                this.populateEtiquetasList(etiquetasResponse.data);
            }
        } catch (error) {
            console.error('Load associations error:', error);
        }
    }

    populateMinisteriosList(ministerios) {
        const container = document.getElementById('ministeriosList');
        if (!container) return;

        container.innerHTML = '';

        ministerios.forEach(ministerio => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item ministry-item';
            checkboxItem.innerHTML = `
                <div class="ministry-main">
                    <input type="checkbox" id="ministerio_${ministerio.id}" name="ministerios" value="${ministerio.id}">
                    <label for="ministerio_${ministerio.id}">${escapeHtml(ministerio.nome)}</label>
                </div>
                <div class="ministry-leader">
                    <input type="checkbox" id="leader_${ministerio.id}" name="leaders" value="${ministerio.id}" disabled>
                    <label for="leader_${ministerio.id}">Líder</label>
                </div>
            `;
            
            // Setup leader checkbox logic
            const mainCheckbox = checkboxItem.querySelector(`#ministerio_${ministerio.id}`);
            const leaderCheckbox = checkboxItem.querySelector(`#leader_${ministerio.id}`);
            
            mainCheckbox.addEventListener('change', () => {
                if (mainCheckbox.checked) {
                    leaderCheckbox.disabled = false;
                } else {
                    leaderCheckbox.disabled = true;
                    leaderCheckbox.checked = false;
                }
            });
            
            container.appendChild(checkboxItem);
        });
    }

    populateEtiquetasList(etiquetas) {
        const container = document.getElementById('etiquetasList');
        if (!container) return;

        container.innerHTML = '';

        etiquetas.forEach(etiqueta => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            checkboxItem.innerHTML = `
                <input type="checkbox" id="etiqueta_${etiqueta.id}" name="etiquetas" value="${etiqueta.id}">
                <label for="etiqueta_${etiqueta.id}">${escapeHtml(etiqueta.nome)}</label>
            `;
            
            container.appendChild(checkboxItem);
        });
    }

    switchModalTab(tabId) {
        // Update active button
        document.querySelectorAll('#personModal .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`#personModal [data-tab="${tabId}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('#personModal .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${tabId}Tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    async savePerson() {
        const form = document.getElementById('personForm');
        const saveBtn = document.getElementById('savePersonBtn');

        // Validate form
        if (!validateRequiredFields(form)) {
            return;
        }

        const formData = new FormData(form);
        const pessoaData = {
            nomeCompleto: formData.get('nomeCompleto'),
            telefone: formData.get('telefone'),
            endereco: formData.get('endereco'),
            dataNascimento: formData.get('dataNascimento'),
            estadoCivil: formData.get('estadoCivil'),
            dataBatismo: formData.get('dataBatismo'),
            dataCadastro: formData.get('dataCadastro'),
            status: formData.get('status'),
            funcaoEclesiastica: formData.get('funcaoEclesiastica')
        };

        try {
            setButtonLoading(saveBtn, true);

            let response;
            if (this.selectedPersonId) {
                response = await this.app.api.updatePessoa(this.selectedPersonId, pessoaData);
            } else {
                response = await this.app.api.createPessoa(pessoaData);
            }

            if (response.success) {
                this.app.showToast(
                    this.selectedPersonId ? 'Pessoa atualizada com sucesso!' : 'Pessoa adicionada com sucesso!',
                    'success'
                );
                
                this.closePersonModal();
                this.loadData();
            } else {
                this.app.showToast(response.error || 'Erro ao salvar pessoa', 'error');
            }

        } catch (error) {
            console.error('Save person error:', error);
            this.app.showToast('Erro ao salvar dados', 'error');
        } finally {
            setButtonLoading(saveBtn, false);
        }
    }

    async deletePerson() {
        if (!this.selectedPersonId) return;

        const pessoa = this.currentPessoas.find(p => p.id === this.selectedPersonId);
        const personName = pessoa ? pessoa.nomeCompleto : 'esta pessoa';

        if (!confirm(`Tem certeza que deseja excluir ${personName}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const response = await this.app.api.deletePessoa(this.selectedPersonId);

            if (response.success) {
                this.app.showToast('Pessoa excluída com sucesso!', 'success');
                this.loadData();
            } else {
                this.app.showToast(response.error || 'Erro ao excluir pessoa', 'error');
            }

        } catch (error) {
            console.error('Delete person error:', error);
            this.app.showToast('Erro ao excluir pessoa', 'error');
        }
    }

    closePersonModal() {
        const modal = document.getElementById('personModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        // Clear form
        this.clearPersonForm();
        
        // Reset to first tab
        this.switchModalTab('dados');
    }
}