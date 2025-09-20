// Dashboard Manager
class DashboardManager {
    constructor(app) {
        this.app = app;
        this.charts = {};
        this.currentPeriod = 'current';
    }

    init() {
        this.setupEventListeners();
        this.setupChartTabs();
    }

    setupEventListeners() {
        // Period filter buttons
        const filterButtons = document.querySelectorAll('.dashboard-filters [data-period]');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handlePeriodFilter(e.target.dataset.period);
            });
        });

        // Export PDF button
        const exportBtn = document.getElementById('exportDashboard');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToPDF());
        }

        // Chart tabs
        const chartTabs = document.querySelectorAll('.chart-tabs .tab-btn');
        chartTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchChartTab(e.target.dataset.tab);
            });
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
                this.updateKPIs(response.data.kpis);
                this.updateCharts(response.data);
                this.updateTransactionsTable(response.data.transacoes);
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
        const ctx = document.getElementById('resumoChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.resumo) {
            this.charts.resumo.destroy();
        }

        this.charts.resumo = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Saldo Anterior', 'Entradas', 'Saídas', 'Saldo do Mês', 'Saldo Final'],
                datasets: [{
                    data: [
                        kpis.saldoAnterior,
                        kpis.totalEntradas,
                        kpis.totalSaidas,
                        kpis.saldoMes,
                        kpis.saldoFinal
                    ],
                    backgroundColor: [
                        '#9E9E9E',
                        '#2A8C55',
                        '#D9534F',
                        '#3498db',
                        '#2F4F4F'
                    ],
                    borderColor: [
                        '#757575',
                        '#1B5E39',
                        '#C9302C',
                        '#2980b9',
                        '#1A2F2F'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
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

        if (transacoes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Nenhuma transação no período</td>
                </tr>
            `;
            return;
        }

        transacoes.slice(0, 50).forEach(transacao => { // Limit to 50 recent transactions
            const row = document.createElement('tr');
            row.className = transacao.tipo === 'Entrada' ? 'entrada' : 'saida';
            
            const projeto = transacao.nomeProjeto || '---';
            const categoria = transacao.tipo === 'Entrada' ? transacao.tipo : transacao.categoria;
            
            row.innerHTML = `
                <td>${formatDate(transacao.data)}</td>
                <td>
                    <span class="transaction-${transacao.tipo.toLowerCase()}">
                        ${transacao.tipo}
                    </span>
                </td>
                <td>${categoria}</td>
                <td>${projeto}</td>
                <td class="transaction-value ${transacao.tipo === 'Entrada' ? 'positive' : 'negative'}">
                    ${formatCurrency(transacao.valor)}
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    handlePeriodFilter(period) {
        this.currentPeriod = period;
        
        // Update active button
        document.querySelectorAll('.dashboard-filters [data-period]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        // Reload data
        this.loadData();
        
        // Show toast with selected period
        const periodNames = {
            'annual': 'Anual (2024)',
            '6months': 'Últimos 6 Meses',
            '3months': 'Últimos 3 Meses',
            'manual': 'Período Manual',
            'monthly': 'Análise Mensal',
            'compare': 'Comparar Meses'
        };
        
        if (periodNames[period]) {
            this.app.showToast(`Período alterado para: ${periodNames[period]}`, 'info');
        }
    }

    switchChartTab(tabId) {
        // This is handled by setupChartTabs, but we can add additional logic here
        console.log('Switched to tab:', tabId);
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
}