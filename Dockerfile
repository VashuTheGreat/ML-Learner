FROM python:3.12-slim

# Install Node.js, Redis, Nginx, and required system dependencies for Python packages (opencv, etc)
RUN apt-get update && apt-get install -y curl bash libgl1 libglib2.0-0 redis-server nginx && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire codebase
COPY . .

# 1. Setup Frontend
WORKDIR /app/frontend
RUN npm install
# Produce the optimized static files for Nginx to serve
RUN npm run build

# 2. Setup Node Backend
WORKDIR /app/Backend_node
RUN npm install

# 3. Setup Python Backend
WORKDIR /app/python_backend
RUN pip install --no-cache-dir uv
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
nginx\n\
\n\
echo "Starting Node Backend..."\n\
cd /app/Backend_node && npm run dev &\n\
\n\
echo "Starting Python Backend..."\n\
cd /app/python_backend && python main.py &\n\
\n\
echo "All servers started! Waiting for them to finish..."\n\
wait -n\n\
' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]
