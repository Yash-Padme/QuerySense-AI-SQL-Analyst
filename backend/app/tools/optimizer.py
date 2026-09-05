import re
from langchain_core.tools import tool
from app.database.connection import get_db_connection

@tool
def analyze_query_performance(sql_query: str) -> str:
    """
    Pass a SELECT SQL statement into this tool to run EXPLAIN QUERY PLAN 
    and evaluate potential indexing optimizations.
    """
    db = get_db_connection()
    clean_query = sql_query.strip().strip("`").replace(";", "")
    
    # Check if query is read-only
    if not re.match(r"^\s*SELECT", clean_query, re.IGNORECASE):
        return "Error: Performance analyzer can only verify read-only SELECT statements."
        
    try:
        explain_query = f"EXPLAIN QUERY PLAN {clean_query}"
        raw_plan = db.run(explain_query)
        
        advice = f"Raw Plan Analysis:\n{raw_plan}\n\nOptimization Tip: "
        if "SCAN TABLE" in raw_plan:
            advice += "Detected an unindexed sequential table scan. Consider setting up a targeted INDEX."
        else:
            advice += "Query plan appears well-covered by existing database table indices."
        return advice
    except Exception as e:
        return f"Failed to execute performance validation plan: {str(e)}"