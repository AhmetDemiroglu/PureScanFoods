let currentAnalysisResult: any = null;
let currentImageUri: string | null = null;
let currentMeta: any = null;
let saveState: 'idle' | 'saving' | 'saved' = 'idle';

export const TempStore = {
    setResult: (data: any, imageUri: string, meta: any = null) => {
        currentAnalysisResult = data;
        currentImageUri = imageUri;
        currentMeta = meta;
        saveState = 'idle';
    },
    getResult: () => {
        return { data: currentAnalysisResult, image: currentImageUri, meta: currentMeta };
    },
    clear: () => {
        currentAnalysisResult = null;
        currentImageUri = null;
        currentMeta = null;
        saveState = 'idle';
    },
    getSaveState: () => saveState,
    markSaving: () => { saveState = 'saving'; },
    markSaved: () => { saveState = 'saved'; },
};
