import sqlite3

DATABASE_PATH = 'database.db'
SCRIPT_PATH = 'db_schema.sql'

def touch_database():
    with open(SCRIPT_PATH, 'r') as sql_file:
        sql_script = sql_file.read()

    conn = setup_connection()
    cursor = conn.cursor()
    cursor.executescript(sql_script)
    conn.commit()
    close_connection(conn)

def setup_connection():
    return sqlite3.connect(DATABASE_PATH)

def close_connection(conn):
    conn.close()

def check_if_exists(table_name, column_name, sanitised_value):
    conn = setup_connection()
    cursor = conn.cursor()

    task = (sanitised_value,)
    cursor.execute(f'SELECT * FROM {table_name} WHERE {column_name}=?', task)

    row = cursor.fetchone()
    close_connection(conn)

    if row is None:
        return False
    else:
        return True
    