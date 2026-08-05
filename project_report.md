# DegreeBlind (Analyser AI) - Comprehensive Project Report

> **Mission Statement:** *"Hire Skills. Not Degrees."*

DegreeBlind is a modern, AI-powered GitHub repository analysis platform designed to shift the focus of technical recruitment away from traditional academic credentials and towards the actual engineering skills developers demonstrate in their code.

---

## 🎨 Theme & UI/UX Design

The application is built with a premium, **Apple-inspired Glass Morphism** aesthetic, focusing on fluid interactions and minimal clutter.

- **Glass Morphism:** Extensive use of semi-transparent panels (`bg-white/30`), strong backdrop blurs (`backdrop-blur-xl`), and saturated colors (`backdrop-saturate-150`) to create depth and a modern "frosted glass" look.
- **Fluid Animations:** Powered by `framer-motion`, every page transition features a smooth fade-and-slide effect (`PageWrapper`). UI elements utilize micro-animations like gentle lifts on hover (`hover:-translate-y-1`) and soft pulse effects.
- **Elegant Feedback:** Replaced harsh browser alerts with **Sonner Toasts**. Success and error notifications slide in seamlessly at the bottom of the screen, keeping the user informed without breaking their flow.

---

## 🖱️ User Journey & Core Features (The "Clicks")

The application is designed to be highly intuitive, guiding the user from login to deep technical analysis with minimal clicks.

1. **Authentication Flow (Sign In / Guest)**
   - **Click "Sign In":** Users authenticate securely via GitHub OAuth.
   - **Guest Mode:** Unauthenticated users can still analyze repositories, but their reports will not be saved to a persistent history.

2. **Dashboard & Repository Analysis**
   - **Paste URL & Click "Analyze":** The user inputs a GitHub URL on the dashboard.
   - **Loading Timeline:** Instead of a frozen screen, the user is presented with a dynamic `LoadingTimeline` that visualizes the stages of analysis while the backend processes the data asynchronously.

3. **The Report Page**
   - Once loading completes, the user sees a highly structured AI report containing:
     - **Repository Stats:** Stars, forks, languages, and descriptions pulled directly from GitHub.
     - **Skill Breakdown:** AI assessments on Architecture, Code Quality, Problem Solving, Security, Testing, and Scalability.
     - **Recommended Roles:** Specific job roles the repository owner qualifies for (e.g., "Senior Backend Engineer"), eliminating the need for a degree.

4. **Reports History & Management**
   - **Click "Reports":** Authenticated users can view a clean list of all past analyses.
   - **Anti-Duplication:** If a user analyzes the same repository twice, the system intelligently loads the existing report to prevent UI clutter.
   - **Soft Delete:** A sleek trash icon allows users to delete reports. A click triggers a confirmation and instantly removes the item from the list via a soft-delete database flag.

---

## 🤖 Artificial Intelligence (AI)

The core intelligence of the application is driven by **NVIDIA's Nemotron Model**, accessed via the `integrate.api.nvidia.com` API.

- **Context Gathering:** The backend fetches extensive repository metadata (README, languages, structures) using the GitHub API.
- **Structured Assessment:** The LLM is strictly prompted to return structured JSON. It assesses the code's maintainability, engineering practices, and technical strengths to generate the `FullReport`.
- **Role Generation:** The AI acts as a technical recruiter, dynamically suggesting job titles based *only* on the complexity and quality of the analyzed codebase.

---

## ⚙️ Backend Architecture & APIs

The backend is engineered for high performance, stability, and security using **FastAPI (Python)** and **SQLite/SQLAlchemy**.

- **Asynchronous Polling Architecture:** 
  - To prevent browser timeouts during long AI generation times, the analysis pipeline is fully asynchronous. 
  - **`POST /analyze`**: Instantly creates a database record and hands the heavy AI task to a FastAPI `BackgroundTasks` thread.
  - **`GET /analyze/{id}/status`**: The frontend seamlessly pings this API every 3 seconds until the background task completes, ensuring a stable connection.
  
- **Database Architecture:**
  - Uses asynchronous SQLAlchemy drivers.
  - Tables include `users`, `repositories`, `analyses`, and `reports`.
  - Supports non-destructive "Soft Deletes" for user history management (`is_deleted` flag).

- **Middleware & Security Infrastructure:**
  - **Custom Logging:** A global HTTP middleware tracks and logs every single request, HTTP method, status code, and execution time (in milliseconds) to the terminal.
  - **Rate Limiting:** The `/analyze` API is protected by a custom token-bucket dependency, limiting requests to 5 per minute per IP to protect the AI API quota.
  - **Global Exception Handling:** Prevents 500 server crashes from disrupting the frontend by catching exceptions and returning formatted JSON errors.

---
> **Summary:** DegreeBlind bridges the gap between raw code and technical recruiting. By wrapping robust API pipelines and NVIDIA's AI in a stunning, Apple-esque interface, it provides a seamless tool to evaluate developers based entirely on their provable skills.
