import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

interface GeminiRequest {
    endpoint: string;
    body: unknown;
}

const REGION = "europe-west1";

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
            const { endpoint, body } = request.data as GeminiRequest;

            if (!process.env.GEMINI_API_KEY) {
                throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not configured.");
            }

            if (!endpoint) {
                throw new HttpsError("invalid-argument", "Endpoint parameter is required.");
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
                throw new HttpsError("invalid-argument", `Gemini API error (${response.status}).`);
            }

            return await response.json();
        } catch (error: any) {
            logger.error("geminiProxy failed:", error?.message || error);
            if (error instanceof HttpsError) throw error;
            throw new HttpsError("internal", error?.message || "Unknown server error.");
        }
    },
);
