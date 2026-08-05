import sqlite3

def cleanup_tmp_tables():
    conn = sqlite3.connect('degreeblind.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '_alembic_tmp_%'")
    tables = cursor.fetchall()
    for (table_name,) in tables:
        print(f"Dropping {table_name}")
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
    conn.commit()
    conn.close()

if __name__ == '__main__':
    cleanup_tmp_tables()
