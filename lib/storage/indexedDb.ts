/**
 * IndexedDB storage for PDF binary blobs.
 * localStorage cannot hold PDF files — blobs live here.
 */

const DB_NAME = "aleph-translate";
const DB_VERSION = 1;
const STORE_NAME = "blobs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export function pdfBlobKey(pageId: string): string {
  return `aleph:pdf-blob:${pageId}`;
}

export async function putBlob(key: string, data: ArrayBuffer): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to write blob"));
    };
    tx.objectStore(STORE_NAME).put(data, key);
  });
}

export async function getBlob(key: string): Promise<ArrayBuffer | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error("Failed to read blob"));
    };
    request.onsuccess = () => {
      db.close();
      resolve((request.result as ArrayBuffer | undefined) ?? null);
    };
  });
}

export async function deleteBlob(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to delete blob"));
    };
    tx.objectStore(STORE_NAME).delete(key);
  });
}
