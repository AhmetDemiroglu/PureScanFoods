import { storage, auth } from "./firebase";
import { ref, getDownloadURL, uploadBytes, listAll, deleteObject } from "firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";

export const uploadImage = async (uri: string, path: string): Promise<string | null> => {
    if (!auth.currentUser) {
        console.error("💥 HATA: Kullanıcı giriş yapmamış!");
        return null;
    }

    let blob: Blob | null = null;
    let localUri = uri;

    try {
        // Harici URL ise (OpenFoodFacts vb.) önce yerel dosyaya indir
        if (uri.startsWith("http://") || uri.startsWith("https://")) {
            const filename = `${FileSystem.cacheDirectory}tmp_${Date.now()}.jpg`;
            const downloadRes = await FileSystem.downloadAsync(uri, filename);
            localUri = downloadRes.uri;
        }

        // 1. Resmi sıkıştır
        const manipResult = await ImageManipulator.manipulateAsync(localUri, [{ resize: { width: 800 } }], { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG });

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
                if (__DEV__) console.log("Blob kapatılamadı:", e);
            }
        }
    }
};

// Belirli bir kullanıcıya ait Firebase Storage scan görsellerini siler.
// Hesap/veri silme akışından çağrılır. Tek tek silme hatalarını yutar.
export const deleteUserScanImages = async (uid: string): Promise<void> => {
    if (!uid) return;
    try {
        const folderRef = ref(storage, `scans/${uid}`);
        const listing = await listAll(folderRef);

        await Promise.all(
            listing.items.map(async (item) => {
                try {
                    await deleteObject(item);
                } catch (err) {
                    if (__DEV__) console.warn(`[Storage] delete failed for ${item.fullPath}:`, err);
                }
            })
        );

        await Promise.all(
            listing.prefixes.map(async (sub) => {
                try {
                    const subListing = await listAll(sub);
                    await Promise.all(
                        subListing.items.map(async (item) => {
                            try {
                                await deleteObject(item);
                            } catch (err) {
                                if (__DEV__) console.warn(`[Storage] delete failed for ${item.fullPath}:`, err);
                            }
                        })
                    );
                } catch (err) {
                    if (__DEV__) console.warn(`[Storage] sub-list failed for ${sub.fullPath}:`, err);
                }
            })
        );
    } catch (error) {
        // listAll, klasör yoksa veya rules engellerse hata atabilir; sessizce devam et.
        if (__DEV__) console.warn(`[Storage] deleteUserScanImages(${uid}) error:`, error);
    }
};
