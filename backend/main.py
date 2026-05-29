from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import json
import os
from dotenv import load_dotenv

# Prioritize loading .env.local from both the backend directory and the project root
load_dotenv(".env.local")
load_dotenv("../.env.local")
load_dotenv()
app = FastAPI(title="Diagram Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL_NAME = "llama-3.3-70b-versatile"

client = Groq(api_key=GROQ_API_KEY)

class DiagramRequest(BaseModel):
    text: str
    diagram_type: str = "flowchart"

class DiagramNode(BaseModel):
    id: str
    label: str
    type: str
    x: int
    y: int
    width: int
    height: int

class DiagramEdge(BaseModel):
    source: str
    target: str
    relationship: str = ""

class DiagramResponse(BaseModel):
    nodes: list
    edges: list
    diagram_type: str
    description: str

@app.on_event("startup")
async def startup_event():
    """Initialize Gemini API on startup"""
    pass

@app.post("/api/generate-diagram", response_model=DiagramResponse)
async def generate_diagram(request: DiagramRequest):
    """
    Generate diagram from natural language description using Gemini AI
    """
    try:
        diagram_instructions = ""
        if request.diagram_type == "flowchart":
            diagram_instructions = "- Node types: start, end, process, decision, data\n- Shape meanings: start/end (pill), process (rectangle), decision (diamond), data (parallelogram/cylinder)"
        elif request.diagram_type == "class" or request.diagram_type == "uml":
            diagram_instructions = "- Node types: class, interface, enum\n- Use larger height (e.g., 150-200) to fit attributes/methods in labels if needed\n- Relationships: inheritance, composition, aggregation, association"
        elif request.diagram_type == "component":
            diagram_instructions = """- Node types: component, interface, database, service
- **Strict Layered Architecture Layout:**
  - Layer 1 (Top, y=100): Frontend/UI Nodes (e.g., Web App, Mobile App).
  - Layer 2 (Middle, y=250 and y=400): API Gateway, Core Services (Auth, User, Billing, etc.).
  - Layer 3 (Bottom, y=550): Data Layer / Database nodes.
- **Clean Connections & Modular Routing (CRITICAL RULES - DO NOT VIOLATE):**
  - NEVER use the relationship name "flows to". Use specific terms like "calls API", "reads/writes", "uses", "authenticates".
  - DO NOT connect everything to everything. Keep edges to an absolute minimum for a clean, non-cluttered look.
  - Authentication must NOT connect directly to all services. It should only connect to an API Gateway or the Frontend.
  - UI/Frontend components should only connect to an API Gateway or a main Application Service, NEVER directly to the database.
  - ONLY specific backend services connect to the Database.
  - Aim for a hierarchical, tree-like structure rather than a web."""
        elif request.diagram_type == "entity_relationship":
            diagram_instructions = "- Node types: entity, weak_entity, attribute, relationship\n- Relationships: 1:1, 1:N, M:N\n- Entity (rectangle), attribute (ellipse), relationship (diamond)"
        elif request.diagram_type == "sequence":
            diagram_instructions = "- Node types: actor, lifeline, activation\n- Position lifelines linearly on the x-axis, and stack messages sequentially down the y-axis\n- Edges represent messages passed between lifelines"
        else:
            human_readable_type = request.diagram_type.replace('_', ' ').title()
            diagram_instructions = f"- Node types: appropriate for {human_readable_type} diagram\n- Use realistic node types, shapes, and relationships relevant to standard UML {human_readable_type} specification."

        prompt = f"""
You are a diagram generation expert. Convert the following description into a diagram structure.
Make sure to deeply analyze the requested topic. If the topic is a specific system (e.g., "Hospital Management System"), make sure to include the relevant realistic entities, components, or classes for that system.

Description: {request.text}
Diagram Type: {request.diagram_type}

You must return a valid JSON object matching this schema:
{{
  "nodes": [
    {{"id": "node1", "label": "Start", "type": "start", "x": 100, "y": 100, "width": 120, "height": 80}},
    {{"id": "node2", "label": "Process", "type": "process", "x": 300, "y": 100, "width": 120, "height": 80}}
  ],
  "edges": [
    {{"source": "node1", "target": "node2", "relationship": "flows to"}}
  ]
}}

Rules:
- Create comprehensive nodes based on the description (between 4 to 12 nodes)
- Spread nodes out so they don't overlap. x values: 100, 300, 500, 700; y values: 100, 250, 400, 550
{diagram_instructions}
- Make labels clear and concise (can be longer for UML classes)
- All IDs must be unique (node1, node2, node3, etc)
- Default Width: 160, Default Height: 80 (adjustable based on node type)
"""
        
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        response_text = response.choices[0].message.content.strip()
        
        parsed = json.loads(response_text)
        
        return DiagramResponse(
            nodes=parsed.get("nodes", []),
            edges=parsed.get("edges", []),
            diagram_type=request.diagram_type,
            description=request.text
        )
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating diagram: {str(e)}")

@app.post("/api/enhance-diagram")
async def enhance_diagram(diagram: dict):
    """
    Get AI suggestions for diagram improvements
    """
    try:
        prompt = f"""
You are a diagram design expert. Suggest improvements to this diagram.
Current diagram: {json.dumps(diagram)}
Provide 2-3 specific suggestions for better layout or clarity.
"""
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=MODEL_NAME
        )
        return {"suggestions": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enhancing diagram: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "model": MODEL_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
