# /api/index.py

from flask import Flask
from flask_cors import CORS

# Cria a instância principal do aplicativo Flask
app = Flask(__name__)
CORS(app)

# Importa e registra as rotas de usuários e entradas
from . import usuarios
from . import entradas

app.register_blueprint(usuarios.bp)
app.register_blueprint(entradas.bp)

# Executa o servidor quando este arquivo for rodado diretamente
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
