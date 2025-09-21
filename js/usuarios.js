// js/usuarios.js

class UsuariosManager {
    constructor(app) {
        this.app = app;
        this.currentUsers = [];
        this.selectedUserId = null;
        this.listenersInitialized = false; // Adicionado
    }

    init() {
        // A configuração de eventos foi movida para loadData
    }

    setupEventListeners() {
        if (this.listenersInitialized) return; // Garante que os eventos sejam adicionados apenas uma vez

        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.app.showRegisterScreen();
            });
        }
        
        const toggleUserStatusBtn = document.getElementById('toggleUserStatusBtn');
        if(toggleUserStatusBtn) {
            toggleUserStatusBtn.addEventListener('click', () => this.toggleUserStatus());
        }
        this.listenersInitialized = true;
    }

    async loadData() {
        this.setupEventListeners(); // Chamado aqui, quando a página está visível
        try {
            const response = await this.app.api.getUsers();
            if (response.success) {
                this.currentUsers = response.data;
                this.updateTable();
                this.clearUserDetails();
            } else {
                this.app.showToast('Erro ao carregar utilizadores', 'error');
            }
        } catch (error) {
            console.error('Load users error:', error);
            this.app.showToast('Erro ao carregar dados dos utilizadores', 'error');
        }
    }

    updateTable() {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.currentUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum utilizador encontrado</td></tr>`;
            return;
        }

        this.currentUsers.forEach(user => {
            const row = document.createElement('tr');
            row.dataset.userId = user.id;

            // Lógica para criar o HTML do status com cor
            const statusHtml = user.active
                ? `<span class="status-active">Ativo</span>`
                : `<span class="status-inactive">Inativo</span>`;

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${escapeHtml(user.username)}</td>
                <td>${escapeHtml(user.role)}</td>
                <td>${statusHtml}</td>
            `;

            row.addEventListener('click', () => this.selectUser(user.id));
            tbody.appendChild(row);
        });
    }

    selectUser(userId) {
        document.querySelectorAll('#usersTable tbody tr').forEach(row => {
            row.classList.remove('selected');
        });

        const selectedRow = document.querySelector(`#usersTable tbody tr[data-user-id="${userId}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }

        this.selectedUserId = userId;
        this.loadUserDetails(userId);
    }

    async loadUserDetails(userId) {
        try {
            const response = await this.app.api.getUser(userId);
            if (response.success) {
                this.displayUserDetails(response.data);
            } else {
                this.app.showToast(response.error, 'error');
            }
        } catch (error) {
            console.error('Load user details error:', error);
            this.app.showToast('Erro ao carregar detalhes do utilizador', 'error');
        }
    }

    displayUserDetails(user) {
        document.querySelector('#userDetailsPanel h3').textContent = user.username;
        document.querySelector('#userDetailsPanel > p').textContent = `ID: ${user.id} | Função: ${user.role}`;

        document.getElementById('userEmail').textContent = user.email || '--';
        document.getElementById('userCreatedAt').textContent = user.createdAt ? formatDate(user.createdAt) : '--';
        document.getElementById('userLastLogin').textContent = user.lastLogin ? formatDate(user.lastLogin) : 'Nunca';

        const toggleBtn = document.getElementById('toggleUserStatusBtn');
        toggleBtn.textContent = user.active ? 'Desativar Utilizador' : 'Ativar Utilizador';
        
        toggleBtn.disabled = user.id === this.app.currentUser.id;

        document.getElementById('userInfoList').style.display = '';
        document.getElementById('userActions').style.display = '';
    }

    clearUserDetails() {
        this.selectedUserId = null;
        document.querySelector('#userDetailsPanel h3').textContent = 'Selecione um utilizador';
        document.querySelector('#userDetailsPanel > p').textContent = 'Detalhes do utilizador aparecerão aqui.';
        document.getElementById('userInfoList').style.display = 'none';
        document.getElementById('userActions').style.display = 'none';
        
        document.querySelectorAll('#usersTable tbody tr').forEach(row => {
            row.classList.remove('selected');
        });
    }

    async toggleUserStatus() {
        if (!this.selectedUserId) return;
        
        const user = this.currentUsers.find(u => u.id === this.selectedUserId);
        if(!user) return;

        const action = user.active ? 'desativar' : 'ativar';
        if (!confirm(`Tem a certeza que deseja ${action} o utilizador '${user.username}'?`)) {
            return;
        }

        try {
            const response = await this.app.api.toggleUserStatus(this.selectedUserId, this.app.currentUser.username);
            if(response.success) {
                this.app.showToast(`Utilizador ${action} com sucesso!`, 'success');
                this.loadData();
            } else {
                this.app.showToast(response.error, 'error');
            }
        } catch (error) {
             console.error('Toggle user status error:', error);
            this.app.showToast('Erro ao alterar status do utilizador', 'error');
        }
    }
}