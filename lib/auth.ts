import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

interface TokenPayload {
  userId: string;
  email?: string;
}

// Get token from cookie in server components
export function getTokenFromServer() {
  const cookieStore = cookies();
  return cookieStore.get("token")?.value;
}

// Get token from document.cookie in client components
export function getTokenFromClient() {
  if (typeof window === 'undefined') return null;
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  return token;
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Get authenticated user from token
export function getAuthUser() {
  const token = typeof window === 'undefined' 
    ? getTokenFromServer() 
    : getTokenFromClient();
  
  return token ? verifyToken(token) : null;
}

// Generate access and refresh tokens
export function generateTokens(userId: string) {
  try {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Token generation failed:', error);
    return null;
  }
}

// Refresh access token using refresh token
export function refreshAccessToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;
    return jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1h' });
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

// Validate token middleware
export async function validateToken(token: string | undefined): Promise<TokenPayload | null> {
  if (!token) return null;
  
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;
    
    return decoded;
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
}

export const generateToken = (user: { userId: string, email: string }) => {
  return jwt.sign(
    { userId: user.userId, email: user.email }, 
    JWT_SECRET, 
    { expiresIn: "1h" }
  );
};

  
  