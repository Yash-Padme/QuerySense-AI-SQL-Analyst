from langchain_core.chat_history import InMemoryChatMessageHistory

session_memory_store = {}

def get_chat_session_history(session_id: str) -> InMemoryChatMessageHistory:
    """Fetches or initializes historical chat message contexts for specific user sessions."""
    if session_id not in session_memory_store:
        session_memory_store[session_id] = InMemoryChatMessageHistory()
    return session_memory_store[session_id]