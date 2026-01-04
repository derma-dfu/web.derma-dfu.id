import { NextRequest, NextResponse } from "next/server";
import { translateText, translateFields, TranslationDirection } from "@/lib/gemini";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, fields, direction, context } = body as {
            text?: string;
            fields?: Record<string, string>;
            direction: TranslationDirection;
            context?: string;
        };

        // Validate direction
        if (!direction || !["id-to-en", "en-to-id"].includes(direction)) {
            return NextResponse.json(
                { error: "Invalid direction. Use 'id-to-en' or 'en-to-id'" },
                { status: 400 }
            );
        }

        // Single text translation
        if (text) {
            const translated = await translateText({ text, direction, context });
            return NextResponse.json({ translated });
        }

        // Batch field translation
        if (fields && typeof fields === "object") {
            const translations = await translateFields(fields, direction, context);
            return NextResponse.json({ translations });
        }

        return NextResponse.json(
            { error: "Provide either 'text' or 'fields' to translate" },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("Translation API error:", error);
        return NextResponse.json(
            { error: error.message || "Translation failed" },
            { status: 500 }
        );
    }
}
