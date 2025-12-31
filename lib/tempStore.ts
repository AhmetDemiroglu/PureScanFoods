let currentAnalysisResult: any = null;
let currentImageUri: string | null = null;

export const TempStore = {
    setResult: (data: any, imageUri: string) => {
        currentAnalysisResult = data;
        currentImageUri = imageUri;
    },
    getResult: () => {
        return { data: currentAnalysisResult, image: currentImageUri };
    },
    clear: () => {
        currentAnalysisResult = null;
        currentImageUri = null;
    },
};
