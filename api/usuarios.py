# api/usuarios.py (ATUALIZADO)

from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Caminho para o nosso arquivo de banco de dados
DB_PATH = 'api/data.json'

def read_data():
    """Função para ler os dados do arquivo JSON."""
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_data(data):
    """Função para salvar os dados no arquivo JSON."""
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# --- ROTAS DA API ---

@app.route('/api/usuarios', methods=['GET'])
def get_users():
    """Busca a lista de usuários do arquivo data.json."""
    data = read_data()
    return jsonify(data.get('users', []))

@app.route('/api/usuarios/registrar', methods=['POST'])
def register_user():
    """Registra um novo usuário no arquivo data.json."""
    new_user = request.json
    data = read_data()

    # Lógica para adicionar o novo usuário
    new_id = max([u['id'] for u in data['users']]) + 1 if data['users'] else 1
    user_to_add = {
        "id": new_id,
        "username": new_user['username'],
        "email": new_user['email'],
        "password": new_user['password'], # Lembre-se que em um projeto real, a senha deve ser criptografada!
        "role": new_user['role'],
        "active": True
    }
    data['users'].append(user_to_add)
    
    write_data(data) # Salva os dados de volta no arquivo

    return jsonify({"success": True, "data": user_to_add})