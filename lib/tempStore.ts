let currentAnalysisResult: any = null;
let currentImageUri: string | null = null;
let currentMeta: any = null;

export const TempStore = {
    setResult: (data: any, imageUri: string, meta: any = null) => {
        currentAnalysisResult = data;
        currentImageUri = imageUri;
        currentMeta = meta;
    },
    getResult: () => {
        return { data: currentAnalysisResult, image: currentImageUri, meta: currentMeta };
    },
    clear: () => {
        currentAnalysisResult = null;
        currentImageUri = null;
        currentMeta = null;
    },
};
