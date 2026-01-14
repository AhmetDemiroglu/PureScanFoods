import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImage = async (uri: string, path: string): Promise<string | null> => {
    try {
        // 1. Fetch ile Blob oluştur
        const response = await fetch(uri);
        const blob = await response.blob();

        // 2. Referans oluştur
        const storageRef = ref(storage, path);

        // 3. Metadata Tanımla (BU ÇOK KRİTİK - Android için)
        const metadata = {
            contentType: "image/jpeg", // Dosya tipini zorla belirtiyoruz
        };

        // 4. Metadata ile Yükle
        await uploadBytes(storageRef, blob, metadata);

        // 5. Linki al
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error) {
        console.error("Image upload failed detailed:", error);
        return null;
    }
};
