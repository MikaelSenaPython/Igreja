// Dashboard Manager
class DashboardManager {
    constructor(app) {
        this.app = app;
        // As instâncias dos gráficos de pizza foram movidas para a nova função
        // para garantir que sejam tratadas corretamente.
        this.charts = {}; 
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // ... (Seus event listeners existentes para filtros e abas)
        const filterButtons = document.querySelectorAll('.dashboard-filters [data-period]');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePeriodFilter(e.target.dataset.period));
        });

        const exportBtn = document.getElementById('exportDashboard');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToPDF());
        }

        const chartTabs = document.querySelectorAll('.chart-tabs .tab-btn');
        chartTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchChartTab(e.target.dataset.tab));
        });
    }

    setupChartTabs() {
        const tabButtons = document.querySelectorAll('.chart-tabs .tab-btn');
        const tabContents = document.querySelectorAll('.dashboard-charts .tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Update active button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => content.classList.remove('active'));
                const targetContent = document.getElementById(tabId + 'Tab');
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    async loadData() {
        try {
            const response = await this.app.api.getDashboardData(this.currentPeriod);
            
            if (response.success) {
                const data = response.data; // Declarar a variável data

                this.updateKPIs(data.kpis);
                this.updateTransactionsTable(data.transacoes);
                
                // CORREÇÃO 1: A chamada para criar o gráfico de resumo foi restaurada.
                this.createResumoChart(data.kpis);
                
                // Mantemos a chamada para os gráficos de composição.
                this.renderCompositionCharts(data);
            } else {
                this.app.showToast('Erro ao carregar dados do dashboard', 'error');
            }
        } catch (error) {
            console.error('Dashboard load error:', error);
            this.app.showToast('Erro ao carregar dashboard', 'error');
        }
    }

    updateKPIs(kpis) {
        document.getElementById('saldoAnterior').textContent = formatCurrency(kpis.saldoAnterior);
        document.getElementById('entradasPeriodo').textContent = formatCurrency(kpis.totalEntradas);
        document.getElementById('saidasPeriodo').textContent = formatCurrency(kpis.totalSaidas);
        document.getElementById('saldoPeriodo').textContent = formatCurrency(kpis.saldoMes);
        document.getElementById('saldoFinal').textContent = formatCurrency(kpis.saldoFinal);
    }

    updateCharts(data) {
        this.createResumoChart(data.kpis);
        this.createCompositionCharts(data.entradasPorTipo, data.saidasPorCategoria);
    }

    createResumoChart(kpis) {
        const ctx = document.getElementById('resumoChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.resumo) {
            this.charts.resumo.destroy();
        }

        this.charts.resumo = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Saldo Anterior', 'Entradas', 'Saídas', 'Saldo do Mês', 'Saldo Final'],
                datasets: [{
                    data: [kpis.saldoAnterior, kpis.totalEntradas, kpis.totalSaidas, kpis.saldoMes, kpis.saldoFinal],
                    backgroundColor: ['#9E9E9E', '#2A8C55', '#D9534F', '#3498db', '#2F4F4F'],
                    borderColor: ['#757575', '#1B5E39', '#C9302C', '#2980b9', '#1A2F2F'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => formatCurrency(context.raw)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    createCompositionCharts(entradasPorTipo, saidasPorCategoria) {
        // Entries pie chart
        this.createPieChart('entradasPieChart', entradasPorTipo, '#2A8C55');
        this.updateChartDetails('entradasDetails', entradasPorTipo);
        
        // Exits pie chart
        this.createPieChart('saidasPieChart', saidasPorCategoria, '#2A8C55');
        this.updateChartDetails('saidasDetails', saidasPorCategoria);
    }

    createPieChart(canvasId, data, baseColor) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const labels = Object.keys(data);
        const values = Object.values(data);
        
        if (values.length === 0) {
            // Show "no data" message
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.fillText('Sem dados no período', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        // Generate colors
        const colors = this.generateColors(values.length, baseColor);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateChartDetails(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const total = Object.values(data).reduce((sum, val) => sum + val, 0);
        
        if (total === 0) {
            container.innerHTML = '<p>Sem dados no período</p>';
            return;
        }

        const sortedEntries = Object.entries(data)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5); // Show top 5

        let html = '<h5>Principais Categorias</h5>';
        
        sortedEntries.forEach(([label, value]) => {
            const percentage = ((value / total) * 100).toFixed(1);
            html += `
                <div class="detail-item">
                    <span class="detail-label">${label}</span>
                    <span class="detail-value">
                        ${formatCurrency(value)}
                        <span class="detail-percentage">${percentage}%</span>
                    </span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    updateTransactionsTable(transacoes) {
        const tbody = document.querySelector('#extratoTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!transacoes || transacoes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">Nenhuma transação no período</td></tr>`;
            return;
        }

        transacoes.forEach(t => {
            const isEntrada = t.hasOwnProperty('tipo');
            const row = `
                <tr>
                    <td>${formatDate(t.data)}</td>
                    <td class="${isEntrada ? 'text-success' : 'text-danger'}">${isEntrada ? 'Entrada' : 'Saída'}</td>
                    <td>${isEntrada ? escapeHtml(t.tipo) : escapeHtml(t.categoria)}</td>
                    <td>${t.nomeProjeto || '---'}</td>
                    <td class="text-right">${formatCurrency(t.valor)}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    handlePeriodFilter(period) {
        this.currentPeriod = period;
        document.querySelectorAll('.dashboard-filters [data-period]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        this.loadData();
    }

    switchChartTab(tabId) {
        document.querySelectorAll('.dashboard-charts .tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.chart-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`${tabId}Tab`)?.classList.add('active');
        document.querySelector(`.chart-tabs .tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
    }

    generateColors(count, baseColor) {
        const background = [];
        const border = [];
        
        // Convert hex to HSL for color variations
        const hue = this.hexToHsl(baseColor)[0];
        
        for (let i = 0; i < count; i++) {
            const saturation = 60 + (i * 10) % 40;
            const lightness = 45 + (i * 15) % 30;
            
            background.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            border.push(`hsl(${hue}, ${saturation}%, ${lightness - 10}%)`);
        }
        
        return { background, border };
    }

    hexToHsl(hex) {
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return [h * 360, s * 100, l * 100];
    }

    exportToPDF() {
        this.app.showToast('Funcionalidade de exportação em desenvolvimento', 'info');
    }

    // Clean up charts when page changes
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    // Cole este bloco de código dentro da sua classe DashboardManager

    /**
     * Renderiza os gráficos de pizza e as tabelas de detalhamento na aba "Composição".
     * @param {object} data - O objeto de dados vindo da API (response.data).
     */
    renderCompositionCharts(data) {
        const chartColors = [
            '#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#0288d1', 
            '#5e35b1', '#6d4c41', '#e91e63', '#00796b', '#c2185b'
        ];

        const entradasData = data.entradasPorTipo || {};
        const totalEntradas = Object.values(entradasData).reduce((sum, val) => sum + val, 0);
        this.updateCompositionTable('entradasDetailsTable', entradasData, totalEntradas);
        
        if (this.charts.entradasPie) {
            this.charts.entradasPie.destroy();
        }
        
        const entradasCtx = document.getElementById('entradasPieChart')?.getContext('2d');
        if (entradasCtx) {
            this.charts.entradasPie = new Chart(entradasCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(entradasData),
                    datasets: [{
                        data: Object.values(entradasData),
                        backgroundColor: chartColors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        const saidasData = data.saidasPorCategoria || {};
        const totalSaidas = Object.values(saidasData).reduce((sum, val) => sum + val, 0);
        this.updateCompositionTable('saidasDetailsTable', saidasData, totalSaidas);

        if (this.charts.saidasPie) {
            this.charts.saidasPie.destroy();
        }
        
        const saidasCtx = document.getElementById('saidasPieChart')?.getContext('2d');
        if (saidasCtx) {
            this.charts.saidasPie = new Chart(saidasCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(saidasData),
                    datasets: [{
                        data: Object.values(saidasData),
                        backgroundColor: chartColors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    }

    /**
     * Preenche uma tabela de detalhamento de composição financeira.
     * @param {string} tableId - O ID da tabela (sem o #).
     * @param {object} dataObject - O objeto de dados (ex: {Dízimo: 500, Oferta: 200}).
     * @param {number} total - O valor total para cálculo da porcentagem.
     */
    updateCompositionTable(tableId, dataObject, total) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        if (!tbody) return;

        tbody.innerHTML = '';
        const sortedData = Object.entries(dataObject).sort(([, a], [, b]) => b - a);

        for (const [label, value] of sortedData) {
            const percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
            // CORREÇÃO 2: Adicionadas as classes "text-right" para alinhar os valores
            const row = `
                <tr>
                    <td>${escapeHtml(label)}</td>
                    <td class="text-right">${formatCurrency(value)}</td>
                    <td class="text-right">${percentage}%</td>
                </tr>
            `;
            tbody.innerHTML += row;
        }
    }
}