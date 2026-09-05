from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from app.agent.analyst import analyst_agent_runtime
from app.database.schema_viewer import get_interactive_schema
from app.database.chat_history_db import (
    save_chat_turn,
    get_user_chat_history,
    delete_user_chat_session
)

# app/api/endpoints.py (or wherever router endpoints are defined)
from fastapi import APIRouter, HTTPException
from app.agent.insights_generator import generate_dynamic_bi_insights

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_email: Optional[str] = "guest"

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def process_analyst_chat(payload: ChatRequest):
    """Dispatches user prompt request strings into the active memory-managed agent pipeline layer and saves history user-wise."""
    try:
        config = {"configurable": {"session_id": payload.session_id}}
        result = analyst_agent_runtime.invoke(
            {"input": payload.message}, 
            config=config
        )
        response_text = result["output"]
        
        # Persist conversation turn user-wise in database
        email = payload.user_email if payload.user_email else "guest"
        save_chat_turn(payload.session_id, email, payload.message, response_text)
        
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/schema")
def fetch_database_schema_tree():
    """Exposes structured schemas containing exact table data attributes to generate sidebars or interactive view trees."""
    try:
        return get_interactive_schema()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read metadata map: {str(e)}")

@router.get("/history")
def fetch_user_chat_history(user_email: str = Query(..., description="Email of the logged in user")):
    """Fetches user-wise historical chat sessions and messages stored in the database."""
    try:
        return get_user_chat_history(user_email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not retrieve user chat history: {str(e)}")

@router.delete("/history/{session_id}")
def remove_user_chat_session(session_id: str, user_email: str = Query(..., description="Email of the logged in user")):
    """Deletes a chat session for a user."""
    try:
        delete_user_chat_session(session_id, user_email)
        return {"status": "success", "message": f"Session {session_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not delete session: {str(e)}")



# Add to your existing router:
# @router.get("/insights")
# def get_ai_powered_insights():
#     """Dynamically creates and executes context-aware BI metrics on the active schema."""
#     try:
#         insights = generate_dynamic_bi_insights()
#         return insights
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"AI Insights failed: {str(e)}")

@router.get("/insights")
def get_ai_powered_insights():
    try:
        return generate_dynamic_bi_insights()
    except Exception as e:
        print(f"🔥 INSIGHTS ERROR: {str(e)}")  # Terminal me exact log dikhega
        raise HTTPException(status_code=500, detail=str(e))