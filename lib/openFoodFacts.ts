export interface FoodProduct {
    found: boolean;
    productName?: string;
    brand?: string;
    ingredients?: string;
    image?: string;
    nutriments?: any;
}

export const getIngredientsByBarcode = async (barcode: string): Promise<FoodProduct> => {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "User-Agent": "PureScanFoods - Android - Version 1.0" },
        });

        if (!response.ok) return { found: false };

        const data = await response.json();

        if (data.status === 1 && data.product) {
            const p = data.product;
            const ingredientsText = p.ingredients_text_tr || p.ingredients_text_en || p.ingredients_text || null;

            if (ingredientsText) {
                return {
                    found: true,
                    productName: p.product_name || "İsimsiz Ürün",
                    brand: p.brands || "",
                    ingredients: ingredientsText,
                    image: p.image_url,
                    nutriments: p.nutriments,
                };
            }
        }
    } catch (error) {
        console.warn("OpenFoodFacts Fetch Error:", error);
    }

    return { found: false };
};
