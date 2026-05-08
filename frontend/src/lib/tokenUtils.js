/**
 * Token Utility Functions
 * Best practices for JWT token handling
 */

/**
 * Decode JWT token without verification (for client-side only)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;

    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error("❌ Failed to decode token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - true if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);

  if (!decoded || !decoded.exp) return true;

  // exp is in seconds, convert to milliseconds
  const expiryTime = decoded.exp * 1000;
  const currentTime = Date.now();

  // Consider token expired if less than 1 minute remaining
  const bufferTime = 60 * 1000; // 1 minute buffer

  return currentTime >= expiryTime - bufferTime;
};

/**
 * Get time remaining until token expiry
 * @param {string} token - JWT token
 * @returns {number} - Milliseconds until expiry, or -1 if already expired
 */
export const getTokenExpiryTime = (token) => {
  const decoded = decodeToken(token);

  if (!decoded || !decoded.exp) return -1;

  const expiryTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const timeRemaining = expiryTime - currentTime;

  return timeRemaining > 0 ? timeRemaining : -1;
};

/**
 * Format time remaining for display
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} - Formatted time string
 */
export const formatTimeRemaining = (milliseconds) => {
  if (milliseconds < 0) return "Expired";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Get token metadata for debugging
 * @param {string} token - JWT token
 * @returns {object} - Token metadata
 */
export const getTokenMetadata = (token) => {
  const decoded = decodeToken(token);

  if (!decoded) {
    return {
      valid: false,
      message: "Invalid or expired token",
    };
  }

  const expiryTime = getTokenExpiryTime(token);
  const isExpired = expiryTime < 0;

  return {
    valid: !isExpired,
    expired: isExpired,
    userId: decoded.id,
    role: decoded.role,
    issuedAt: new Date(decoded.iat * 1000),
    expiresAt: new Date(decoded.exp * 1000),
    timeRemaining: formatTimeRemaining(expiryTime),
    expiryTimeMs: expiryTime,
  };
};

/**
 * Validate token structure and signature presence
 * @param {string} token - JWT token
 * @returns {boolean} - true if token structure is valid
 */
export const isValidTokenStructure = (token) => {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
};
