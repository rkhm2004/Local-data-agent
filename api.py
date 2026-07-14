import os
import io
import zipfile
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="Data Agent Fullstack API")

# Enable CORS for frontend cross-origin streaming requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

async def mock_agent_stream(user_message: str):
    """
    Simulates integration with your existing main.py logic.
    Streams back live preprocessing metrics followed by the LLM response.
    """
    # 1. Stream live data preprocessing phases
    yield "event: processing\ndata: 🔍 Initializing context and vector memory DB...\n\n"
    await asyncio.sleep(0.8)
    yield "event: processing\ndata: 📊 Scanning data/ directory for target datasets...\n\n"
    await asyncio.sleep(0.6)
    yield "event: processing\ndata: ⚡ Cleaning text anomalies and handling structural outliers...\n\n"
    await asyncio.sleep(1.0)
    yield "event: processing\ndata: ✅ Preprocessing complete. Evaluating with Groq LLM engine...\n\n"
    await asyncio.sleep(0.5)

    # 2. Stream the live LLM content interface response chunks
    yield "event: llm_start\ndata: \n\n"
    response_text = (
        f"I have successfully analyzed your request: '{user_message}'. "
        "The underlying datasets under data/ (including clean_data.csv and outlier.csv) "
        "have been dynamically parsed. The evaluation shows normal distribution parameters "
        "and structural integrity across all localized vectors."
    )
    for word in response_text.split(" "):
        yield f"event: llm_chunk\ndata: {word} \n\n"
        await asyncio.sleep(0.08)
        
    yield "event: end\ndata: \n\n"

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    return StreamingResponse(mock_agent_stream(request.message), media_type="text/event-stream")

@app.get("/api/download/zip")
async def download_data_zip():
    """
    Zips everything inside the data/ folder on-the-fly and serves it as a binary download stream.
    """
    data_dir = "data"
    if not os.path.exists(data_dir):
        raise HTTPException(status_code=404, detail="Data folder not found")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, _, files in os.walk(data_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Keep directory structure inside the zip clean
                arcname = os.path.relpath(file_path, os.path.dirname(data_dir))
                zip_file.write(file_path, arcname)

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers={"Content-Disposition": "attachment; filename=agent_data_payload.zip"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)