FROM python:3.12-slim

WORKDIR /code

# Requirements copy karo
COPY requirements.txt .

# Install dependencies
RUN python -m pip install --no-cache-dir -r requirements.txt

# Runner script copy karo
COPY runner.py .

# Container start hone pe runner.py run karo
CMD ["python", "runner.py"]
