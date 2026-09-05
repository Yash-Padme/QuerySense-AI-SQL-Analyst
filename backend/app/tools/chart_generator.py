import json
from langchain_core.tools import tool

@tool
def suggest_chart_json(query_result: str) -> str:
    """Generates a chart specification JSON based on the provided query result."""
    spec = {
        "should_render_chart": True,
        "explanation": "The following chart is generated based on the query result.",
        "type": "bar"
    }
    return json.dumps(spec)

generate_chart = suggest_chart_json