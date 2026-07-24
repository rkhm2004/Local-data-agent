import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Your actual LangChain Brain imports!
from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage, HumanMessage
from tools.code_runner import execute_python
from memory.vector_db import get_relevant_context

load_dotenv()

app = FastAPI()

# Allow Next.js to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize the Real LLM Securely!
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.0, 
    api_key=os.getenv("GROQ_API_KEY") # <--- SECURE! Reads from .env
)
tools = [execute_python]
agent_executor = create_react_agent(llm, tools)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    async def event_generator():
        user_input = request.message
        
        # UI Telemetry Step 1
        yield f"event: processing\ndata: 🔍 Searching Episodic Memory for context...\n\n"
        context = get_relevant_context(user_input)
        
        # UI Telemetry Step 2
        if context not in ["No prior preferences saved.", "No relevant preferences found."]:
            yield f"event: processing\ndata: 🧠 Memory Recalled: {context}\n\n"
            
        yield f"event: processing\ndata: ⚡ Activating Llama 3 Agent with Python capabilities...\n\n"
        
        # Build the Agent's Prompt
        system_prompt = SystemMessage(content=f"""You are an autonomous Data Science Co-Pilot.
        You have access to a local Python environment via the 'execute_python' tool.
        Whenever the user asks you to process data, calculate math, or manipulate files, 
        you MUST write Python code and execute it using your tool. 
        Assume all raw datasets are located in the './data/' folder.
        
        CRITICAL USER PREFERENCES:
        {context}
        
        You must strictly follow the preferences above when writing code or formatting data.""")
        
        messages_to_send = [system_prompt, HumanMessage(content=user_input)]

        # Let the agent think and use tools (runs in a separate thread so it doesn't crash the server)
        yield f"event: processing\ndata: ⚙️ Agent is thinking and executing code (this may take a moment)...\n\n"
        response = await asyncio.to_thread(agent_executor.invoke, {"messages": messages_to_send})
        
        # Extract the final answer from the agent
        final_output = response["messages"][-1].content
        
        # Stream the actual response back to the UI smoothly!
        words = final_output.split(" ")
        for word in words:
            # We add the space back and format newlines so the UI parser reads it perfectly
            safe_word = (word + " ").replace("\n", "\\n")
            yield f"event: llm_chunk\ndata: {safe_word}\n\n"
            await asyncio.sleep(0.03) # Smooth typing effect
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")