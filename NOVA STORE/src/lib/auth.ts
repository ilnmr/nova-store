import { jwtVerify, type JWTPayload } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-production'
);

/**
 * Verifies the JWT token from the 'token' cookie on an incoming Request.
 * Returns the decoded JWTPayload on success, or null if missing/invalid.
 */
export async function verifyToken(request: Request): Promise<JWTPayload | null> {
  try {
    // Read the cookie header directly from the request (works in Route Handlers)
    const cookieHeader = request.headers.get('cookie') ?? '';
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Convenience wrapper — returns the decoded JWT payload or null.
 * Identical to verifyToken but with a more semantic name for route handlers.
 */
export async function getUserFromRequest(request: Request): Promise<JWTPayload | null> {
  return verifyToken(request);
}

/**
 * Returns true when the JWT payload belongs to an admin user.
 */
export function isAdmin(payload: JWTPayload | null): boolean {
  if (!payload) return false;
  return (payload as JWTPayload & { role?: string }).role === 'ADMIN';
}
