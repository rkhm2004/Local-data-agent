import os
from dotenv import load_dotenv
# Notice we are importing Groq now, not Google!
from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from tools.code_runner import execute_python
from memory.vector_db import save_preference, get_relevant_context

load_dotenv()

# --- THE NEW BRAIN ---
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.0, 
    api_key="API_KEY" # <--- Paste your gsk_... key inside these quotes!
)

tools = [execute_python]
agent_executor = create_react_agent(llm, tools)
chat_history = []

print("==================================================")
print("Data Science Co-Pilot Phase 3: Memory Activated (Llama 3)")
print("Commands:")
print("  /remember [text] : Save a preference to memory")
print("  exit             : Shut down")
print("==================================================")

while True:
    user_input = input("\nYou: ")
    
    if user_input.lower() in ['exit', 'quit']:
        print("Shutting down...")
        break
        
    if user_input.lower().startswith("/remember "):
        preference = user_input[10:] 
        save_preference(preference)
        print(f"\n[Memory Saved: '{preference}']")
        continue 
        
    print("\nSearching Memory...")
    context = get_relevant_context(user_input)
    if context not in ["No prior preferences saved.", "No relevant preferences found."]:
        print(f"[Recalled Preferences:\n- {context}]")
        
    print("Thinking and Executing...")
    
    system_prompt = SystemMessage(content=f"""You are an autonomous Data Science Co-Pilot.
    You have access to a local Python environment via the 'execute_python' tool.
    Whenever the user asks you to process data, calculate math, or manipulate files, 
    you MUST write Python code and execute it using your tool. 
    Assume all raw datasets are located in the './data/' folder.
    
    CRITICAL USER PREFERENCES:
    {context}
    
    You must strictly follow the preferences above when writing code or formatting data.""")
    
    messages_to_send = [system_prompt] + chat_history + [HumanMessage(content=user_input)]
    
    response = agent_executor.invoke({"messages": messages_to_send})
    
    final_output = response["messages"][-1].content
    print(f"\nFinal Answer: {final_output}")
    
    chat_history.append(HumanMessage(content=user_input))
    chat_history.append(AIMessage(content=final_output))
