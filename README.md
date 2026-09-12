# 🎓 University Admissions FAQ Chatbot

An NLP-powered FAQ chatbot designed to help prospective students and applicants quickly get answers regarding university admissions, application deadlines, tuition fees, scholarships, and campus housing.

Built with **FastAPI**, **NLTK**, **Scikit-Learn (TF-IDF & Cosine Similarity)**, and a **Next.js** single-page chat interface.

---

## 📌 Overview

Traditional search requires exact keywords, but students ask questions in varied ways. This chatbot uses Natural Language Processing (NLP) to understand user intent, vectorize questions, and calculate semantic similarity against an admissions knowledge base to return accurate answers with confidence scores.

### Key Features
- **Semantic Intent Matching**: Uses TF-IDF vectorization with unigrams and bigrams combined with Cosine Similarity to match student queries to FAQ patterns.
- **NLP Preprocessing Pipeline**: Tokenization, punctuation removal, stop-word filtering, and lemmatization using NLTK.
- **Small Talk & Fallback Handling**: Differentiates between casual greetings and actual inquiries, with friendly fallbacks when no direct answer is found.
- **Confidence Scoring & Metadata**: Displays matching percentage and topic categories alongside answers.
- **Quick Topic Prompts**: One-click prompt chips for frequent questions (Tuition, Deadlines, Housing, Scholarships).
- **Clean Single-Page UI**: Minimalist, flat interface built with Next.js and Tailwind CSS (no distracting gradients).

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic
- **NLP & Machine Learning**: NLTK, Scikit-Learn, NumPy
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React
- **Data Source**: Structured JSON dataset (`data/faqs.json`)

---

## 📂 Project Structure

```
SmartFAQs/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py         # Endpoints (/api/chat, /api/faqs, /api/health)
│   │   ├── core/
│   │   │   ├── preprocessor.py   # NLTK cleaning & lemmatization pipeline
│   │   │   └── matcher.py        # TF-IDF Vectorizer & Cosine Similarity engine
│   │   ├── schemas/
│   │   │   └── chat.py           # Pydantic request & response models
│   │   └── main.py               # FastAPI application setup & CORS configuration
│   ├── data/
│   │   └── faqs.json             # University admissions FAQ knowledge base
│   └── requirements.txt          # Python dependencies
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx        # App layout
    │   │   ├── page.tsx          # Single-page chat interface
    │   │   └── globals.css       # Tailwind configuration & base styling
    │   └── services/
    │       └── api.ts            # Frontend API client
    ├── package.json
    └── .env.local
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher & npm
- Git

---

### 1. Backend Setup

1. Open your terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```
   - API runs at: `http://localhost:8001`
   - Interactive Swagger API docs: `http://localhost:8001/docs`

---

### 2. Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Ensure `.env.local` contains the backend URL:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api
   ```

4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   - Access the chat interface at: `http://localhost:3000`

---

## 📡 API Reference

### `POST /api/chat`
Sends a student question and receives the best matching answer.

**Request Body:**
```json
{
  "message": "Can I get a scholarship for undergraduate studies?"
}
```

**Response:**
```json
{
  "answer": "Yes! We offer Merit-Based Scholarships covering up to 100% of tuition, Need-Based Financial Aid, and Graduate Assistantships.",
  "confidence": 0.88,
  "matched_question": "Are scholarships available for students?",
  "category": "Scholarships & Financial Aid",
  "suggestions": [
    "What are the general admission requirements?",
    "How much is the annual tuition fee?",
    "What is the application deadline?"
  ]
}
```

### `GET /api/faqs`
Returns all indexed FAQs stored in the knowledge base.

### `GET /api/health`
Checks backend service availability.

---

## 💡 How the NLP Matching Works

1. **Text Normalization**: Converts input to lowercase and strips punctuation.
2. **Tokenization**: Splits text into distinct word tokens using NLTK.
3. **Stop Words & Lemmatization**: Removes noise words while keeping key question words (`what`, `how`, `when`), reducing remaining words to their base dictionary lemma (e.g., `"fees"` -> `"fee"`, `"applying"` -> `"apply"`).
4. **Vectorization**: Transforms the cleaned query using a trained TF-IDF matrix built from all FAQ questions and patterns.
5. **Similarity & Threshold Gating**: Calculates Cosine Similarity against all entries. Matches scoring above `0.30` return the answer; queries below threshold return polite fallback guidance with topic suggestions.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
