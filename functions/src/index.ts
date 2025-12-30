import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import fetch from "node-fetch";

const GEMINI_MODEL = "gemini-2.5-flash";

interface GeminiRequest {
    endpoint: string;
    body: any;
}

export const geminiProxy = onCall({ cors: true, secrets: ["GEMINI_API_KEY"] }, async (request) => {
    try {
        const { endpoint, body } = request.data as GeminiRequest;

        if (!process.env.GEMINI_API_KEY) {
            throw new HttpsError("failed-precondition", "API Key not configured.");
        }

        if (!endpoint) {
            throw new HttpsError("invalid-argument", "Endpoint parameter is missing");
        }

        logger.info(`🚀 Calling Gemini Model: ${GEMINI_MODEL}, Endpoint: ${endpoint}`);

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:${endpoint}?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`❌ Gemini API Error: ${response.status} - ${errorText}`);
            throw new HttpsError("internal", `Gemini API error: ${response.status}`, { details: errorText });
        }

        const result = await response.json();
        logger.info("✅ Gemini response received successfully");

        return result;
    } catch (error: any) {
        logger.error("Function error:", error.message);
        throw new HttpsError("internal", error.message || "Unknown error");
    }
});
