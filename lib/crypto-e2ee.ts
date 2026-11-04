'use client';

import MiniSearch from 'minisearch';

export interface EncryptedPayload {
  ciphertextBase64: string;
  ivBase64: string;
  algorithm: 'AES-256-GCM';
  keyExchange: 'ECDH-P256';
  keyFingerprint: string;
  timestamp: string;
}

export interface DecryptedChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'ai' | 'peer';
  plaintext: string;
  encryptedPayload: EncryptedPayload;
  createdAt: string;
  sharedWithAi?: boolean;
  attachments?: { name: string; type: string; size: string }[];
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export class PadhakuE2EEEngine {
  private roomKeys: Map<string, CryptoKey> = new Map();
  private keyFingerprints: Map<string, string> = new Map();
  private miniSearch: MiniSearch<DecryptedChatMessage>;
  private indexedIds: Set<string> = new Set();

  constructor() {
    this.miniSearch = new MiniSearch<DecryptedChatMessage>({
      fields: ['plaintext', 'senderName', 'roomId'],
      storeFields: ['id', 'roomId', 'senderName', 'plaintext', 'createdAt', 'senderRole'],
      searchOptions: {
        boost: { plaintext: 2, senderName: 1 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
  }

  /**
   * Simulates ECDH P-256 key agreement between Room Members and derives an AES-256-GCM session key.
   */
  async ensureRoomKey(roomId: string): Promise<{ key: CryptoKey; fingerprint: string }> {
    const existing = this.roomKeys.get(roomId);
    const existingFp = this.keyFingerprints.get(roomId);
    if (existing && existingFp) {
      return { key: existing, fingerprint: existingFp };
    }

    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      throw new Error('Web Crypto API is only available in browser context');
    }

    // Generate Alice & Bob ephemeral ECDH P-256 keypairs to demonstrate genuine ECDH derivation
    const aliceKeyPair = await window.crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey', 'deriveBits']
    );
    const bobKeyPair = await window.crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey', 'deriveBits']
    );

    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: bobKeyPair.publicKey,
      },
      aliceKeyPair.privateKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const rawKey = await window.crypto.subtle.exportKey('raw', aesKey);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', rawKey);
    const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 8);
    const fingerprint = hashArray.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(':');

    this.roomKeys.set(roomId, aesKey);
    this.keyFingerprints.set(roomId, fingerprint);
    return { key: aesKey, fingerprint };
  }

  /**
   * Encrypts plaintext in the browser using AES-256-GCM with a fresh 12-byte random IV.
   */
  async encryptMessage(roomId: string, plaintext: string): Promise<EncryptedPayload> {
    const { key, fingerprint } = await this.ensureRoomKey(roomId);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    return {
      ciphertextBase64: arrayBufferToBase64(ciphertextBuffer),
      ivBase64: arrayBufferToBase64(iv.buffer),
      algorithm: 'AES-256-GCM',
      keyExchange: 'ECDH-P256',
      keyFingerprint: fingerprint,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Decrypts an AES-256-GCM payload on the client device.
   */
  async decryptMessage(roomId: string, payload: EncryptedPayload): Promise<string> {
    const { key } = await this.ensureRoomKey(roomId);
    const iv = new Uint8Array(base64ToArrayBuffer(payload.ivBase64));
    const ciphertext = base64ToArrayBuffer(payload.ciphertextBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Stores decrypted message in client-side IndexedDB and indexes it in MiniSearch
   * so full-text search works locally without ever exposing plaintext to the server.
   */
  async indexMessageLocally(msg: DecryptedChatMessage): Promise<void> {
    if (!this.indexedIds.has(msg.id)) {
      this.indexedIds.add(msg.id);
      this.miniSearch.add(msg);
    }
    await this.saveToIndexedDB(msg);
  }

  searchLocalMessages(query: string, roomId?: string) {
    if (!query.trim()) return [];
    const results = this.miniSearch.search(query, {
      filter: roomId ? (result) => result.roomId === roomId : undefined,
    });
    return results.map((r) => ({
      id: r.id as string,
      roomId: r.roomId as string,
      senderName: r.senderName as string,
      plaintext: r.plaintext as string,
      createdAt: r.createdAt as string,
      score: Math.round(r.score * 100) / 100,
    }));
  }

  private async saveToIndexedDB(msg: DecryptedChatMessage): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) return;
    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open('PadhakuE2EEVault', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('decrypted_messages')) {
            db.createObjectStore('decrypted_messages', { keyPath: 'id' });
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('decrypted_messages', 'readwrite');
          tx.objectStore('decrypted_messages').put(msg);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => resolve();
        };
        request.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}
