# /api/usuarios.py

from flask import Blueprint, jsonify, request
from . import database

# Definição do blueprint para rotas de usuários
bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')

# Rota para listar todos os usuários
@bp.route('', methods=['GET'])
def get_users():
    users = database.get_all_records('usuarios')
    return jsonify(users)

# Rota para registrar um novo usuário
@bp.route('/registrar', methods=['POST'])
def register_user():
    new_user_data = request.json
    all_users = database.get_all_records('usuarios')

    new_id = max([int(u['id']) for u in all_users]) + 1 if all_users else 1

    user_to_add = {
        "id": new_id,
        "username": new_user_data.get('username'),
        "email": new_user_data.get('email'),
        "role": new_user_data.get('role'),
        "password": new_user_data.get('password'),
        "active": True
    }

    success = database.add_row('usuarios', user_to_add)

    if success:
        return jsonify({"success": True, "data": user_to_add})
    else:
        return jsonify({"success": False, "error": "Falha ao registrar usuário na planilha."}), 500
