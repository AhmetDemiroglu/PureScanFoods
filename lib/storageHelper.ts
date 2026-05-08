import { storage, auth } from "./firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";

export const uploadImage = async (uri: string, path: string): Promise<string | null> => {
    if (!auth.currentUser) {
        console.error("💥 HATA: Kullanıcı giriş yapmamış!");
        return null;
    }

    let blob: Blob | null = null;

    try {
        // 1. Resmi sıkıştır
        const manipResult = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG });

        // 2. Dosyayı Blob'a çevir
        blob = await new Promise<Blob>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                resolve(xhr.response as Blob);
            };
            xhr.onerror = (e) => {
                console.error("XHR Error:", e);
                reject(new Error("Blob oluşturulamadı"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", manipResult.uri, true);
            xhr.send(null);
        });

        if (!blob) {
            throw new Error("Blob oluşturma başarısız oldu (Null döndü).");
        }

        // 3. Storage referansı
        const storageRef = ref(storage, path);

        // 4. Yükle
        const metadata = {
            contentType: "image/jpeg",
        };

        await uploadBytes(storageRef, blob, metadata);

        // 5. Download URL al
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error: any) {
        console.error("💥 STORAGE HATASI:", error.message);
        try {
            console.error("📋 Detay:", JSON.stringify(error, null, 2));
        } catch (e) {}

        return null;
    } finally {
        if (blob) {
            try {
                // @ts-ignore
                blob.close();
            } catch (e) {
                console.log("Blob kapatılamadı:", e);
            }
        }
    }
};
