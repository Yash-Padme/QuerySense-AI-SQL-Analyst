import os
import sqlite3
from datetime import datetime
from pathlib import Path

def get_db_path() -> Path:
    db_url = os.getenv("DATABASE_URL", "")
    if db_url.startswith("sqlite:///"):
        return Path(db_url[10:])  # sqlite:/// is 10 characters
    
    current_dir = Path(__file__).resolve()
    base_dir = current_dir.parents[2]
    if (base_dir / "data" / "company.db").exists():
        return base_dir / "data" / "company.db"
    elif (base_dir.parent / "data" / "company.db").exists():
        return base_dir.parent / "data" / "company.db"
    return base_dir / "data" / "company.db"


def init_history_tables():
    """Initializes user_chat_sessions and chat_messages database tables."""
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS user_chat_sessions (
        session_id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES user_chat_sessions (session_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_user_sessions ON user_chat_sessions(user_email);
    CREATE INDEX IF NOT EXISTS idx_session_messages ON chat_messages(session_id);
    """)
    conn.commit()
    conn.close()

def save_chat_turn(session_id: str, user_email: str, user_message: str, assistant_response: str):
    """Saves user message and assistant response to SQLite database associated with user_email."""
    init_history_tables()
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    # 1. Ensure user session exists or create it
    cursor.execute("SELECT title FROM user_chat_sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    
    if not row:
        title = user_message[:45] + ("..." if len(user_message) > 45 else "")
        cursor.execute(
            "INSERT INTO user_chat_sessions (session_id, user_email, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (session_id, user_email, title, now, now)
        )
    else:
        cursor.execute(
            "UPDATE user_chat_sessions SET updated_at = ? WHERE session_id = ?",
            (now, session_id)
        )
        
    # 2. Insert user message and assistant message
    cursor.execute(
        "INSERT INTO chat_messages (session_id, sender, content, timestamp) VALUES (?, ?, ?, ?)",
        (session_id, "user", user_message, now)
    )
    cursor.execute(
        "INSERT INTO chat_messages (session_id, sender, content, timestamp) VALUES (?, ?, ?, ?)",
        (session_id, "assistant", assistant_response, now)
    )
    
    conn.commit()
    conn.close()

def get_user_chat_history(user_email: str):
    """Retrieves all chat sessions and messages for a specific user_email."""
    init_history_tables()
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT session_id, title, created_at, updated_at FROM user_chat_sessions WHERE user_email = ? ORDER BY updated_at DESC",
        (user_email,)
    )
    sessions = cursor.fetchall()
    
    result = []
    for sess in sessions:
        sess_id, title, created_at, updated_at = sess
        cursor.execute(
            "SELECT id, sender, content, timestamp FROM chat_messages WHERE session_id = ? ORDER BY id ASC",
            (sess_id,)
        )
        msg_rows = cursor.fetchall()
        messages = [
            {
                "id": str(msg_id),
                "sender": sender,
                "content": content,
                "timestamp": timestamp
            }
            for msg_id, sender, content, timestamp in msg_rows
        ]
        result.append({
            "session_id": sess_id,
            "title": title,
            "created_at": created_at,
            "updated_at": updated_at,
            "messages": messages
        })
        
    conn.close()
    return result

def delete_user_chat_session(session_id: str, user_email: str):
    """Deletes a chat session for a user."""
    init_history_tables()
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_chat_sessions WHERE session_id = ? AND user_email = ?", (session_id, user_email))
    cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()
