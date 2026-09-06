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

# DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{default_db_path.as_posix()}")

# def get_db_connection() -> SQLDatabase:
#     return SQLDatabase.from_uri(DATABASE_URL)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///data/company.db")

def get_db_connection():
    # SQLite URL hone par ensure karein ki directory exist karti hai
    if DATABASE_URL.startswith("sqlite:///"):
        # sqlite:/// or sqlite://// handling
        db_file_path = DATABASE_URL.replace("sqlite:////", "/").replace("sqlite:///", "")
        db_path = Path(db_file_path).resolve()
        
        # Parent directory (jaise /opt/render/project/src/data) create karein
        db_path.parent.mkdir(parents=True, exist_ok=True)

    return SQLDatabase.from_uri(DATABASE_URL)
