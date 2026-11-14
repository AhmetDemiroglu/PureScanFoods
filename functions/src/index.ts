import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

interface GeminiRequest {
    endpoint: string;
    body: unknown;
}

const REGION = "europe-west1";

// Yalnız Gemini model çağrısı forward edilir; başka API yolu (ör. dosya/ayar uçları) geçemez.
const ENDPOINT_PATTERN = /^gemini-[a-z0-9.-]+:generateContent$/;

export const geminiProxy = onCall(
    {
        region: REGION,
        cors: true,
        secrets: ["GEMINI_API_KEY"],
        timeoutSeconds: 120,
        memory: "512MiB",
    },
    async (request) => {
        try {
            // Uygulama her zaman Firebase'de oturum açar (en az anonim). Oturumsuz istek dışarıdan gelir:
            // açık proxy, API anahtarını herkesin kullanmasına izin veriyordu.
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "Authentication required.");
            }

            const { endpoint, body } = request.data as GeminiRequest;

            if (!process.env.GEMINI_API_KEY) {
                throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not configured.");
            }

            if (!endpoint) {
                throw new HttpsError("invalid-argument", "Endpoint parameter is required.");
            }

            if (typeof endpoint !== "string" || !ENDPOINT_PATTERN.test(endpoint)) {
                throw new HttpsError("invalid-argument", "Unsupported endpoint.");
            }

            logger.info(`Calling Gemini endpoint: ${endpoint}`);

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${endpoint}?key=${process.env.GEMINI_API_KEY}`;
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`Gemini API error ${response.status}: ${errorText}`);
                // Gemini'nin gerçek sebebini de client'a taşı (404 model yok / 400 format / 403 yetki ayrımı için).
                throw new HttpsError(
                    "invalid-argument",
                    `Gemini API error (${response.status}): ${errorText.slice(0, 300)}`,
                );
            }

            return await response.json();
        } catch (error: any) {
            logger.error("geminiProxy failed:", error?.message || error);
            if (error instanceof HttpsError) throw error;
            throw new HttpsError("internal", error?.message || "Unknown server error.");
        }
    },
);
