FROM python:3.12-slim

# Install Node.js, Redis, Nginx, Chromium (for Selenium), and required system dependencies
RUN apt-get update && apt-get install -y curl bash libgl1 libglib2.0-0 redis-server nginx chromium chromium-driver && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Setup Frontend Dependencies
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# 2. Setup Node Backend Dependencies
WORKDIR /app/Backend_node
COPY Backend_node/package*.json ./
RUN npm install

# 3. Setup Python Backend Dependencies
WORKDIR /app/python_backend
COPY python_backend/pyproject.toml python_backend/README.md python_backend/uv.lock* ./
RUN pip install --no-cache-dir uv
RUN uv pip compile pyproject.toml -o requirements.txt && \
    uv pip install --system -r requirements.txt

# --- COPY THE REST OF THE CODE ---
WORKDIR /app
COPY . .

# 1b. Build Frontend
WORKDIR /app/frontend
# Inject base URLs for Vite build process since .env is ignored in docker
ENV VITE_NODE_BASE_URL="/node_api/api"
ENV VITE_PYTHON_BASE_URL="/python_api"
# Produce the optimized static files for Nginx to serve
RUN npm run build

# 3b. Install Python Package
WORKDIR /app/python_backend
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
echo "Starting Redis..."\n\
redis-server --daemonize yes\n\
\n\
echo "Starting Nginx..."\n\
nginx -g "daemon off;" &\n\
\n\
echo "Starting Node Backend..."\n\
cd /app/Backend_node && npm run dev &\n\
\n\
echo "Starting Python Backend..."\n\
cd /app/python_backend && python main.py &\n\
\n\
echo "All servers started! Waiting for them to crash or finish..."\n\
wait -n\n\
' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]
