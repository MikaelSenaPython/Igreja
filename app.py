# app.py (Este é o seu novo arquivo de servidor principal)

from flask import Flask
from flask_cors import CORS

# Importe os blueprints dos seus arquivos
from api import entradas, usuarios

app = Flask(__name__)
CORS(app) # Configure o CORS aqui, para todo o app

# Registre os blueprints
app.register_blueprint(usuarios.bp)
app.register_blueprint(entradas.bp)

@app.route('/')
def hello():
    return "Servidor da API no ar!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)