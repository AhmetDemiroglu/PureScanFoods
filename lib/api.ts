import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const geminiProxy = httpsCallable(functions, "geminiProxy");

export const callGemini = async (endpoint: string, body: any) => {
    try {
        const result = await geminiProxy({ endpoint, body });
        return result.data;
    } catch (error) {
        console.error("Gemini Proxy Error:", error);
        throw error;
    }
};
