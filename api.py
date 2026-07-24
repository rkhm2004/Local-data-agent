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

class MessageDict(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[MessageDict] = []

class CodeExecuteRequest(BaseModel):
    code: str

# NEW ENDPOINT: Allows the UI to run code directly from the left panel!
@app.post("/api/execute")
async def execute_code_direct(request: CodeExecuteRequest):
    try:
        output = execute_python(request.code)
        return {"status": "success", "output": output}
    except Exception as e:
        return {"status": "error", "output": str(e)}

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    async def event_generator():
        user_input = request.message
        context = get_relevant_context(user_input)
        
        # We instruct the LLM to explicitly output its code in markdown blocks so the UI can grab it
        system_prompt = SystemMessage(content=f"""You are an autonomous Data Science Co-Pilot.
        You have access to a local Python environment via the 'execute_python' tool.
        
        CRITICAL INSTRUCTION: Whenever you write or run Python code, you MUST include the exact code in your final response to the user, wrapped in standard markdown blocks like this:
        ```python
        # code goes here
        ```
        This allows the user's interface to extract and display the artifact.
        
        Assume all raw datasets are located in the './data/' folder.
        
        CRITICAL USER PREFERENCES:
        {context}""")
        
        messages_to_send = [system_prompt]
        for msg in request.history:
            if msg.role == 'user':
                messages_to_send.append(HumanMessage(content=msg.content))
            elif msg.role == 'ai':
                messages_to_send.append(AIMessage(content=msg.content))
                
        messages_to_send.append(HumanMessage(content=user_input))

        response = await asyncio.to_thread(agent_executor.invoke, {"messages": messages_to_send})
        final_output = response["messages"][-1].content
        
        words = final_output.split(" ")
        for word in words:
            safe_word = (word + " ").replace("\n", "\\n")
            yield f"event: llm_chunk\ndata: {safe_word}\n\n"
            await asyncio.sleep(0.02) 
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")