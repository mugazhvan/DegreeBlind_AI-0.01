# DegreeBlind Frontend Integration Guide

This document outlines all the core backend API endpoints available for frontend integration, covering the Intelligence Engines, GitHub Analysis, and Authentication flows.

## Base URL
All endpoints are relative to: `http://localhost:8000/api/v1`
*(Note: If running on Windows locally, use `http://127.0.0.1:8000/api/v1` to avoid IPv6 binding issues.)*

---

## 1. Authentication (`/auth`)

### GitHub OAuth
- **Login**: `GET /auth/github/login` (Redirects to GitHub)
- **Callback**: `GET /auth/github/callback?code=...` (Returns JWT token to frontend)

### Google OAuth
- **Login**: `GET /auth/google/login` (Redirects to Google)
- **Callback**: `GET /auth/google/callback?code=...` (Returns JWT token to frontend)

### Session Management
- **Refresh Token**: `POST /auth/refresh`
  - Body: `{"refresh_token": "..."}`
- **Logout**: `POST /auth/logout`
- **Current User**: `GET /auth/me` (Requires Bearer token)

---

## 2. GitHub Analysis Engine (`/analysis` & `/reports`)

- **Analyze Repository**: `POST /analysis/analyze`
  - Body: `{"repo_url": "https://github.com/user/repo"}`
- **Poll Analysis Status**: `GET /analysis/{analysis_id}/status`
- **Get Report History**: `GET /reports/history`
- **Delete Report**: `DELETE /reports/{report_id}`
- **Dashboard Stats**: `GET /stats/dashboard` (Returns aggregates across user's reports)

---

## 3. Resume Intelligence & ATS Engines (`/resumes` & `/ats`)

### Resume Parser
- **Upload**: `POST /resumes/upload`
  - Form Data: `file` (PDF/DOCX)
  - *Returns `resume_id` and starts background LLM extraction.*
- **Poll Status**: `GET /resumes/{resume_id}/status`
- **Get Parsed JSON Data**: `GET /resumes/{resume_id}`

### ATS Scorer
- **Score Resume**: `POST /ats/score`
  - Body: `{"resume_id": 123, "job_description": "..."}`
- **Get Score**: `GET /ats/{score_id}`

### Resume Generator
- **Generate Tailored Resume**: `POST /resumes/generate`
  - Body: `{"target_role": "Software Engineer", "theme": "modern"}`

---

## 4. Cross-Reference Engine (`/crossref`)

- **Trigger Cross-Reference**: `POST /crossref/analyze`
  - Body: `{"resume_id": 123}` *(Optional. If omitted, backend uses user's latest parsed resume)*
  - *Compares the parsed resume against the user's GitHub engineering metrics to calculate a Trust Score.*
- **Get Latest Cross-Reference**: `GET /crossref/latest`

---

## 5. Career & Growth Engines (`/career`, `/job_match`, `/learning`)

### Career Intelligence
- **Generate Career Report**: `POST /career/generate`
  - Body: `{"resume_id": 123, "github_username": "octocat"}`

### Job Match Engine
- **Analyze Match**: `POST /job_match/analyze`
  - Body: `{"resume_id": 123, "job_description": "..."}`

### Learning Roadmap
- **Generate Roadmap**: `POST /learning/generate`
  - Body: `{"resume_id": 123, "target_role": "Senior Engineer"}`

---

## 6. Interview Engine (`/interview`)

- **Start Session**: `POST /interview/start`
  - Body: `{"interview_type": "technical", "target_role": "Backend Engineer"}`
  - *Returns: `InterviewSessionResponse` with a list of generated questions.*
- **Submit Answer**: `POST /interview/question/{question_id}/answer`
  - Body: `{"answer_text": "..."}`
  - *Returns: Immediate AI evaluation and score.*
- **Complete Session**: `POST /interview/session/{session_id}/complete`
  - *Returns: Overall `InterviewFeedbackResponse` summary.*

---

## Security Headers
All protected routes require the standard Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

## Global Error Handling
The backend uses standard HTTP status codes:
- `400 Bad Request`: Validation errors, missing files, or required states not met (e.g., "Resume not completed").
- `401 Unauthorized`: Missing or invalid JWT token.
- `404 Not Found`: Resource (e.g., Resume, Session) not found.
- `429 Too Many Requests`: Rate limit exceeded (SlowAPI).
- `500 Internal Server Error`: Backend crash or LLM failure.
