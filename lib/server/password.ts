import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hashBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hashBuffer.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  
  if (!salt || !hash) {
    return false;
  }
  
  const verifyHashBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashBuffer = Buffer.from(hash, "hex");
  
  if (verifyHashBuffer.length !== hashBuffer.length) {
    return false;
  }
  
  return timingSafeEqual(verifyHashBuffer, hashBuffer);
}

