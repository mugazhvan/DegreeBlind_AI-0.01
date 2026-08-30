# DegreeBlind AI

> **Skills over degrees. Potential over pedigree.**

DegreeBlind AI is an AI-powered hiring and career platform designed to evaluate candidates based on **skills, projects, practical experience, and demonstrated ability** rather than treating a college degree as the primary measure of employability.

The goal is simple: **give capable people a fairer opportunity to prove what they can actually do.**

## Why DegreeBlind AI?

Traditional hiring systems can heavily depend on:

* College degrees and academic credentials
* Institution reputation
* Keyword-heavy resumes
* Years of experience
* Conventional career paths

But a candidate's ability isn't always reflected by their degree.

DegreeBlind AI aims to shift the focus toward **evidence of capability**.

### Core principle

```text
Degree
   ↓
Not the deciding factor

Skills + Projects + Experience + Evidence
   ↓
Candidate potential
```

---

## Features

### AI-Powered Candidate Evaluation

Analyze candidate profiles using signals such as:

* Technical skills
* Projects
* GitHub activity
* Work experience
* Certifications
* Problem-solving evidence
* Portfolio quality
* Relevant achievements

### Degree-Blind Matching

Candidate evaluation can be configured to minimize or exclude degree-based filtering.

Instead of asking:

> "Which college did this person attend?"

DegreeBlind AI focuses on:

> "What can this person actually do?"

### Skill-Based Job Matching

Match candidates with opportunities based on:

* Required skills
* Demonstrated experience
* Project relevance
* Skill proficiency
* Role requirements

### Candidate Skill Profile

Build a structured profile containing:

```text
Skills
Projects
Experience
Certifications
Achievements
Portfolio
GitHub
Technical evidence
```

### Explainable Recommendations

Rather than simply producing a score, the system can provide reasoning such as:

```text
Match Score: 87%

Strong matches:
✓ Python
✓ Machine Learning
✓ Data Analysis
✓ SQL

Evidence:
• 3 relevant projects
• Machine-learning project experience
• Active technical portfolio

Skill gaps:
• Production ML deployment
• Cloud experience
```

---

## Vision

DegreeBlind AI is built around a simple idea:

> **A person's potential should not be limited by the credential they hold.**

The platform aims to help organizations discover capable candidates who may be overlooked by traditional screening systems.

At the same time, candidates get a way to demonstrate their abilities through **real evidence rather than credentials alone**.

---

## How It Works

```text
Candidate
    │
    ▼
Profile / Resume / Portfolio
    │
    ▼
Skill & Experience Extraction
    │
    ▼
Project & Evidence Analysis
    │
    ▼
AI Candidate Representation
    │
    ▼
Job Requirement Analysis
    │
    ▼
Skill-Based Matching
    │
    ▼
Explainable Candidate Ranking
```

---

## Example

### Candidate A

```text
Degree: Computer Science
Experience: 0 years

Skills:
Python, SQL

Projects:
1 basic Python project
```

### Candidate B

```text
Degree: Non-CS / No relevant degree
Experience: 0 years

Skills:
Python, SQL, Machine Learning

Projects:
• Recommendation system
• Fraud detection model
• Data analytics dashboard

GitHub:
Active
```

A conventional degree filter may prioritize Candidate A.

DegreeBlind AI is designed to ask:

> **Who has stronger evidence that they can perform the job?**

---

## Technology

The project is designed to integrate modern technologies such as:

* **Python**
* **Artificial Intelligence / Machine Learning**
* **Natural Language Processing**
* **Large Language Models**
* **GitHub APIs**
* **Resume parsing**
* **Vector search / embeddings**
* **REST APIs**
* **Database systems**
* **Web technologies**

> The exact technology stack may evolve as the project develops.

---

## Project Structure

A possible structure:

```text
DegreeBlind-AI/
│
├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── utils/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── assets/
│
├── ai/
│   ├── models/
│   ├── embeddings/
│   └── evaluation/
│
├── data/
│
├── tests/
│
├── docs/
│
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/DegreeBlind-AI.git
cd DegreeBlind-AI
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it.

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment configuration:

```bash
cp .env.example .env
```

Add the required API keys and configuration values to `.env`.

Run the application:

```bash
python app.py
```

> Update these commands as the project architecture becomes finalized.

---

## Example Evaluation

```json
{
  "candidate": "Candidate 001",
  "degree_weight": 0,
  "skill_match": 0.91,
  "project_relevance": 0.87,
  "experience_relevance": 0.82,
  "overall_match": 0.88
}
```

The important principle is that **degree status should not artificially inflate or reduce a candidate's capability score**.

---

## Fairness & Responsible AI

DegreeBlind AI is not intended to replace human judgment.

AI-based hiring systems can inherit biases from:

* Historical hiring data
* Training datasets
* Resume formats
* Language patterns
* Proxy variables
* Existing organizational practices

Therefore, the system should be designed with:

* Transparent evaluation criteria
* Explainable recommendations
* Human review
* Bias testing
* Auditable scoring
* Privacy protection
* Candidate control over their data

**Degree-blind does not automatically mean bias-free.**

The objective is to reduce unnecessary credential-based filtering while maintaining responsible hiring practices.

---

## Roadmap

### Phase 1 — Foundation

* [x] Project concept
* [ ] Candidate profile system
* [ ] Job profile system
* [ ] Basic skill extraction
* [ ] Initial matching engine

### Phase 2 — AI

* [ ] Resume parsing
* [ ] Project analysis
* [ ] GitHub analysis
* [ ] Semantic skill matching
* [ ] Explainable AI recommendations

### Phase 3 — Platform

* [ ] Candidate dashboard
* [ ] Recruiter dashboard
* [ ] Job discovery
* [ ] Candidate-job matching
* [ ] Portfolio integration

### Phase 4 — Responsible Hiring

* [ ] Bias evaluation
* [ ] Model auditing
* [ ] Explainability improvements
* [ ] Privacy controls
* [ ] Human-review workflows

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Commit them.

```bash
git commit -m "Add your feature"
```

5. Push the branch.

```bash
git push origin feature/your-feature
```

6. Open a Pull Request.

---

## Disclaimer

DegreeBlind AI is an experimental project intended to explore **skills-first and degree-neutral approaches to talent discovery**.

AI-generated candidate evaluations should not be treated as definitive judgments about a person's ability, suitability, or employment prospects.

---

## License

This project is currently under development.

License information will be added as the project matures.

---

## Built With a Simple Belief

**Talent exists everywhere. Opportunity doesn't.**

DegreeBlind AI is an attempt to close that gap by making **demonstrated ability—not credentials—the starting point.**
