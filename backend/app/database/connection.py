import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_community.utilities import SQLDatabase

# Load environment variables
load_dotenv()

# Resilient database path lookup for both monorepo and standalone deployments
current_dir = Path(__file__).resolve()
base_dir = current_dir.parents[2]  # This is the root of the backend folder

if (base_dir / "data" / "company.db").exists():
    default_db_path = base_dir / "data" / "company.db"
elif (base_dir.parent / "data" / "company.db").exists():
    default_db_path = base_dir.parent / "data" / "company.db"
else:
    default_db_path = base_dir / "data" / "company.db"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{default_db_path.as_posix()}")

def get_db_connection() -> SQLDatabase:
    return SQLDatabase.from_uri(DATABASE_URL)