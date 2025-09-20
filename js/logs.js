// js/logs.js

class LogsManager {
    constructor(app) {
        this.app = app;
        this.filters = {};
        this.listenersInitialized = false; // Adicionado
    }

    init() {
        // A configuração de eventos foi movida para loadData
    }

    setupEventListeners() {
        if (this.listenersInitialized) return;
        const filterBtn = document.getElementById('filterLogsBtn');
        const clearBtn = document.getElementById('clearLogsFilterBtn');

        if (filterBtn) filterBtn.addEventListener('click', () => this.applyFilters());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearFilters());
        this.listenersInitialized = true;
    }

    async setupFilters() {
        // Populate Year filter
        const anoFilter = document.getElementById('logAnoFilter');
        if (anoFilter) {
            const anoResponse = await this.app.api.getAnosDisponiveis();
            if (anoResponse.success) {
                anoFilter.innerHTML = '<option value="">Todos os Anos</option>';
                anoResponse.data.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    anoFilter.appendChild(option);
                });
            }
        }

        // Populate Month filter
        const mesFilter = document.getElementById('logMesFilter');
        if (mesFilter) {
            const months = getMonthsArray();
            mesFilter.innerHTML = '<option value="">Todos os Meses</option>';
            months.forEach((month, index) => {
                 const option = document.createElement('option');
                 option.value = index + 1;
                 option.textContent = month;
                 mesFilter.appendChild(option);
            });
        }

        // Populate User filter
        const userFilter = document.getElementById('logUserFilter');
        if (userFilter) {
            const userResponse = await this.app.api.getUsers();
            if (userResponse.success) {
                userFilter.innerHTML = '<option value="">Todos os Utilizadores</option>';
                userResponse.data.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.username;
                    option.textContent = user.username;
                    userFilter.appendChild(option);
                });
            }
        }
    }

    applyFilters() {
        this.filters = {
            ano: document.getElementById('logAnoFilter').value,
            mes: document.getElementById('logMesFilter').value,
            username: document.getElementById('logUserFilter').value,
            actionType: document.getElementById('logAcaoFilter').value
        };
        this.loadData();
    }

    clearFilters() {
        document.getElementById('logAnoFilter').value = '';
        document.getElementById('logMesFilter').value = '';
        document.getElementById('logUserFilter').value = '';
        document.getElementById('logAcaoFilter').value = '';
        this.filters = {};
        this.loadData();
    }
    
    async loadData() {
        this.setupEventListeners(); // Chamado aqui, quando a página está visível
        await this.setupFilters(); // Recarrega os filtros com dados recentes (ex: novos usuários)
        try {
            const response = await this.app.api.getLogs(this.filters);
            if (response.success) {
                this.updateTable(response.data);
            } else {
                this.app.showToast('Erro ao carregar logs', 'error');
            }
        } catch (error) {
            console.error("Load logs error:", error);
            this.app.showToast('Erro de sistema ao buscar logs', 'error');
        }
    }

    updateTable(logs) {
        const tbody = document.querySelector('#logsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum log encontrado para os filtros selecionados.</td></tr>`;
            return;
        }

        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                <td>${escapeHtml(log.username)}</td>
                <td>${this.translateAction(log.action)}</td>
                <td>${escapeHtml(log.details)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    translateAction(action) {
        const translations = {
            'LOGIN_SUCCESS': 'Login Bem-sucedido',
            'LOGIN_FAIL': 'Falha de Login',
            'ENTRADA_CRIADA': 'Criação de Entrada',
            'SAIDA_CRIADA': 'Criação de Saída',
            'USER_STATUS_CHANGED': 'Status de Utilizador Alterado',
        };
        return translations[action] || action;
    }
}