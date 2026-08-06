# 🚀 DegreeBlind Deployment & Local Host Guide

DegreeBlind is fully configured for zero-friction local host access and turnkey cloud deployment. Follow the guides below depending on your runtime environment.

---

## 💻 1. Local Host Access & Development

Because of our intelligent CORS resolution and dynamic environment mapping, developing locally works straight out of the box without changing any configuration files.

### 🐍 Backend (FastAPI + AI Suite)
1. Navigate to the backend folder:
   ```bash
   cd DegreeBlind/backend
   ```
2. Activate your virtual environment and run Uvicorn:
   ```bash
   # Windows PowerShell
   venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The backend defaults to SQLite (`degreeblind.db`) and immediately binds to `http://127.0.0.1:8000` with API docs available at `http://127.0.0.1:8000/docs`.*

### ⚛️ Frontend (Vite + React + Dark Glassmorphism UI)
1. Open a new terminal session in the project root:
   ```bash
   cd DegreeBlind
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *By default, the UI opens at **http://localhost:5173** and routes AI API calls straight to your running localhost backend.*

---

## 🌐 2. Cloud Production Deployment

When deploying to the web, DegreeBlind relies on two key environment mappings:
- **Frontend (`VITE_API_URL`)**: Points React to your deployed FastAPI cloud domain.
- **Backend (`FRONTEND_URL`)**: Allows secure CORS communication from your web app domain while maintaining compatibility with local development ports.

### ⛅ Deploying the Backend (Render / Railway / Heroku / AWS)
1. **Connect Repository**: Point your cloud deployment platform to the `backend/` directory of your Git repository.
2. **Build & Start Commands**:
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers` *(Or simply rely on the provided `Procfile`)*
3. **Environment Variables**: Configure the parameters defined in `backend/.env.example` in your hosting dashboard:
   ```env
   ENVIRONMENT=production
   DATABASE_URL=postgresql+asyncpg://user:password@cloud-db-host:5432/degreeblind
   JWT_SECRET=<secure-random-string>
   NVIDIA_API_KEY=<your-nvidia-nemotron-key>
   FRONTEND_URL=https://your-degreeblind-app.vercel.app
   ```

### ⚡ Deploying the Frontend (Vercel / Netlify / Cloudflare Pages)
1. **Import Repository**: In Vercel or Netlify, import your GitHub repository rooted at `DegreeBlind/`.
2. **Build Settings**:
   - **Framework Preset**: Vite / React
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-fastapi-backend.onrender.com/api/v1
   ```
4. **Deploy**: Trigger deployment—Vite will statically bundle all components and link them cleanly to your high-performance AI backend!
