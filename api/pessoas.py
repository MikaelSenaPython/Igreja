# Substitua TODO o conteúdo de api/pessoas.py por isto:

from flask import Blueprint, jsonify, request
from . import database 

bp = Blueprint('pessoas', __name__, url_prefix='/api/pessoas')

# Rota 1: Listar todas as pessoas (Você já tinha)
@bp.route('', methods=['GET'])
def get_pessoas():
    try:
        pessoas = database.get_all_records('pessoas') 
        return jsonify(pessoas)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota 2: Buscar UMA pessoa (CORRIGE O BUG DO "JOÃO SILVA")
@bp.route('/<int:id>', methods=['GET'])
def get_pessoa(id):
    try:
        pessoa = database.get_record_by_id('pessoas', id)
        if pessoa:
            return jsonify(pessoa)
        else:
            return jsonify({"error": "Pessoa não encontrada"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
# Rota 3: Criar uma nova pessoa
@bp.route('', methods=['POST'])
def create_pessoa():
    data = request.json
    try:
        # Obter o novo ID
        all_pessoas = database.get_all_records('pessoas')
        new_id = max([int(p['id']) for p in all_pessoas if p.get('id')]) + 1 if all_pessoas else 1
        data['id'] = new_id

        success = database.add_row('pessoas', data)
        if success:
            return jsonify({"success": True, "data": data})
        else:
            return jsonify({"success": False, "error": "Falha ao salvar pessoa"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Rota 4: Atualizar uma pessoa
@bp.route('/<int:id>', methods=['PUT'])
def update_pessoa(id):
    data = request.json
    data['id'] = id # Garante que o ID está nos dados
    try:
        success = database.update_row_by_id('pessoas', id, data)
        if success:
            return jsonify({"success": True, "data": data})
        else:
            return jsonify({"success": False, "error": "Falha ao atualizar pessoa"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Rota 5: Excluir uma pessoa
@bp.route('/<int:id>', methods=['DELETE'])
def delete_pessoa(id):
    try:
        success = database.delete_row_by_id('pessoas', id)
        if success:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Falha ao excluir pessoa"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500