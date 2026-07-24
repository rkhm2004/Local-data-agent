import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from tools.code_runner import execute_python
from memory.vector_db import get_relevant_context

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.0, 
    api_key=os.getenv("GROQ_API_KEY") 
)
tools = [execute_python]
agent_executor = create_react_agent(llm, tools)

# 1. Update Request to include Chat History
class MessageDict(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[MessageDict] = []

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    async def event_generator():
        user_input = request.message
        
        # 2. DYNAMIC TELEMETRY based on what the user actually asked
        input_lower = user_input.lower()
        if "calculate" in input_lower or "math" in input_lower or "number" in input_lower:
            yield f"event: processing\ndata: 🧮 Initializing mathematical computation matrix...\n\n"
        elif "file" in input_lower or "folder" in input_lower or "delete" in input_lower:
            yield f"event: processing\ndata: 📂 Scanning local directory and file structures...\n\n"
        elif "plot" in input_lower or "graph" in input_lower or "chart" in input_lower:
            yield f"event: processing\ndata: 📊 Loading data visualization libraries...\n\n"
        else:
            yield f"event: processing\ndata: 🧠 Analyzing semantic parameters of query...\n\n"

        yield f"event: processing\ndata: 🔍 Cross-referencing Episodic Memory...\n\n"
        context = get_relevant_context(user_input)
        if context not in ["No prior preferences saved.", "No relevant preferences found."]:
            yield f"event: processing\ndata: 💾 Memory Recalled: Applying user preferences...\n\n"
            
        yield f"event: processing\ndata: ⚡ Routing request to execution agent...\n\n"
        
        system_prompt = SystemMessage(content=f"""You are an autonomous Data Science Co-Pilot.
        You have access to a local Python environment via the 'execute_python' tool.
        Whenever the user asks you to process data, calculate math, or manipulate files, 
        you MUST write Python code and execute it using your tool. 
        Assume all raw datasets are located in the './data/' folder.
        
        CRITICAL USER PREFERENCES:
        {context}""")
        
        # 3. Inject the Chat History into the Agent's brain!
        messages_to_send = [system_prompt]
        for msg in request.history:
            if msg.role == 'user':
                messages_to_send.append(HumanMessage(content=msg.content))
            elif msg.role == 'ai':
                messages_to_send.append(AIMessage(content=msg.content))
                
        messages_to_send.append(HumanMessage(content=user_input))

        yield f"event: processing\ndata: ⚙️ Agent is executing pipeline tools (standby)...\n\n"
        response = await asyncio.to_thread(agent_executor.invoke, {"messages": messages_to_send})
        
        final_output = response["messages"][-1].content
        
        words = final_output.split(" ")
        for word in words:
            safe_word = (word + " ").replace("\n", "\\n")
            yield f"event: llm_chunk\ndata: {safe_word}\n\n"
            await asyncio.sleep(0.03) 
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")