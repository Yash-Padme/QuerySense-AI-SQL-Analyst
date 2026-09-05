from sqlalchemy import inspect
from app.database.connection import get_db_connection

def get_interactive_schema():
    """
    Dynamically inspects the connected database to extract:
    - Business tables (ignoring internal system & chat tables)
    - Column details (names, types, nullable, primary key flags)
    - Foreign key constraints (source table, source column, target table, target column)
    """
    db = get_db_connection()
    inspector = inspect(db._engine)
    
    # Exclude internal/system tables
    all_tables = inspector.get_table_names()
    excluded_tables = {"sqlite_sequence", "chat_messages", "user_chat_sessions"}
    app_tables = [t for t in all_tables if t not in excluded_tables and not t.startswith("sqlite_")]

    schema_tables = {}
    relationships = []

    for table_name in app_tables:
        # 1. Fetch Primary Keys
        pk_constraint = inspector.get_pk_constraint(table_name)
        primary_keys = set(pk_constraint.get("constrained_columns", []))

        # 2. Fetch Columns with precise metadata
        columns_info = []
        for col in inspector.get_columns(table_name):
            col_name = col["name"]
            columns_info.append({
                "name": col_name,
                "type": str(col["type"]),
                "is_pk": col_name in primary_keys or col_name == "id",
                "nullable": col.get("nullable", True)
            })
        schema_tables[table_name] = columns_info

        # 3. Fetch exact Foreign Key relationships
        for fk in inspector.get_foreign_keys(table_name):
            target_table = fk.get("referred_table")
            if target_table in app_tables:
                constrained_cols = fk.get("constrained_columns", [])
                referred_cols = fk.get("referred_columns", [])
                relationships.append({
                    "id": f"fk_{table_name}_{target_table}_{constrained_cols[0] if constrained_cols else 'col'}",
                    "source": table_name,
                    "target": target_table,
                    "source_col": constrained_cols[0] if constrained_cols else None,
                    "target_col": referred_cols[0] if referred_cols else None,
                })

    return {
        "tables": schema_tables,
        "relationships": relationships
    }

get_schema_data = get_interactive_schema

# from sqlalchemy import inspect
# from app.database.connection import get_db_connection

# def get_interactive_schema():
#     db = get_db_connection()
#     inspector = inspect(db._engine)
#     schema_data = {}
#     for table_name in inspector.get_table_names():
#         columns = inspector.get_columns(table_name)
#         schema_data[table_name] = [
#             {"name": col["name"], "type": str(col["type"])} 
#             for col in columns
#         ]
#     return schema_data

# get_schema_data = get_interactive_schema





