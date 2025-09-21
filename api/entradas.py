# api/entradas.py

from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# O caminho para o nosso "banco de dados"
DB_PATH = 'api/data.json'

def read_data():
    """Função para ler os dados do arquivo JSON."""
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/api/entradas', methods=['GET'])
def get_entradas():
    """Busca a lista de entradas do arquivo data.json."""
    data = read_data()
    # Retorna a lista que está sob a chave 'entradas' no JSON
    return jsonify(data.get('entradas', []))