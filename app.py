# app.py

from flask import Flask
from flask_cors import CORS

# IMPORTAR O NOVO ARQUIVO 'PESSOAS'
from api import usuarios, entradas, pessoas 

app = Flask(__name__)
CORS(app) 

# REGISTRAR O NOVO ARQUIVO 'PESSOAS'
app.register_blueprint(usuarios.bp)
app.register_blueprint(entradas.bp)
app.register_blueprint(pessoas.bp) # <-- ADICIONE ESTA LINHA

@app.route('/')
def hello():
    return "Servidor da API no ar!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)