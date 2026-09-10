import json
import os
from typing import Dict, Any, List, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.core.preprocessor import preprocess_text

SIMILARITY_THRESHOLD = 0.30

# Simple rule-based small talk mapping
SMALL_TALK = {
    "greetings" : {
        "keywords": ["hello", "hi", "hey", "good morning", "good afternoon", "greetings"],
        "reply": "Hello! I'm your University Admission Assistant. How can I help you today with admissions, tution, scholarships, or campus life?"
    },
    "thanks": {
        "keywords": ["thank", "thanks", "thank you", "appreciate", "helpful"],
        "reply": "You're very welcome! Feel free to ask if you have any other questions about the university."
    },
    "bye": {
        "keywords": ["bye", "goodbye", "see you", "cya"],
        "reply": "Goodbye! Best of luck with your academic journey. Have a great day!"
    },
    "identity": {
        "keywords": ["who are you", "what are you", "your name", "what can you do"],
        "reply": "I am the University Admission FAQ Chatbot. I can answer questions regarding eligibility, deadlines, tution fees, scholarships, housing and campus life!"
    }
}

class FAQMatcher:
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.faqs: List[Dict[str, Any]] = []
        self.corpus_raw: List[str] = []
        self.corpus_cleaned: List[str] = []
        self.faq_index_map: List[int] = []
        self.vectorizer = TfidfVectorizer(ngram_range=(1,2))
        self.tfidf_matrix = None
        self.load_and_train()

    def load_and_train(self):
        """Load FAQs and fits the TF-IDF Vectorizer."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"FAQ file not found at: {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            self.faqs = json.load(f)

        self.corpus_raw = []
        self.corpus_cleaned = []
        self.faq_index_map = []

        # Index primary question and all alternative patterns
        for faq_idx, faq in enumerate(self.faqs):
            # Add main question
            self.corpus_raw.append(faq["question"])
            self.corpus_cleaned.append(preprocess_text(faq["question"]))
            self.faq_index_map.append(faq_idx)

            # Add patterns
            for pattern in faq.get("patterns", []):
                self.corpus_raw.append(pattern)
                self.corpus_cleaned.append(preprocess_text(pattern))
                self.faq_index_map.append(faq_idx)

        # Fit TF-IDF matrix
        self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus_cleaned)
        