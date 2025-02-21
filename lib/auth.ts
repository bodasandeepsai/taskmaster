import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenUser {
  userId: string;
  email: string;
}

// Get token from cookie in server components
export async function getTokenFromServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return token;
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
export function verifyToken(token: string): TokenUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenUser;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Get authenticated user from token
export async function getAuthUser() {
  try {
    const token = typeof window === 'undefined' 
      ? await getTokenFromServer() 
      : getTokenFromClient();
    
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
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
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as TokenUser;
    return jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1h' });
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

// Validate token middleware
export async function validateToken(token: string | undefined): Promise<TokenUser | null> {
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

export const generateToken = ({ userId, email }: TokenUser): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "24h" });
};

  
  