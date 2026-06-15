FROM python:3.12-slim

# Install Node.js, Redis, Nginx, Chromium (for Selenium), and required system dependencies
RUN apt-get update && apt-get install -y curl bash libgl1 libglib2.0-0 redis-server nginx chromium chromium-driver && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Setup client Dependencies
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install

# 2. Setup Node Backend Dependencies
# WORKDIR /app/Backend_node
# COPY Backend_node/package*.json ./
# RUN npm install

# 3. Setup Python Backend Dependencies
WORKDIR /app/server
COPY server/pyproject.toml server/README.md server/uv.lock* ./
RUN pip install --no-cache-dir uv
RUN uv pip compile pyproject.toml -o requirements.txt && \
    uv pip install --system -r requirements.txt

# --- COPY THE REST OF THE CODE ---
WORKDIR /app
COPY . .

# 1b. Build client
WORKDIR /app/client
# Inject base URLs for Vite build process since .env is ignored in docker
ENV VITE_API_BASE_URL="/server"
# Produce the optimized static files for Nginx to serve
RUN npm run build

# 3b. Install Python Package
WORKDIR /app/server
# Using uv to install dependencies from pyproject.toml
RUN uv pip install --system -e .

# Expose ONLY port 7860 for Hugging Face
EXPOSE 7860

# Go back to root
WORKDIR /app

# Copy the Nginx configuration over the default one
COPY nginx.conf /etc/nginx/nginx.conf

# Create a startup script that runs all three apps in the background
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Starting Python Backend (FastAPI)..."\n\
cd /app/server\n\
# Running with uvicorn directly to ensure it binds correctly to localhost:8000\n\
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &\n\
\n\
echo "Starting Nginx (Gateway on 7860)..."\n\
# Nginx stays in foreground to keep container alive\n\
nginx -g "daemon off;"\n\
' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]
un the startup script
CMD ["/app/start.sh"]
