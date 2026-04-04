import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";
import { storagePath as envStoragePath } from "./firebase";
import imageCompression from "browser-image-compression";

// ─── Limits ───
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file (down from 10)
const MAX_FILES_PER_CASE = 50;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_FILE_TYPES = [...ACCEPTED_IMAGE_TYPES, "application/pdf"];

// Firebase free tier: 5 GB storage, 1 GB/day download
// We'll set a conservative limit to stay well within free tier
export const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB soft limit
export const STORAGE_WARNING_BYTES = 0.75 * 1024 * 1024 * 1024; // 750 MB warning

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum size is 5 MB.`;
  }
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return `Unsupported file type. Accepted: JPG, PNG, WebP, PDF`;
  }
  return null;
}

export function checkCaseFileLimit(
  currentFileCount: number,
  newFiles: number,
): string | null {
  if (currentFileCount + newFiles > MAX_FILES_PER_CASE) {
    return `Case file limit reached. Maximum ${MAX_FILES_PER_CASE} files per case (current: ${currentFileCount}).`;
  }
  return null;
}

/**
 * Aggressive image compression pipeline:
 * 1. Resize to max 1600px (medical photos don't need 4K)
 * 2. Compress to max 800 KB (was 2 MB)
 * 3. Convert to WebP when possible for smaller size
 * 4. Always compress, even small images
 */
export async function compressImage(file: File): Promise<File> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return file;

  const options = {
    maxSizeMB: 0.8, // 800 KB max — aggressive for storage savings
    maxWidthOrHeight: 1600, // 1600px is plenty for medical photos
    useWebWorker: true,
    fileType: "image/webp" as const, // WebP is 25-34% smaller than JPEG
    initialQuality: 0.82,
  };

  try {
    const compressed = await imageCompression(file, options);
    // Use webp extension if we converted
    const newName = file.name.replace(/\.(jpe?g|png)$/i, ".webp");
    return new File([compressed], newName, {
      type: compressed.type || "image/webp",
    });
  } catch {
    // Fallback: try milder compression
    try {
      const fallback = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      return new File([fallback], file.name, { type: file.type });
    } catch {
      return file;
    }
  }
}

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

export async function uploadFile(
  doctorId: string,
  caseId: string,
  entryId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<{ url: string; storagePath: string; compressedSize: number }> {
  // Compress images before upload
  const processedFile = await compressImage(file);

  const uniqueName = `${crypto.randomUUID()}-${processedFile.name}`;
  const filePath = envStoragePath(
    `cases/${doctorId}/${caseId}/timeline/${entryId}/${uniqueName}`,
  );
  const storageRef = ref(storage, filePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, processedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({ progress });
      },
      (error) => {
        onProgress?.({ progress: 0, error: error.message });
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress?.({ progress: 100, downloadURL: url });
        resolve({
          url,
          storagePath: filePath,
          compressedSize: processedFile.size,
        });
      },
    );
  });
}

export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

export function getFileType(file: File): "image" | "pdf" | "document" {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return "image";
  if (file.type === "application/pdf") return "pdf";
  return "document";
}

export function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Upload a profile photo for a doctor.
 * Compresses to webp, stores under profiles/{doctorId}/photo.webp.
 * Returns the download URL.
 */
export async function uploadProfilePhoto(
  doctorId: string,
  file: File,
): Promise<string> {
  const compressed = await compressImage(file);
  const filePath = envStoragePath(`profiles/${doctorId}/photo.webp`);
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytesResumable(storageRef, compressed);
  return getDownloadURL(snapshot.ref);
}
