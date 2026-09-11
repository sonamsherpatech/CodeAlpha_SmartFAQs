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

    def check_small_talk(self, query: str) -> Optional[str]:
        q_lower = query.lower().strip()
        for _, intent_data in SMALL_TALK.items():
            for kw in intent_data["keywords"]:
                if kw in q_lower:
                    return intent_data["reply"]
        return None

    def get_suggestions(self, count: int = 3) -> List[str]:
        return [faq["question"] for faq in self.faqs[:count]]

    def match(self, user_query: str) -> Dict[str, Any]:
        """
        Processses user query, finds best matching FAQ, and returns response payload.
        """
        # 1. Check for small talk / greetings first
        small_talk_reply = self.check_small_talk(user_query)
        if small_talk_reply:
            return {
                "answer": small_talk_reply,
                "confidence": 1.0,
                "matched_question": None,
                "category": "Small Talk",
                "suggestions": self.get_suggestions(3)
            }

        # 2. Preprocess user query
        cleaned_query = preprocess_text(user_query)
        if not cleaned_query:
            return {
                "answer": "Cloud you please provide more details? I'm here to help with admissions, fees, and campus questions.",
                "confidence": 0.0,
                "matched_question": None,
                "category": None,
                "suggestions": self.get_suggestions(3)
            }

        # 3. Vectorize and compute Cosine similarity
        query_vector = self.vectorizer.transform([cleaned_query])
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        best_index = similarities.argmax()
        best_score = float(similarities[best_index])

        # 4. Check confidence threshold
        if best_score >= SIMILARITY_THRESHOLD:
            faq_idx = self.faq_index_map[best_index]
            matched_faq = self.faqs[faq_idx]
            return {
                "answer": matched_faq["answer"],
                "confidence": round(best_score, 2),
                "matched_question": matched_faq["question"],
                "category": matched_faq.get("category", "General"),
                "suggestions": [f["question"] for f in self.faqs if f["id"] != matched_faq["id"]][:3]
            }
        else:
            # Fallback when no good match is found
            return {
                "answer": "I'm sorry, I couldn't find a direct answer to that question. You may contact the Admissions Office at admissions@university.edu or try asking about one of the topics below:",
                "confidence": round(best_score, 2),
                "matched_question": None,
                "category": None,
                "suggestions": self.get_suggestions(4)
            }