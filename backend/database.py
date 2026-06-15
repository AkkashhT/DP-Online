import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'documents.db')


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS documents (
            id          TEXT PRIMARY KEY,
            filename    TEXT NOT NULL,
            file_path   TEXT NOT NULL,
            file_ext    TEXT NOT NULL,
            file_size   INTEGER DEFAULT 0,
            uploaded_at TEXT NOT NULL,
            word_count  INTEGER DEFAULT 0,
            table_count INTEGER DEFAULT 0,
            image_count INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS extractions (
            doc_id      TEXT PRIMARY KEY,
            text        TEXT,
            tables_json TEXT,
            doc_content TEXT,
            FOREIGN KEY (doc_id) REFERENCES documents(id)
        );
        CREATE TABLE IF NOT EXISTS images (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id      TEXT NOT NULL,
            image_index INTEGER NOT NULL,
            filename    TEXT NOT NULL,
            page_number INTEGER DEFAULT 1,
            file_path   TEXT NOT NULL,
            FOREIGN KEY (doc_id) REFERENCES documents(id)
        );
        CREATE TABLE IF NOT EXISTS chat_history (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id      TEXT NOT NULL,
            role        TEXT NOT NULL,
            content     TEXT NOT NULL,
            created_at  TEXT NOT NULL,
            FOREIGN KEY (doc_id) REFERENCES documents(id)
        );
    ''')
    conn.commit()
    conn.close()
    print("Database initialised at", DB_PATH)


def save_document(doc_id, filename, file_path, file_ext, file_size=0):
    conn = get_connection()
    conn.execute('''
        INSERT OR REPLACE INTO documents
            (id, filename, file_path, file_ext, file_size, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (doc_id, filename, file_path, file_ext, file_size,
          datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()


def update_document_counts(doc_id, word_count, table_count, image_count):
    conn = get_connection()
    conn.execute('UPDATE documents SET word_count=?, table_count=?, image_count=? WHERE id=?',
                 (word_count, table_count, image_count, doc_id))
    conn.commit()
    conn.close()


def get_all_documents():
    conn = get_connection()
    rows = conn.execute('SELECT * FROM documents ORDER BY uploaded_at DESC').fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_document(doc_id):
    conn = get_connection()
    row = conn.execute('SELECT * FROM documents WHERE id=?', (doc_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def delete_document(doc_id):
    conn = get_connection()
    conn.execute('DELETE FROM chat_history WHERE doc_id=?', (doc_id,))
    conn.execute('DELETE FROM images WHERE doc_id=?', (doc_id,))
    conn.execute('DELETE FROM extractions WHERE doc_id=?', (doc_id,))
    conn.execute('DELETE FROM documents WHERE id=?', (doc_id,))
    conn.commit()
    conn.close()


def save_extraction(doc_id, text, tables, doc_content):
    conn = get_connection()
    conn.execute('''
        INSERT OR REPLACE INTO extractions (doc_id, text, tables_json, doc_content)
        VALUES (?, ?, ?, ?)
    ''', (doc_id, text, json.dumps(tables, ensure_ascii=False), doc_content))
    conn.commit()
    conn.close()


def update_extraction_text(doc_id, text):
    word_count = len(text.split()) if text else 0
    conn = get_connection()
    conn.execute('UPDATE extractions SET text=? WHERE doc_id=?', (text, doc_id))
    conn.execute('UPDATE documents SET word_count=? WHERE id=?', (word_count, doc_id))
    conn.commit()
    conn.close()
    return word_count


def update_extraction_tables(doc_id, tables):
    conn = get_connection()
    conn.execute('UPDATE extractions SET tables_json=? WHERE doc_id=?',
                 (json.dumps(tables, ensure_ascii=False), doc_id))
    conn.execute('UPDATE documents SET table_count=? WHERE id=?', (len(tables), doc_id))
    conn.commit()
    conn.close()


def get_extraction(doc_id):
    conn = get_connection()
    row = conn.execute('SELECT * FROM extractions WHERE doc_id=?', (doc_id,)).fetchone()
    conn.close()
    if not row:
        return None
    r = dict(row)
    r['tables'] = json.loads(r['tables_json'] or '[]')
    return r


def save_image(doc_id, image_index, filename, page_number, file_path):
    conn = get_connection()
    conn.execute('''
        INSERT INTO images (doc_id, image_index, filename, page_number, file_path)
        VALUES (?, ?, ?, ?, ?)
    ''', (doc_id, image_index, filename, page_number, file_path))
    conn.commit()
    conn.close()


def get_images(doc_id):
    conn = get_connection()
    rows = conn.execute('SELECT * FROM images WHERE doc_id=? ORDER BY image_index',
                        (doc_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def save_chat_message(doc_id, role, content):
    conn = get_connection()
    conn.execute('INSERT INTO chat_history (doc_id, role, content, created_at) VALUES (?, ?, ?, ?)',
                 (doc_id, role, content, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()


def get_chat_history(doc_id):
    conn = get_connection()
    rows = conn.execute('SELECT role, content, created_at FROM chat_history WHERE doc_id=? ORDER BY id ASC',
                        (doc_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def clear_chat_history(doc_id):
    conn = get_connection()
    conn.execute('DELETE FROM chat_history WHERE doc_id=?', (doc_id,))
    conn.commit()
    conn.close()
