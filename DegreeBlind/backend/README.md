# Degree Blind Backend

The FastAPI backend for Degree Blind.
Mission: Hire Skills. Not Degrees.

## Setup

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/Scripts/activate
   pip install -r requirements.txt
   ```
2. Copy `.env.example` to `.env` and configure secrets.
3. Run migrations:
   ```bash
   alembic upgrade head
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
