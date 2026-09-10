import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Automatically download essential NLTK data packages if missing
for resource in ["punkt", "punkt_tab", "stopwords", "wordnet", "omw-1.4"]:
    try:
        nltk.download(resource, quiet=True)
    except Exception:
        pass

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))

# We keep interrogative words like "how", "what", "when", "where" as they carry intent
retained_words = {"how", "what", "when", "where", "who", "which", "can", "do", "does", "is", "are"}
filtered_stopwords = stop_words - retained_words

def preprocess_text(text: str) -> str:
    if not text:
        return ""

    # 1. Lowercase
    text = text.lower()

    # 2. Remove special characters and extra punctuation
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)

    # 3. Tokenize
    tokens = word_tokenize(text)

    # 4. Remove stopwords (except intent keywords) & Lemmatize
    cleaned_tokens = [
        lemmatizer.lemmatize(word)
        for word in tokens
        if word not in filtered_stopwords and len(word) > 1
    ]

    return " ".join(cleaned_tokens)

