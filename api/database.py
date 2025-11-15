# /api/database.py (VERSÃO OTIMIZADA COM CACHE)

import gspread
from google.oauth2.service_account import Credentials
import os
import time # Precisamos disso para o cache

# --- CONFIGURAÇÃO DO CACHE ---
# Um dicionário simples para guardar nossos dados
_cache = {}
# Por quanto tempo (em segundos) o cache é válido
CACHE_DURATION = 60 
# -----------------------------

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
]
CREDS = Credentials.from_service_account_file('config/google_credentials.json', scopes=SCOPES)
GC = gspread.authorize(CREDS)

# --- ID da Planilha ---
SPREADSHEET_ID = "1Uir1JWYkupOYObxT8IpDOvnxxA-EVRlKLOWO-Yvncho" 
SPREADSHEET = GC.open_by_key(SPREADSHEET_ID)

def _clear_cache(sheet_name):
    """Função interna para limpar o cache de uma aba específica."""
    if sheet_name in _cache:
        del _cache[sheet_name]
    print(f"Cache limpo para '{sheet_name}'.")

def get_all_records(sheet_name):
    """Busca todos os registros (USANDO CACHE)."""
    current_time = time.time()
    
    # 1. Verifica se temos um cache válido
    if sheet_name in _cache:
        data, timestamp = _cache[sheet_name]
        if (current_time - timestamp) < CACHE_DURATION:
            print(f"Retornando dados do CACHE para '{sheet_name}'.")
            return data # Retorna os dados salvos

    # 2. Se o cache for velho ou não existir, busca no Google
    print(f"Buscando dados REAIS (sem cache) para '{sheet_name}'.")
    try:
        sheet = SPREADSHEET.worksheet(sheet_name)
        data = sheet.get_all_records()
        
        # 3. Salva os novos dados e a hora no cache
        _cache[sheet_name] = (data, current_time)
        return data
    except gspread.exceptions.WorksheetNotFound:
        return []

def get_record_by_id(sheet_name, id):
    """Busca um único registro (USANDO CACHE)."""
    # Esta função depende de get_all_records,
    # então ela se beneficia do cache automaticamente.
    try:
        all_records = get_all_records(sheet_name)
        for record in all_records:
            # Compara como string para evitar problemas de tipo (ex: 1 == '1')
            if str(record.get('id')) == str(id):
                return record
        return None
    except Exception as e:
        print(f"Erro ao buscar registro por ID em '{sheet_name}': {e}")
        return None

def add_row(sheet_name, data_dict):
    """Adiciona uma nova linha e LIMPA O CACHE."""
    try:
        sheet = SPREADSHEET.worksheet(sheet_name)
        headers = sheet.row_values(1)
        row_to_insert = [data_dict.get(header) for header in headers]
        sheet.append_row(row_to_insert)
        
        _clear_cache(sheet_name) # Limpa o cache antigo
        return True
    except Exception as e:
        print(f"Erro ao adicionar linha em '{sheet_name}': {e}")
        return False

def update_row_by_id(sheet_name, id, data_dict):
    """Atualiza uma linha e LIMPA O CACHE."""
    try:
        sheet = SPREADSHEET.worksheet(sheet_name)
        headers = sheet.row_values(1)
        id_col_index = headers.index('id') + 1
        cell = sheet.find(str(id), in_column=id_col_index)
        if not cell:
            return False 

        row_to_update = [data_dict.get(header) for header in headers]
        range_to_update = f'A{cell.row}:{chr(65 + len(headers) - 1)}{cell.row}'
        sheet.update(range_to_update, [row_to_update])
        
        _clear_cache(sheet_name) # Limpa o cache antigo
        return True
    except Exception as e:
        print(f"Erro ao ATUALIZAR linha em '{sheet_name}': {e}")
        return False

def delete_row_by_id(sheet_name, id):
    """Exclui uma linha e LIMPA O CACHE."""
    try:
        sheet = SPREADSHEET.worksheet(sheet_name)
        headers = sheet.row_values(1)
        id_col_index = headers.index('id') + 1
        cell = sheet.find(str(id), in_column=id_col_index)
        if not cell:
            return False

        sheet.delete_rows(cell.row)
        _clear_cache(sheet_name) # Limpa o cache antigo
        return True
    except Exception as e:
        print(f"Erro ao EXCLUIR linha em '{sheet_name}': {e}")
        return False