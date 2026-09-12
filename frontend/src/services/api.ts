const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"

export interface ChatResponse {
    answer: string;
    confidence: number;
    matched_question?: string | null;
    category?: string | null;
    suggestions: string[];
}

export interface FAQItem {
    id: number;
    category: string;
    question: string;
    pattterns: string[];
    answer: string;
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({ message }),
    });

    if(!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to communicate with Chatbot API");
    }

    return res.json();
}

export async function fetchAllFAQs(): Promise<FAQItem[]> {
    const res = await fetch(`${API_BASE_URL}/faqs`);
    if (!res.ok) {
        throw new Error ("Failed to load FAQs");
    }
    return res.json();
}