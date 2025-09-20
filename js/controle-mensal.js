// js/controle-mensal.js

class ControleMensalManager {
    constructor(app) {
        this.app = app;
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth() + 1;
        this.listenersInitialized = false;
    }

    init() {
        // Movido para loadData para garantir que os elementos existam
    }

    setupEventListeners() {
        if (this.listenersInitialized) return;

        const anoFilter = document.getElementById('cmAnoFilter');
        const mesFilter = document.getElementById('cmMesFilter');

        anoFilter.addEventListener('change', () => this.handleFilterChange());
        mesFilter.addEventListener('change', () => this.handleFilterChange());
        
        this.listenersInitialized = true;
    }

    async loadData() {
        this.populateFilters(); // Popula ou atualiza os filtros
        this.setupEventListeners(); // Garante que os eventos estão ligados
        await this.fetchAndRenderData();
    }
    
    populateFilters() {
        const anoFilter = document.getElementById('cmAnoFilter');
        const mesFilter = document.getElementById('cmMesFilter');
        
        // Ano
        anoFilter.innerHTML = getYearsArray().map(y => `<option value="${y}" ${y == this.currentYear ? 'selected' : ''}>${y}</option>`).join('');
        
        // Mês
        mesFilter.innerHTML = getMonthsArray().map((m, i) => `<option value="${i+1}" ${i+1 == this.currentMonth ? 'selected' : ''}>${m}</option>`).join('');
    }

    handleFilterChange() {
        this.currentYear = document.getElementById('cmAnoFilter').value;
        this.currentMonth = document.getElementById('cmMesFilter').value;
        this.fetchAndRenderData();
    }

    async fetchAndRenderData() {
        try {
            const response = await this.app.api.getControleMensal(this.currentYear, this.currentMonth);
            if (response.success) {
                this.renderCards(response.data);
            } else {
                this.app.showToast('Erro ao buscar dados do controle mensal.', 'error');
            }
        } catch (error) {
            console.error('Erro ao renderizar controle mensal:', error);
        }
    }

    renderCards(data) {
        const container = document.getElementById('memberCardsContainer');
        container.innerHTML = '';

        if(data.length === 0) {
            container.innerHTML = '<p>Nenhum membro ativo encontrado.</p>';
            return;
        }

        data.forEach(member => {
            const card = document.createElement('div');
            card.className = 'member-card';
            card.innerHTML = `
                <div class="member-card-header">${escapeHtml(member.nome)}</div>
                <div class="member-card-body">
                    <div class="card-info-item">
                        <span>Entregou o dízimo este mês?</span>
                        <span class="${member.dizimista ? 'dizimo-status-sim' : 'dizimo-status-nao'}">
                            ${member.dizimista ? 'Sim' : 'Não'}
                        </span>
                    </div>
                    <div class="card-info-item">
                        <span>Participou da Santa Ceia?</span>
                        <label class="switch">
                            <input type="checkbox" class="ceia-switch" data-member-id="${member.id}" ${member.tomouCeia ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Adiciona event listeners para os novos switches
        container.querySelectorAll('.ceia-switch').forEach(sw => {
            sw.addEventListener('change', (e) => {
                const memberId = e.target.dataset.memberId;
                const participou = e.target.checked;
                this.app.api.setParticipacaoCeia(parseInt(memberId), this.currentYear, this.currentMonth, participou);
            });
        });
    }
}