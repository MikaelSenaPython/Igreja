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

# Em api/database.py

def update_row_by_id(sheet_name, id, data_dict):
    """Atualiza uma linha em uma aba da planilha, procurando pelo ID."""
    try:
        sheet = SPREADSHEET.worksheet(sheet_name)
        headers = sheet.row_values(1)
        
        # Encontra a coluna que se chama 'id'
        id_col_index = headers.index('id') + 1
        
        # Encontra a célula que contém o ID (convertido para string)
        cell = sheet.find(str(id), in_column=id_col_index)
        if not cell:
            return False # Não encontrou o ID

        # Monta a lista de valores na ordem correta dos cabeçalhos
        row_to_update = [data_dict.get(header) for header in headers]
        
        # Atualiza a linha inteira de uma vez (ex: 'A5:H5')
        range_to_update = f'A{cell.row}:{chr(65 + len(headers) - 1)}{cell.row}'
        sheet.update(range_to_update, [row_to_update])
        
        return True
    except Exception as e:
        print(f"Erro ao ATUALIZAR linha em '{sheet_name}': {e}")
        return False

def delete_row_by_id(sheet_name, id):
    """Exclui uma linha em uma aba da planilha, procurando pelo ID."""
    try:
        sheet = SPREADSHEET.worksheet(sheet_name)
        headers = sheet.row_values(1)
        
        # Encontra a coluna que se chama 'id'
        id_col_index = headers.index('id') + 1
        
        # Encontra a célula que contém o ID
        cell = sheet.find(str(id), in_column=id_col_index)
        if not cell:
            return False # Não encontrou o ID

        # Exclui a linha inteira
        sheet.delete_rows(cell.row)
        return True
    except Exception as e:
        print(f"Erro ao EXCLUIR linha em '{sheet_name}': {e}")
        return False
    
# Em api/database.py

def get_record_by_id(sheet_name, id):
    """Busca um único registro pelo ID."""
    try:
        sheet = SPREADSHEET.worksheet(sheet_name)
        headers = sheet.row_values(1)
        
        # Encontra a coluna que se chama 'id'
        id_col_index = headers.index('id') + 1
        
        # Encontra a célula que contém o ID (convertido para string)
        cell = sheet.find(str(id), in_column=id_col_index)
        if not cell:
            return None # Não encontrou

        # Pega todos os valores da linha
        values = sheet.row_values(cell.row)
        
        # Constrói o dicionário (ex: {'id': '1', 'nomeCompleto': 'Mikael Sena'})
        record = dict(zip(headers, values))
        return record
    except Exception as e:
        print(f"Erro ao buscar registro por ID em '{sheet_name}': {e}")
        return None