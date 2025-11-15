// API Service - Simulates backend API calls with localStorage persistence
// ADICIONE ESTE BLOCO DE CÓDIGO AQUI NO TOPO DO ARQUIVO
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:5000' // Vamos usar 127.0.0.1 para garantir
    : ''; // Vazio para usar o endereço do próprio site quando estiver online na Vercel
    
class ApiService {
    constructor() {
        this.mockData = null;
    }
    

    async init() {
        try {
            await this._loadData();
            console.log("ApiService inicializada e dados carregados com sucesso.");
            return true;
        } catch (error) {
            console.error("Falha crítica ao inicializar a ApiService:", error);
            return false;
        }
    }
    
    async _loadData() {
        const savedData = localStorage.getItem('churchMockData');
        if (savedData) {
            this.mockData = JSON.parse(savedData);
        } else {
            this.mockData = this.initializeMockData();
            this._saveData();
        }
    }

    _saveData() {
        localStorage.setItem('churchMockData', JSON.stringify(this.mockData));
    }

    initializeMockData() {
        // ... (o conteúdo desta função permanece o mesmo)
        return {
            users: [
                { id: 1, username: 'Mikael', email: 'mikaelpython7@gmail.com', role: 'Presidente', password: '162408', active: true, createdAt: '2024-01-01T00:00:00Z', lastLogin: '2025-09-17T10:30:00Z' },
                { id: 2, username: 'Pastor', email: 'pastor@gmail.com', role: 'Presidente', password: '1234', active: true, createdAt: '2024-01-01T00:00:00Z', lastLogin: '2025-09-14T15:20:00Z' },
                { id: 3, username: 'Tesoureiro', email: 'tesoureiro@gmail.com', role: 'Tesoureiro', password: '1234', active: true, createdAt: '2024-01-01T00:00:00Z', lastLogin: '2025-09-13T09:15:00Z' },
                { id: 4, username: 'Secretario', email: 'secretario@gmail.com', role: 'Secretario', password: '1234', active: false, createdAt: '2024-01-01T00:00:00Z', lastLogin: '2025-09-12T14:45:00Z' }
            ],
            pessoas: [
                { id: 1, nomeCompleto: 'João Silva', telefone: '(11) 99999-9999', endereco: 'Rua das Flores, 123', dataNascimento: '1980-05-15', estadoCivil: 'Casado(a)', dataBatismo: '2000-12-25', dataCadastro: '2020-01-01', status: 'Ativo', funcaoEclesiastica: 'Membro', photoPath: null, associations: { ministerios: [1, 4], etiquetas: [3] } },
                { id: 2, nomeCompleto: 'Maria Santos', telefone: '(11) 88888-8888', endereco: 'Av. Principal, 456', dataNascimento: '1985-08-20', estadoCivil: 'Solteiro(a)', dataBatismo: '2005-04-10', dataCadastro: '2020-02-15', status: 'Ativo', funcaoEclesiastica: 'Obreiro', photoPath: null, associations: { ministerios: [3], etiquetas: [1, 2] } }
            ],
            entradas: [
                { id: 1, data: '2025-09-15', membroId: 1, tipo: 'Dízimo', valor: 500.00, observacoes: 'Dízimo do mês de janeiro', projetoId: null, ministerioId: 1, registradoPor: 1 },
                { id: 2, data: '2025-08-20', membroId: 2, tipo: 'Oferta', valor: 100.00, observacoes: 'Oferta especial', projetoId: 1, ministerioId: 3, registradoPor: 2 }
            ],
            saidas: [
                { id: 1, data: '2025-09-10', descricao: 'Pagamento de energia elétrica', categoria: 'Contas Fixas', valor: 350.00, observacoes: 'Conta de janeiro', projetoId: null, ministerioId: null, registradoPor: 3 }
            ],
            projetos: [
                { id: 1, nome: 'Reforma do Templo', descricao: 'Projeto para reforma geral do templo', ativo: true, createdAt: '2024-01-01T00:00:00Z' },
                { id: 2, nome: 'Campanha Missionária', descricao: 'Apoio às missões', ativo: true, createdAt: '2024-01-01T00:00:00Z' }
            ],
            ministerios: [
                { id: 1, nome: 'Louvor e Adoração', categoriaId: 1 }, { id: 2, nome: 'Escola Dominical', categoriaId: 1 }, { id: 3, nome: 'Ação Social', categoriaId: 2 }, { id: 4, nome: 'Grupo de Oração', categoriaId: 2 }, { id: 5, nome: 'Projeto de Missões', categoriaId: 3 }
            ],
            categoriasMinisterio: [
                { id: 1, nome: 'Departamentos' }, { id: 2, nome: 'Grupos de Apoio' }, { id: 3, nome: 'Projetos Especiais' }
            ],
            auditoriaLogs: [
                { id: 1, timestamp: '2025-08-05T10:00:00Z', username: 'Visitante', action: 'LOGIN_FAIL', details: 'Tentativa de login para utilizador inexistente.' }
            ],
            tiposEntrada: [
                { id: 1, nome: 'Dízimo' }, { id: 2, nome: 'Oferta' }, { id: 3, nome: 'Doação Especial' }, { id: 4, nome: 'Outros' }
            ],
            categoriasSaida: [
                { id: 1, nome: 'Contas Fixas' }, { id: 2, nome: 'Manutenção' }, { id: 3, nome: 'Eventos' }, { id: 4, nome: 'Ação Social' }, { id: 5, nome: 'Material de Escritório' }, { id: 6, nome: 'Outros' }
            ],
            etiquetas: [
                { id: 1, nome: 'Novo Convertido' }, { id: 2, nome: 'Visitante' }, { id: 3, nome: 'Líder' }, { id: 4, nome: 'Necessidade Especial' }
            ],
            churchInfo: { name: "Igreja Pentecostal Caminho da Fé", address: "Rua das Oliveiras, 123 - Centro" },
            participacao_ceia: []
        };
    }

    _addLog(username, action, details) {
        const newLog = {
            id: this.mockData.auditoriaLogs.length > 0 ? Math.max(...this.mockData.auditoriaLogs.map(l => l.id)) + 1 : 1,
            timestamp: new Date().toISOString(),
            username: username,
            action: action,
            details: details
        };
        this.mockData.auditoriaLogs.push(newLog);
        this._saveData();
    }

    delay(ms = 100) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async login(username, password) {
        await this.delay(500);
        const user = this.mockData.users.find(u => u.username === username && u.password === password);
        if (user && user.active) {
            user.lastLogin = new Date().toISOString();
            this._addLog(username, 'LOGIN_SUCCESS', 'Login bem-sucedido.');
            return {
                success: true,
                data: { id: user.id, username: user.username, email: user.email, role: user.role, token: 'mock-jwt-token-' + user.id }
            };
        }
        const attemptedUser = this.mockData.users.find(u => u.username === username);
        const details = attemptedUser ? 'Tentativa de login com senha incorreta ou conta inativa.' : 'Tentativa de login para utilizador inexistente.';
        this._addLog(username, 'LOGIN_FAIL', details);
        return { success: false, error: 'Credenciais inválidas ou utilizador inativo' };
    }

    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/usuarios/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                // Se o servidor responder com um erro, captura a mensagem
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro de servidor');
            }
            return await response.json();
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            return { success: false, error: error.message };
        }
    }

    async recoverPassword(email) {
        await this.delay(1500);
        const user = this.mockData.users.find(u => u.email === email);
        if (user) {
            console.log(`Recovery code for ${email}: 123456`);
            return { success: true, message: 'Código de recuperação enviado para o email' };
        }
        return { success: false, error: 'Email não encontrado' };
    }
    
    async changePassword(userId, oldPassword, newPassword) {
        await this.delay();
        const user = this.mockData.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, error: 'Utilizador não encontrado.' };
        }
        if (user.password !== oldPassword) {
            this._addLog(user.username, 'CHANGE_PASSWORD_FAIL', 'Tentativa de alterar senha com a senha atual incorreta.');
            return { success: false, error: 'A senha atual está incorreta.' };
        }
        user.password = newPassword;
        this._addLog(user.username, 'CHANGE_PASSWORD_SUCCESS', 'Utilizador alterou a própria senha.');
        this._saveData();
        return { success: true };
    }

    async getUserAssociations(userId) {
        await this.delay();
        const pessoa = this.mockData.pessoas.find(p => p.id === userId);
        if (pessoa && pessoa.associations) {
            const ministerios = this.mockData.ministerios
                .filter(m => pessoa.associations.ministerios.includes(m.id))
                .map(m => m.nome);
            const etiquetas = this.mockData.etiquetas
                .filter(e => pessoa.associations.etiquetas.includes(e.id))
                .map(e => e.nome);
            return { success: true, data: { ministerios, etiquetas } };
        }
        return { success: true, data: { ministerios: [], etiquetas: [] } };
    }

    async getUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/usuarios`);
            if (!response.ok) {
                throw new Error('Não foi possível conectar ao servidor.');
            }
            const users = await response.json();
            return { success: true, data: users };
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            return { success: false, error: 'Erro ao buscar usuários.' };
        }
    }

    async getUser(id) {
        try {
            // Nota: No futuro, sua API em Python terá uma rota específica para buscar um só usuário
            // Ex: /api/usuarios/1
            // Por enquanto, vamos buscar todos e filtrar no frontend.
            const response = await fetch('http://127.0.0.1:5000/api/usuarios');
            if (!response.ok) {
                throw new Error('Não foi possível conectar ao servidor.');
            }
            const users = await response.json();
            const user = users.find(u => u.id === parseInt(id));
            
            return user 
                ? { success: true, data: user } 
                : { success: false, error: 'Utilizador não encontrado' };
        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
            return { success: false, error: 'Erro ao buscar usuário.' };
        }
    }

    async toggleUserStatus(id, adminUsername) {
        await this.delay();
        const user = this.mockData.users.find(u => u.id === parseInt(id));
        if (user) {
            user.active = !user.active;
            const details = `O status do utilizador "${user.username}" foi alterado para ${user.active ? 'Ativo' : 'Inativo'}.`;
            this._addLog(adminUsername, 'USER_STATUS_CHANGED', details);
            return { success: true, data: user };
        }
        return { success: false, error: 'Utilizador não encontrado' };
    }

    async getPessoas(search = '') {
        await this.delay();
        let pessoas = this.mockData.pessoas;
        if (search) {
            pessoas = pessoas.filter(p => p.nomeCompleto.toLowerCase().includes(search.toLowerCase()));
        }
        return { success: true, data: pessoas };
    }

    async getPessoa(id) {
        await this.delay();
        const pessoa = this.mockData.pessoas.find(p => p.id === parseInt(id));
        return pessoa ? { success: true, data: pessoa } : { success: false, error: 'Pessoa não encontrada' };
    }
    
    async createPessoa(pessoaData) {
        await this.delay();
        const newPessoa = {
            id: this.mockData.pessoas.length > 0 ? Math.max(...this.mockData.pessoas.map(p => p.id)) + 1 : 1,
            ...pessoaData,
            dataCadastro: pessoaData.dataCadastro || getCurrentDate()
        };
        this.mockData.pessoas.push(newPessoa);
        this._saveData();
        return { success: true, data: newPessoa };
    }

    async updatePessoa(id, pessoaData) {
        await this.delay();
        const index = this.mockData.pessoas.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.mockData.pessoas[index] = { ...this.mockData.pessoas[index], ...pessoaData };
            this._saveData();
            return { success: true, data: this.mockData.pessoas[index] };
        }
        return { success: false, error: 'Pessoa não encontrada' };
    }

    async deletePessoa(id) {
        await this.delay();
        const index = this.mockData.pessoas.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.mockData.pessoas.splice(index, 1);
            this._saveData();
            return { success: true };
        }
        return { success: false, error: 'Pessoa não encontrada' };
    }

    async getMinisterios() {
        await this.delay();
        const ministeriosComCategoria = this.mockData.ministerios.map(min => {
            const categoria = this.mockData.categoriasMinisterio.find(cat => cat.id === min.categoriaId);
            return { ...min, categoriaNome: categoria ? categoria.nome : 'Sem Categoria' };
        });
        return { success: true, data: ministeriosComCategoria };
    }

    async getCategoriasMinisterio() {
        await this.delay();
        return { success: true, data: this.mockData.categoriasMinisterio };
    }

    async createMinisterio(data, adminUsername) {
        await this.delay();
        const newMinisterio = {
            id: this.mockData.ministerios.length > 0 ? Math.max(...this.mockData.ministerios.map(m => m.id)) + 1 : 1,
            nome: data.nome,
            categoriaId: parseInt(data.categoriaId, 10)
        };
        this.mockData.ministerios.push(newMinisterio);
        this._addLog(adminUsername, 'MINISTRY_CREATED', `Ministério "${data.nome}" foi criado.`);
        return { success: true, data: newMinisterio };
    }

    async updateMinisterio(id, data) {
        await this.delay();
        const index = this.mockData.ministerios.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            this.mockData.ministerios[index].nome = data.nome;
            this.mockData.ministerios[index].categoriaId = parseInt(data.categoriaId, 10);
            this._saveData();
            return { success: true, data: this.mockData.ministerios[index] };
        }
        return { success: false, error: 'Ministério não encontrado' };
    }

    async deleteMinisterio(id) {
        await this.delay();
        const index = this.mockData.ministerios.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            this.mockData.ministerios.splice(index, 1);
            this._saveData();
            return { success: true };
        }
        return { success: false, error: 'Ministério não encontrado' };
    }
    
    async getLogs(filters = {}) {
        await this.delay();
        let logs = this.mockData.auditoriaLogs;

        if (filters.ano) {
            logs = logs.filter(log => new Date(log.timestamp).getFullYear() == filters.ano);
        }
        if (filters.mes) {
            logs = logs.filter(log => (new Date(log.timestamp).getMonth() + 1) == filters.mes);
        }
        if (filters.username) {
            logs = logs.filter(log => log.username === filters.username);
        }
        if (filters.actionType) {
            const actionMap = {
                'LOGIN': ['LOGIN_SUCCESS', 'LOGIN_FAIL'],
                'USER_MANAGE': ['USER_STATUS_CHANGED', 'USER_ROLE_CHANGED', 'USER_REGISTERED'],
                'TRANSACTION': ['ENTRADA_CRIADA', 'SAIDA_CRIADA', 'ENTRADA_ALTERADA', 'SAIDA_ALTERADA']
            };
            if (actionMap[filters.actionType]) {
                logs = logs.filter(log => actionMap[filters.actionType].includes(log.action));
            }
        }
        
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return { success: true, data: logs };
    }

    async getAnosDisponiveis() {
        await this.delay();
        const logYears = this.mockData.auditoriaLogs.map(l => new Date(l.timestamp).getFullYear());
        const entradaYears = this.mockData.entradas.map(t => new Date(t.data).getFullYear());
        const saidaYears = this.mockData.saidas.map(t => new Date(t.data).getFullYear());

        const allYears = [...new Set([...logYears, ...entradaYears, ...saidaYears])];
        allYears.sort((a, b) => b - a);
        return { success: true, data: allYears };
    }

    async getEntradas(filters = {}) {
        try {
            // 1. Busca a lista bruta de entradas da nova API em Python
            const response = await fetch(`${API_BASE_URL}/api/entradas`);
            if (!response.ok) {
                throw new Error('Erro de rede ao buscar entradas.');
            }
            const fetchedEntradas = await response.json();

            // 2. Mapeia os dados para adicionar os nomes, usando o this.mockData que já foi carregado
            //    Esta é a mesma lógica que você já tinha, o que é ótimo!
            let entradas = fetchedEntradas.map(entrada => {
                const membro = this.mockData.pessoas.find(p => p.id === entrada.membroId);
                const projeto = this.mockData.projetos.find(p => p.id === entrada.projetoId);
                const ministerio = this.mockData.ministerios.find(m => m.id === entrada.ministerioId);
                const registrador = this.mockData.users.find(u => u.id === entrada.registradoPor);
                return {
                    ...entrada,
                    nomeMembro: membro?.nomeCompleto || 'Doador Anônimo',
                    nomeProjeto: projeto?.nome || null,
                    nomeMinisterio: ministerio?.nome || 'Caixa Geral',
                    registradoPor: registrador?.username || 'Sistema Antigo'
                };
            });

            // 3. Aplica os filtros no frontend (como já fazia antes)
            if (filters.ano && filters.ano !== 'Todos') {
                entradas = entradas.filter(e => e.data.startsWith(filters.ano));
            }
            if (filters.mes && filters.mes !== '') {
                const mesStr = filters.mes.toString().padStart(2, '0');
                entradas = entradas.filter(e => e.data.split('-')[1] === mesStr);
            }
            if (filters.tipo && filters.tipo !== 'Todos') {
                entradas = entradas.filter(e => e.tipo === filters.tipo);
            }

            return { success: true, data: entradas };

        } catch (error) {
            console.error("Erro ao buscar entradas:", error);
            return { success: false, error: 'Não foi possível carregar as entradas.' };
        }
    }

    async createEntrada(entradaData, username) {
        await this.delay();
        const currentUser = this.mockData.users.find(u => u.username === username);
        const newEntrada = {
            id: this.mockData.entradas.length > 0 ? Math.max(...this.mockData.entradas.map(e => e.id)) + 1 : 1,
            ...entradaData,
            registradoPor: currentUser ? currentUser.id : 0
        };
        this.mockData.entradas.push(newEntrada);
        const details = `Nova Entrada (ID: ${newEntrada.id}): ${newEntrada.tipo}, Valor: R$ ${newEntrada.valor.toFixed(2)}`;
        this._addLog(username, 'ENTRADA_CRIADA', details);
        this._saveData(); // CORREÇÃO: Adicionado para salvar os dados no localStorage
        return { success: true, data: newEntrada };
    }

    async updateEntrada(id, entradaData) {
        await this.delay();
        const index = this.mockData.entradas.findIndex(e => e.id === parseInt(id));
        if (index !== -1) {
            this.mockData.entradas[index] = { ...this.mockData.entradas[index], ...entradaData };
            this._saveData();
            return { success: true, data: this.mockData.entradas[index] };
        }
        return { success: false, error: 'Entrada não encontrada' };
    }

    async deleteEntrada(id) {
        await this.delay();
        const index = this.mockData.entradas.findIndex(e => e.id === parseInt(id));
        if (index !== -1) {
            this.mockData.entradas.splice(index, 1);
            this._saveData();
            return { success: true };
        }
        return { success: false, error: 'Entrada não encontrada' };
    }

    async getSaidas(filters = {}) {
        await this.delay();
        let saidas = this.mockData.saidas.map(saida => {
            const projeto = this.mockData.projetos.find(p => p.id === saida.projetoId);
            const ministerio = this.mockData.ministerios.find(m => m.id === saida.ministerioId);
            const registrador = this.mockData.users.find(u => u.id === saida.registradoPor);
            return {
                ...saida,
                nomeProjeto: projeto?.nome || null,
                nomeMinisterio: ministerio?.nome || 'Caixa Geral',
                registradoPor: registrador?.username || 'Sistema Antigo'
            };
        });
        if (filters.ano && filters.ano !== 'Todos') {
            saidas = saidas.filter(s => s.data.startsWith(filters.ano));
        }
        if (filters.categoria && filters.categoria !== 'Todos') {
            saidas = saidas.filter(s => s.categoria === filters.categoria);
        }
        return { success: true, data: saidas };
    }

    async createSaida(saidaData, username) {
        await this.delay();
        const currentUser = this.mockData.users.find(u => u.username === username);
        const newSaida = {
            id: this.mockData.saidas.length > 0 ? Math.max(...this.mockData.saidas.map(s => s.id)) + 1 : 1,
            ...saidaData,
            registradoPor: currentUser ? currentUser.id : 0
        };
        this.mockData.saidas.push(newSaida);
        const details = `Nova Saída (ID: ${newSaida.id}): ${newSaida.descricao}, Valor: R$ ${newSaida.valor.toFixed(2)}`;
        this._addLog(username, 'SAIDA_CRIADA', details);
        this._saveData(); // CORREÇÃO: Adicionado para salvar os dados no localStorage
        return { success: true, data: newSaida };
    }

    async updateSaida(id, saidaData) {
        await this.delay();
        const index = this.mockData.saidas.findIndex(e => e.id === parseInt(id));
        if (index !== -1) {
            this.mockData.saidas[index] = { ...this.mockData.saidas[index], ...saidaData };
            this._saveData();
            return { success: true, data: this.mockData.saidas[index] };
        }
        return { success: false, error: 'Saída não encontrada' };
    }

    async deleteSaida(id) {
        await this.delay();
        const index = this.mockData.saidas.findIndex(e => e.id === parseInt(id));
        if (index !== -1) {
            this.mockData.saidas.splice(index, 1);
            this._saveData();
            return { success: true };
        }
        return { success: false, error: 'Saída não encontrada' };
    }
    
    async manageList(listName, action, data) {
        await this.delay();
        if (!this.mockData[listName]) return { success: false, error: 'Lista não encontrada' };
        const list = this.mockData[listName];
        let result = { success: false, error: 'Ação falhou.' };
        
        switch(action) {
            case 'add':
                if (list.some(item => item.nome.toLowerCase() === data.nome.toLowerCase())) {
                    result = { success: false, error: 'Este nome já existe na lista.' };
                    break;
                }
                const newItem = {
                    id: list.length > 0 ? Math.max(...list.map(i => i.id)) + 1 : 1,
                    nome: data.nome
                };
                list.push(newItem);
                result = { success: true, data: newItem };
                break;
            case 'update':
                const itemToUpdate = list.find(item => item.id == data.id);
                if (itemToUpdate) {
                    itemToUpdate.nome = data.nome;
                    result = { success: true, data: itemToUpdate };
                } else {
                    result = { success: false, error: 'Item não encontrado.' };
                }
                break;
            case 'delete':
                const index = list.findIndex(item => item.id == data.id);
                if (index !== -1) {
                    list.splice(index, 1);
                    result = { success: true };
                } else {
                    result = { success: false, error: 'Item não encontrado.' };
                }
                break;
            default:
                result = { success: false, error: 'Ação desconhecida.' };
        }
        if(result.success) {
            this._saveData();
        }
        return result;
    }

    async getProjetos() {
        await this.delay();
        return { success: true, data: this.mockData.projetos };
    }

    async createProjeto(projetoData) {
        await this.delay();
        const newProjeto = {
            id: this.mockData.projetos.length + 1,
            ...projetoData,
            ativo: true,
            createdAt: new Date().toISOString()
        };
        this.mockData.projetos.push(newProjeto);
        this._saveData();
        return { success: true, data: newProjeto };
    }
    
    async getChurchInfo() {
        await this.delay();
        return { success: true, data: this.mockData.churchInfo };
    }

    async saveChurchInfo(info) {
        await this.delay();
        this.mockData.churchInfo = info;
        this._saveData();
        this._addLog(this.mockData.users.find(u => u.role === 'Presidente').username, 'CONFIG_UPDATED', 'Informações da igreja foram atualizadas.');
        return { success: true };
    }

    async createBackup() {
        await this.delay();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.mockData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `backup_sistema_igreja_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        return { success: true, message: 'Backup gerado com sucesso.' };
    }

    async restoreBackup(data) {
        await this.delay();
        try {
            const restoredData = JSON.parse(data);
            if (restoredData.users && restoredData.pessoas && restoredData.entradas) {
                this.mockData = restoredData;
                this._saveData();
                return { success: true };
            } else {
                return { success: false, error: 'Arquivo de backup inválido ou corrompido.' };
            }
        } catch (e) {
            return { success: false, error: 'Erro ao processar o arquivo de backup.' };
        }
    }

    async getTiposEntrada() {
        await this.delay();
        return { success: true, data: this.mockData.tiposEntrada };
    }
    async getCategoriasSaida() {
        await this.delay();
        return { success: true, data: this.mockData.categoriasSaida };
    }
    async getEtiquetas() {
        await this.delay();
        return { success: true, data: this.mockData.etiquetas };
    }

    getControleMensal(ano, mes) {
        // CORREÇÃO: Verifica se o mockData e a lista de pessoas foram carregados
        if (!this.mockData || !this.mockData.pessoas) {
            console.error("A lista de membros (pessoas) não foi carregada na ApiService.");
            return { success: false, data: [] };
        }
        
        // ADICIONE ESTA VERIFICAÇÃO AQUI
        if (!this.mockData.entradas) {
            console.error("A lista de ENTRADAS não foi carregada na ApiService. Limpe o localStorage.");
            // Retorna um array vazio para não quebrar a função .map() que vem depois
            return { success: true, data: [] }; 
        }

        const anoNumerico = parseInt(ano, 10);
        const mesNumerico = parseInt(mes, 10);

        // CORREÇÃO: Usa this.mockData.pessoas e filtra por status 'Ativo'
        const membrosAtivos = this.mockData.pessoas.filter(p => p.status === 'Ativo');

        const dadosControle = membrosAtivos.map(membro => {
            // CORREÇÃO: Usa this.mockData.entradas para verificar os dízimos
            const entregouDizimo = this.mockData.entradas.some(entrada =>
                entrada.membroId === membro.id &&
                entrada.tipo === 'Dízimo' &&
                new Date(entrada.data).getFullYear() === anoNumerico &&
                (new Date(entrada.data).getMonth() + 1) === mesNumerico
            );

            // CORREÇÃO: Usa this.mockData.participacao_ceia
            const participouCeia = this.mockData.participacao_ceia.some(ceia =>
                ceia.pessoaId === membro.id &&
                parseInt(ceia.ano, 10) === anoNumerico &&
                parseInt(ceia.mes, 10) === mesNumerico
            );

            return {
                id: membro.id,
                nome: membro.nomeCompleto, // CORREÇÃO: Usa 'nomeCompleto'
                dizimista: entregouDizimo,
                tomouCeia: participouCeia
            };
        });

        return { success: true, data: dadosControle };
    }
    
    async setParticipacaoCeia(userId, ano, mes, participou) {
        await this.delay();
        const registroIndex = this.mockData.participacao_ceia.findIndex(c => c.pessoaId === userId && c.ano == ano && c.mes == mes);
        if (participou && registroIndex === -1) {
            this.mockData.participacao_ceia.push({ pessoaId: userId, ano, mes });
        } else if (!participou && registroIndex > -1) {
            this.mockData.participacao_ceia.splice(registroIndex, 1);
        }
        this._saveData();
        return { success: true };
    }

    async getDashboardData(period = 'current') {
        await this.delay();
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const entradas = this.mockData.entradas.filter(e => {
            const entradaDate = new Date(e.data);
            return entradaDate.getMonth() + 1 === currentMonth && entradaDate.getFullYear() === currentYear;
        });
        const saidas = this.mockData.saidas.filter(s => {
            const saidaDate = new Date(s.data);
            return saidaDate.getMonth() + 1 === currentMonth && saidaDate.getFullYear() === currentYear;
        });
        const totalEntradas = entradas.reduce((sum, e) => sum + e.valor, 0);
        const totalSaidas = saidas.reduce((sum, s) => sum + s.valor, 0);
        const saldoMes = totalEntradas - totalSaidas;
        
        let saldoAnterior = 0;
        const todasTransacoesAnteriores = [
            ...this.mockData.entradas.filter(e => new Date(e.data) < new Date(currentYear, currentMonth - 1, 1)),
            ...this.mockData.saidas.filter(s => new Date(s.data) < new Date(currentYear, currentMonth - 1, 1))
        ];
        todasTransacoesAnteriores.forEach(t => {
            if(t.hasOwnProperty('tipo')) {
                saldoAnterior += t.valor;
            } else {
                saldoAnterior -= t.valor;
            }
        });

        const saldoFinal = saldoAnterior + saldoMes;
        const entradasPorTipo = {};
        entradas.forEach(e => {
            entradasPorTipo[e.tipo] = (entradasPorTipo[e.tipo] || 0) + e.valor;
        });
        const saidasPorCategoria = {};
        saidas.forEach(s => {
            saidasPorCategoria[s.categoria] = (saidasPorCategoria[s.categoria] || 0) + s.valor;
        });
        return {
            success: true,
            data: {
                kpis: { saldoAnterior, totalEntradas, totalSaidas, saldoMes, saldoFinal },
                entradasPorTipo,
                saidasPorCategoria,
                transacoes: [
                    ...entradas.map(e => ({ ...e, mov: 'Entrada' })),
                    ...saidas.map(s => ({ ...s, mov: 'Saída' }))
                ].sort((a, b) => new Date(b.data) - new Date(a.data))
            }
        };
    }
}