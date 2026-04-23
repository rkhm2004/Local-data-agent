from langchain_core.tools import tool
from langchain_experimental.utilities import PythonREPL

# Initialize the Python runtime environment
repl = PythonREPL()

@tool
def execute_python(code: str) -> str:
    """
    Executes Python code in a local environment.
    Use this to run pandas, numpy, or matplotlib scripts.
    Input should be a string of valid, standard Python code.
    Returns the stdout (console output) of the execution.
    """
    try:
        # Run the code provided by the LLM
        result = repl.run(code)
        
        # If the code runs but has no print statements, tell the LLM it succeeded
        if result == "":
            return "Code executed successfully with no output."
            
        return result
        
    except Exception as e:
        # If the LLM writes bad code, catch the error and send it back 
        # so the LLM can try to fix it automatically!
        return f"Failed to execute. Error: {repr(e)}"