# /api/entradas.py (VERSÃO CORRIGIDA)

from flask import Blueprint, jsonify, request  # Mude 'Flask' para 'Blueprint'
from flask_cors import CORS
from . import database

# Crie um blueprint em vez de um app
bp = Blueprint('entradas', __name__, url_prefix='/api/entradas')

# Remova a inicialização do app e CORS daqui
# app = Flask(__name__)
# CORS(app)

@bp.route('', methods=['GET'])  # Mude a rota para o blueprint
def get_entradas():
    entradas = database.get_all_records('entradas')
    return jsonify(entradas)

@bp.route('', methods=['POST']) # Mude a rota para o blueprint
def add_entrada():
    nova_entrada = request.json
    data = database.get_all_records('entradas')
    users = database.get_all_records('usuarios')

    registrador_username = nova_entrada.get('registradoPor')
    registrador = next((user for user in users if user['username'] == registrador_username), None)

    novo_id = max([int(e['id']) for e in data]) + 1 if data else 1

    entrada_para_salvar = {
        "id": novo_id,
        "data": nova_entrada.get('data'),
        "membroId": nova_entrada.get('membroId'),
        "tipo": nova_entrada.get('tipo'),
        "valor": nova_entrada.get('valor'),
        "projetoId": nova_entrada.get('projetoId'),
        "ministerioId": nova_entrada.get('ministerioId'),
        "observacoes": nova_entrada.get('observacoes'),
        "registradoPor": registrador['id'] if registrador else None
    }

    success = database.add_row('entradas', entrada_para_salvar)

    if success:
        return jsonify({"success": True, "data": entrada_para_salvar})
    else:
        return jsonify({"success": False, "error": "Falha ao salvar entrada na planilha."}), 500
    
# Em api/entradas.py (no final do arquivo)

@bp.route('/<int:id>', methods=['PUT'])
def update_entrada(id):
    """Atualiza uma entrada existente."""
    entrada_data = request.json
    
    # Prepara os dados para salvar (precisamos do ID)
    # ATENÇÃO: O 'registradoPor' também precisa ser enviado pelo JS
    # Mas, por simplicidade, vamos focar em atualizar os dados principais
    
    # O Python precisa do ID de volta no dicionário
    entrada_data['id'] = id
    
    # (Você pode precisar re-buscar 'users' e recalcular 'registradorId' aqui se for editável)
    # Por enquanto, estamos apenas salvando os dados como vieram
    
    success = database.update_row_by_id('entradas', id, entrada_data)

    if success:
        return jsonify({"success": True, "data": entrada_data})
    else:
        return jsonify({"success": False, "error": "Falha ao atualizar entrada."}), 500

@bp.route('/<int:id>', methods=['DELETE'])
def delete_entrada(id):
    """Exclui uma entrada."""
    try:
        success = database.delete_row_by_id('entradas', id)
        if success:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Entrada não encontrada."}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500