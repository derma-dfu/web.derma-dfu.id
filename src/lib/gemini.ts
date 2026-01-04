import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

export type TranslationDirection = "id-to-en" | "en-to-id";

interface TranslateOptions {
    text: string;
    direction: TranslationDirection;
    context?: string; // Optional context for better translation (e.g., "medical", "product description")
}

/**
 * Translates text between Indonesian and English using Gemini API.
 * Optimized for healthcare/medical content.
 */
export async function translateText({
    text,
    direction,
    context = "healthcare and medical products",
}: TranslateOptions): Promise<string> {
    if (!text || text.trim() === "") {
        return "";
    }

    const sourceLang = direction === "id-to-en" ? "Indonesian" : "English";
    const targetLang = direction === "id-to-en" ? "English" : "Indonesian";

    const prompt = `You are a professional translator specializing in ${context}. 
Translate the following text from ${sourceLang} to ${targetLang}.
Keep medical and technical terms accurate.
Only return the translated text, nothing else.

Text to translate:
${text}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        return response.text?.trim() || text;
    } catch (error) {
        console.error("Translation error:", error);
        throw new Error("Failed to translate text");
    }
}

/**
 * Batch translate multiple fields at once.
 * Useful for translating entire forms.
 */
export async function translateFields(
    fields: Record<string, string>,
    direction: TranslationDirection,
    context?: string
): Promise<Record<string, string>> {
    const translations: Record<string, string> = {};

    for (const [key, value] of Object.entries(fields)) {
        if (value && value.trim()) {
            translations[key] = await translateText({ text: value, direction, context });
        } else {
            translations[key] = "";
        }
    }

    return translations;
}
