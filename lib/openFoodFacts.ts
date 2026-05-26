import { Platform } from "react-native";
import * as Application from "expo-application";

export interface FoodProduct {
    found: boolean;
    productName?: string;
    brand?: string;
    ingredients?: string;
    image?: string;
    nutriments?: any;
    nutriscore_grade?: string;
    nutriscore_score?: number;
    nutrient_levels?: any;
}

const PLATFORM_LABEL = Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : Platform.OS;
const APP_VERSION = Application.nativeApplicationVersion ?? "1.0";
const USER_AGENT = `PureScanFoods - ${PLATFORM_LABEL} - Version ${APP_VERSION}`;

export const getIngredientsByBarcode = async (barcode: string): Promise<FoodProduct> => {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "User-Agent": USER_AGENT },
        });

        if (!response.ok) return { found: false };

        const data = await response.json();

        if (data.status === 1 && data.product) {
            const p = data.product;

            const ingredientsText = p.ingredients_text_tr || p.ingredients_text_en || p.ingredients_text || null;

            const rawGrade = p.nutriscore_grade || p.nutrition_grades || p.nutrition_grade_fr || null;
            const nutriscoreGrade = rawGrade ? rawGrade.toLowerCase() : null;

            const nutriscoreScore = p.nutriscore_score !== undefined ? p.nutriscore_score : null;

            if (ingredientsText) {
                return {
                    found: true,
                    productName: p.product_name || "İsimsiz Ürün",
                    brand: p.brands || "",
                    ingredients: ingredientsText,
                    image: p.image_url,
                    nutriments: p.nutriments,
                    nutriscore_grade: nutriscoreGrade,
                    nutriscore_score: nutriscoreScore,
                    nutrient_levels: p.nutrient_levels || {},
                };
            }
        }
    } catch (error) {
        console.warn("OpenFoodFacts Fetch Error:", error);
    }

    return { found: false };
};
