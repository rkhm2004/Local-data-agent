import chromadb

# Initialize local ChromaDB (creates a folder named 'chroma_data' in your workspace)
chroma_client = chromadb.PersistentClient(path="./chroma_data")

# Create or load the memory collection. 
# By default, Chroma converts your text into mathematical vectors automatically.
collection = chroma_client.get_or_create_collection(name="agent_memory")

def save_preference(text: str):
    """Saves a user preference or fact to the database."""
    # Create a simple unique ID based on how many memories exist
    doc_id = f"mem_{collection.count() + 1}"
    collection.add(
        documents=[text],
        ids=[doc_id]
    )
    return True

def get_relevant_context(query: str, n_results: int = 2) -> str:
    """Searches the database for memories related to the current prompt."""
    if collection.count() == 0:
        return "No prior preferences saved."
        
    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, collection.count())
    )
    
    # Extract the retrieved documents
    documents = results['documents'][0]
    if not documents:
        return "No relevant preferences found."
        
    # Combine them into a single string for the LLM
    return "\n- ".join(documents)