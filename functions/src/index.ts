import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
// import fetch from "node-fetch"; <-- SİLİNDİ (Node 24 native fetch kullanır)

interface GeminiRequest {
    endpoint: string; // Örn: "gemini-2.5-flash-preview-09-2025:generateContent"
    body: any;
}

export const geminiProxy = onCall({ region: "europe-west1", cors: true, secrets: ["GEMINI_API_KEY"] }, async (request) => {
    try {
        // Cosmetics mantığı: endpoint ve body istemciden gelir
        const { endpoint, body } = request.data as GeminiRequest;

        // 1. Loglama (Cosmetics style)
        logger.info("Received endpoint:", endpoint);

        if (!process.env.GEMINI_API_KEY) {
            throw new HttpsError("failed-precondition", "API Key not configured.");
        }

        if (!endpoint) {
            throw new HttpsError("invalid-argument", "Endpoint parameter is missing");
        }

        logger.info(`🚀 Calling Gemini: ${endpoint}`);

        // 2. URL Oluşturma (Dinamik)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${endpoint}?key=${process.env.GEMINI_API_KEY}`;

        // 3. Native Fetch (Cosmetics yapısı)
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`❌ Gemini API Error: ${response.status} - ${errorText}`);
            // Hatayı net görmek için:
            throw new HttpsError("invalid-argument", `Gemini API Error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        logger.info("✅ Gemini response received successfully");

        return result;
    } catch (error: any) {
        logger.error("Function error:", error.message);
        throw new HttpsError("internal", error.message || "Unknown error");
    }
});
