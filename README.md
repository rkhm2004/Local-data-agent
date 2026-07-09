# Autonomous Data Science Co-Pilot 🧠🤖

An autonomous AI agent built to act as a Data Science consultant and engineer. It takes natural language requests, writes Python code (like Pandas and Matplotlib), executes that code locally on the machine, and remembers user preferences across sessions.

## 🏗️ Architecture (Phase 3)
* **The Brain:** Llama 3 (`llama-3.3-70b-versatilet`) powered by Groq for hyper-fast inference.
* **The Engine:** LangGraph, handling the ReAct (Reason + Act) loop and tool calling.
* **The Hands:** A custom `execute_python` tool that runs code safely in the local environment.
* **The Memory:** ChromaDB acting as the Hippocampus, storing and retrieving "Episodic Memory" (user preferences) via vector embeddings.

---

## 🔄 The ReAct Logging Loop (How it Thinks)

This project does not just send a prompt and wait for a response. It uses a **ReAct (Reason + Act)** architecture via LangGraph. 

When a user submits a prompt, the agent enters a continuous reasoning loop:
1. **Memory Retrieval:** It queries ChromaDB to inject any relevant historical preferences into its system prompt.
2. **Thought:** The LLM reasons about the user's request and decides it needs to write code to solve it.
3. **Action:** It triggers the `execute_python` tool, generating a specific Python script (e.g., data cleaning, plotting).
4. **Observation:** The local machine runs the code and feeds the terminal output (or error traceback) *back* to the LLM.
5. **Self-Healing (Optional):** If the execution threw an error, the LLM reads the traceback, rewrites the code, and loops back to Step 3.
6. **Final Answer:** Once the tool confirms successful execution, the LLM summarizes the action for the user.

**Example Terminal Log:**
```text
You: Preprocess sample.csv and fill missing values with the mean.

Searching Memory...
[Recalled Preferences: Always format numerical outputs to 2 decimal places.]

Thinking and Executing...
> Agent enters ReAct loop...
> Calling Tool: 'execute_python'
> Observation: Code executed successfully. clean_sample.csv saved.

Final Answer: The dataset has been preprocessed. Missing values were filled with the mean, and the clean data is saved in the './data/' folder.
```
## For this local data agent frontend need to be build..
