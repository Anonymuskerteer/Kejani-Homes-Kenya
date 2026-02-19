const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Derive a 32-byte key from JWT_SECRET
function getEncryptionKey() {
  const secret = process.env.JWT_SECRET || 'default-secret-key-change-me';
  return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(text) {
  if (!text || typeof text !== 'string') return text;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Format: iv:tag:encrypted
  return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText) {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;

  // Only decrypt if it starts with our prefix
  if (!encryptedText.startsWith('enc:')) return encryptedText;

  try {
    const key = getEncryptionKey();
    const parts = encryptedText.slice(4).split(':');

    if (parts.length !== 3) return encryptedText;

    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return encryptedText;
  }
}

module.exports = { encrypt, decrypt };
