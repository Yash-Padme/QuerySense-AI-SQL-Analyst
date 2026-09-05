# # app/agent/insights_generator.py
# import json
# import re
# from sqlalchemy import text
# from app.database.connection import get_db_connection
# from app.database.schema_viewer import get_interactive_schema
# from langchain_groq import ChatGroq
# from langchain_core.messages import SystemMessage, HumanMessage

# llm = ChatGroq(model_name="openai/gpt-oss-120b", temperature=0.1)

# SYSTEM_PROMPT = """You are an automated Business Intelligence (BI) Query Engine.
# Given a database schema, analyze its business purpose and generate analytical SQL queries for an interactive dashboard.

# You must return a STRICT JSON object matching this structure:
# {
#   "kpis": [
#     {"label": "Metric 1 Name", "query": "SELECT COUNT(...) AS val FROM ..."},
#     {"label": "Metric 2 Name", "query": "SELECT ... AS val FROM ..."},
#     {"label": "Metric 3 Name", "query": "SELECT ... AS val FROM ..."}
#   ],
#   "charts": [
#     {
#       "title": "Categorical Distribution Title",
#       "type": "bar",
#       "query": "SELECT category_column AS label, numeric_metric AS value FROM ... GROUP BY ... ORDER BY value DESC LIMIT 8;",
#       "xAxisKey": "label",
#       "dataKey": "value"
#     },
#     {
#       "title": "Time Trend or Status Breakdown Title",
#       "type": "area",
#       "query": "SELECT date_or_group_col AS label, numeric_or_count_metric AS value FROM ... GROUP BY ... ORDER BY label ASC LIMIT 10;",
#       "xAxisKey": "label",
#       "dataKey": "value"
#     }
#   ],
#   "summary": "2-line executive summary about the database focus."
# }

# Rules:
# 1. ONLY write valid SQLite read-only SELECT queries.
# 2. The KPI queries MUST return a single value aliased as 'val'.
# 3. The Chart queries MUST return columns aliased as 'label' and 'value'.
# 4. Do NOT wrap output in markdown tags other than standard raw JSON.
# """

# def generate_dynamic_bi_insights():
#     """Generates and executes dynamic BI insights using LLM for ANY active database schema."""
#     db = get_db_connection()
#     engine = db._engine
#     schema = get_interactive_schema()

#     # 1. Format schema as text for LLM
#     schema_lines = []
#     for table_name, cols in schema.items():
#         col_desc = ", ".join([f"{c['name']} ({c['type']})" for c in cols])
#         schema_lines.append(f"Table: {table_name} -> Columns: [{col_desc}]")
#     schema_str = "\n".join(schema_lines)

#     # 2. Invoke LLM to generate BI queries
#     prompt = f"Active Database Schema:\n{schema_str}\n\nGenerate meaningful KPI and Chart queries according to the rules."
#     response = llm.invoke([SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=prompt)])
#     content = response.content.strip()

#     # Extract JSON if wrapped in markdown
#     match = re.search(r"\{.*\}", content, re.DOTALL)
#     if match:
#         content = match.group(0)

#     try:
#         bi_spec = json.loads(content)
#     except Exception as err:
#         raise ValueError(f"Failed to parse LLM BI JSON spec: {err} | Raw: {content}")

#     # 3. Execute generated queries against active database
#     executed_kpis = []
#     executed_charts = []

#     with engine.connect() as conn:
#         # Execute KPIs
#         for kpi in bi_spec.get("kpis", []):
#             try:
#                 val = conn.execute(text(kpi["query"])).scalar()
#                 # Format numbers
#                 if isinstance(val, float):
#                     val_str = f"{val:,.2f}"
#                 elif isinstance(val, int):
#                     val_str = f"{val:,}"
#                 else:
#                     val_str = str(val or 0)
#                 executed_kpis.append({"label": kpi["label"], "value": val_str})
#             except Exception as e:
#                 executed_kpis.append({"label": kpi["label"], "value": "N/A"})

#         # Execute Charts
#         for chart in bi_spec.get("charts", []):
#             try:
#                 res = conn.execute(text(chart["query"])).mappings().all()
#                 data_points = []
#                 for row in res:
#                     data_points.append({
#                         "label": str(row.get("label", "Unknown")),
#                         "value": float(row.get("value") or 0)
#                     })
#                 executed_charts.append({
#                     "title": chart.get("title", "Metric Chart"),
#                     "type": chart.get("type", "bar"),
#                     "data": data_points
#                 })
#             except Exception as e:
#                 continue

#     return {
#         "summary": bi_spec.get("summary", "Automated Database Insights"),
#         "kpis": executed_kpis,
#         "charts": executed_charts
#     }


# app/agent/insights_generator.py
import json
import re
from sqlalchemy import text
from app.database.connection import get_db_connection
from app.database.schema_viewer import get_interactive_schema
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

SYSTEM_PROMPT = """You are an automated Business Intelligence (BI) Query Engine.
Given a database schema, analyze its business purpose and generate analytical SQL queries for an interactive dashboard.

You must return a STRICT JSON object matching this structure:
{
  "kpis": [
    {"label": "Metric 1 Name", "query": "SELECT COUNT(...) AS val FROM ..."},
    {"label": "Metric 2 Name", "query": "SELECT ... AS val FROM ..."},
    {"label": "Metric 3 Name", "query": "SELECT ... AS val FROM ..."}
  ],
  "charts": [
    {
      "title": "Categorical Distribution Title",
      "type": "bar",
      "query": "SELECT category_column AS label, numeric_metric AS value FROM ... GROUP BY ... ORDER BY value DESC LIMIT 8;",
      "xAxisKey": "label",
      "dataKey": "value"
    },
    {
      "title": "Time Trend or Status Breakdown Title",
      "type": "area",
      "query": "SELECT date_or_group_col AS label, numeric_or_count_metric AS value FROM ... GROUP BY ... ORDER BY label ASC LIMIT 10;",
      "xAxisKey": "label",
      "dataKey": "value"
    }
  ],
  "summary": "2-line executive summary about the database focus."
}

Rules:
1. ONLY write valid SQLite read-only SELECT queries.
2. The KPI queries MUST return a single value aliased as 'val'.
3. The Chart queries MUST return columns aliased as 'label' and 'value'.
4. Do NOT wrap output in markdown tags other than standard raw JSON.
"""

def generate_dynamic_bi_insights():
    db = get_db_connection()
    engine = db._engine
    raw_schema = get_interactive_schema()

    # ✅ Fix: Support both old dict and new { "tables": ..., "relationships": ... } format
    tables_dict = raw_schema.get("tables", raw_schema) if isinstance(raw_schema, dict) else {}

    # Format schema string safely
    schema_lines = []
    for table_name, cols in tables_dict.items():
        if isinstance(cols, list):
            col_desc = ", ".join([f"{c.get('name', 'col')} ({c.get('type', 'TEXT')})" for c in cols if isinstance(c, dict)])
            schema_lines.append(f"Table: {table_name} -> Columns: [{col_desc}]")

    schema_str = "\n".join(schema_lines)

    if not schema_str.strip():
        return {
            "summary": "No tables detected in the active database.",
            "kpis": [],
            "charts": []
        }

    # Initialize LLM with system prompt
    llm = ChatGroq(model_name="openai/gpt-oss-120b", temperature=0.1)
    
    prompt = f"Active Database Schema:\n{schema_str}\n\nGenerate meaningful KPI and Chart queries according to the rules."
    
    response = llm.invoke([SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=prompt)])
    content = response.content.strip()

    # Clean Markdown wrapping
    match = re.search(r"\{.*\}", content, re.DOTALL)
    if match:
        content = match.group(0)

    try:
        bi_spec = json.loads(content)
    except Exception as err:
        raise ValueError(f"Failed to parse LLM JSON: {err} | Raw output: {content}")

    # Execute generated SQL queries safely
    executed_kpis = []
    executed_charts = []

    with engine.connect() as conn:
        # Execute KPIs
        for kpi in bi_spec.get("kpis", []):
            try:
                val = conn.execute(text(kpi["query"])).scalar()
                if isinstance(val, float):
                    val_str = f"{val:,.2f}"
                elif isinstance(val, int):
                    val_str = f"{val:,}"
                else:
                    val_str = str(val or 0)
                executed_kpis.append({"label": kpi["label"], "value": val_str})
            except Exception:
                executed_kpis.append({"label": kpi["label"], "value": "N/A"})

        # Execute Charts
        for chart in bi_spec.get("charts", []):
            try:
                res = conn.execute(text(chart["query"])).mappings().all()
                data_points = []
                for row in res:
                    data_points.append({
                        "label": str(row.get("label", "Unknown")),
                        "value": float(row.get("value") or 0)
                    })
                if data_points:
                    executed_charts.append({
                        "title": chart.get("title", "Metric Chart"),
                        "type": chart.get("type", "bar"),
                        "data": data_points
                    })
            except Exception:
                continue

    return {
        "summary": bi_spec.get("summary", "Automated Database Insights"),
        "kpis": executed_kpis,
        "charts": executed_charts
    }