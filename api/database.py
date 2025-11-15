# /api/database.py

import gspread
from google.oauth2.service_account import Credentials
import os

# Define as permissões que nossa API precisa
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
]

# Carrega as credenciais a partir do arquivo JSON que você guardou na pasta 'config'
CREDS = Credentials.from_service_account_file('config/google_credentials.json', scopes=SCOPES)
GC = gspread.authorize(CREDS)

# --- IMPORTANTE: Substitua pela ID da sua planilha ---
SPREADSHEET_ID = "1Uir1JWYkupOYObxT8IpDOvnxxA-EVRlKLOWO-Yvncho" 
SPREADSHEET = GC.open_by_key(SPREADSHEET_ID)


def get_all_records(sheet_name):
    """Busca todos os registros de uma aba da planilha."""
    try:
        sheet = SPREADSHEET.worksheet(sheet_name)
        return sheet.get_all_records()
    except gspread.exceptions.WorksheetNotFound:
        return [] # Retorna lista vazia se a aba não for encontrada

def add_row(sheet_name, data_dict):
    """Adiciona uma nova linha em uma aba da planilha."""
    try:
        sheet = SPREADSHEET.worksheet(sheet_name)
        # Pega os cabeçalhos da planilha (id, username, etc.)
        headers = sheet.row_values(1)
        # Organiza os dados do dicionário na mesma ordem dos cabeçalhos
        row_to_insert = [data_dict.get(header) for header in headers]
        sheet.append_row(row_to_insert)
        return True
    except Exception as e:
        print(f"Erro ao adicionar linha em '{sheet_name}': {e}")
        return False

# No futuro, podemos adicionar mais funções aqui (ex: update_row, delete_row)