# --- Unified Development Environment ---
FROM python:3.11-slim
WORKDIR /app

# 1. Install System Dependencies and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Backend Python Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir fastapi uvicorn python-multipart

# 3. Copy the Entire Codebase
COPY . .

# 4. Install Frontend Dependencies (Bypassing the production build!)
RUN cd frontend && npm install

# 5. Expose Ports for API and UI
EXPOSE 8000
EXPOSE 3000

# 6. Boot both the Python API and the Next.js DEV server simultaneously
CMD ["sh", "-c", "python api.py & cd frontend && npm run dev"]