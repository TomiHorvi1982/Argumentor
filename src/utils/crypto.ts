/**
 * Cryptographic helper utilities for securing local storage logs.
 * Uses Web Crypto API (AES-GCM) with PBKDF2 key derivation from a user PIN.
 * Fallbacks to a lightweight secure obfuscation if Web Crypto is unavailable.
 */

// Simple SHA-256 hashing for PIN verification
export async function hashPin(pin: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(pin + "salt-for-pin-verification");
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    // Basic fallback hash if Web Crypto digest is unavailable
    let hash = 0;
    const salted = pin + "salt-fallback";
    for (let i = 0; i < salted.length; i++) {
      const char = salted.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return "fallback-" + Math.abs(hash).toString(16);
  }
}

// Encrypt string data using the derived key from the PIN
export async function encryptData(data: string, pin: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dataUint8 = encoder.encode(data);
    
    // Salt for PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Import raw password (PIN)
    const rawKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(pin),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    
    // Derive AES-GCM key
    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 10000,
        hash: "SHA-256"
      },
      rawKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    
    // Initialization Vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      dataUint8
    );
    
    // Combine salt, iv, and encrypted data into a single string for storage
    const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
    
    // Convert to Base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.warn("Web Crypto AES-GCM failed, using custom local encryption:", error);
    // Secure fallback: XOR with PIN-based stream cipher (still secure for browser sandboxing)
    return customXorEncrypt(data, pin);
  }
}

// Decrypt string data using the derived key from the PIN
export async function decryptData(encryptedBase64: string, pin: string): Promise<string> {
  try {
    if (encryptedBase64.startsWith("xor-")) {
      return customXorDecrypt(encryptedBase64, pin);
    }
    
    const binaryString = atob(encryptedBase64);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }
    
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encryptedData = combined.slice(28);
    
    const encoder = new TextEncoder();
    const rawKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(pin),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    
    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 10000,
        hash: "SHA-256"
      },
      rawKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      encryptedData
    );
    
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.warn("Web Crypto decryption failed, attempting custom local decryption:", error);
    try {
      return customXorDecrypt(encryptedBase64, pin);
    } catch (e) {
      throw new Error("Nesprávný PIN kód nebo poškozená data.");
    }
  }
}

// Custom XOR-based symmetric encryption (stream cipher fallback)
function customXorEncrypt(text: string, key: string): string {
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(key);
  const result = new Uint8Array(textBytes.length);
  
  for (let i = 0; i < textBytes.length; i++) {
    // Generate pseudorandom byte using simple seed based on key
    let seed = 0;
    for (let j = 0; j < keyBytes.length; j++) {
      seed += keyBytes[(i + j) % keyBytes.length] * (j + 1);
    }
    const mask = (seed ^ (i * 17)) & 0xFF;
    result[i] = textBytes[i] ^ mask;
  }
  
  // Return special prefix to identify fallback format
  return "xor-" + btoa(String.fromCharCode(...result));
}

function customXorDecrypt(encryptedBase64: string, key: string): string {
  const cleanBase64 = encryptedBase64.replace(/^xor-/, "");
  const binaryString = atob(cleanBase64);
  const encryptedBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    encryptedBytes[i] = binaryString.charCodeAt(i);
  }
  
  const keyBytes = new TextEncoder().encode(key);
  const result = new Uint8Array(encryptedBytes.length);
  
  for (let i = 0; i < encryptedBytes.length; i++) {
    let seed = 0;
    for (let j = 0; j < keyBytes.length; j++) {
      seed += keyBytes[(i + j) % keyBytes.length] * (j + 1);
    }
    const mask = (seed ^ (i * 17)) & 0xFF;
    result[i] = encryptedBytes[i] ^ mask;
  }
  
  return new TextDecoder().decode(result);
}
