from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

app = FastAPI(
    title="University Admissions FAQ Chatbot API",
    description="NLP-powered FAQ Chatbot using NLTK and Scikit-Learn TF-ID Cosine Similarity",
    version="1.0.0"
)

# Enable CORS for React/Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "University Admissions FAQ Chatbot API is running! Visit /docs for Swagger UI."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
