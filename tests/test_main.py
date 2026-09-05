import os
import sys
from pathlib import Path

os.environ.setdefault("GROQ_API_KEY", "gsk_dummy_key_for_ci_testing_1234567890")

from fastapi.testclient import TestClient


# Resolve root workspace and backend directories
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

# Ensure backend directory is first in sys.path so 'app' imports resolve correctly
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(1, str(root_dir))

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "engine" in data
