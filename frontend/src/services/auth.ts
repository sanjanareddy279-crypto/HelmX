const STORAGE_KEY = 'helmx_auth';

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

const DEMO_EMAIL = 'demo@helmx.ai';
const DEMO_PASSWORD = 'HelmX@123';

export function login(email: string, password: string): AuthUser {
  if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const user: AuthUser = {
      email: DEMO_EMAIL,
      name: 'Safety Admin',
      role: 'Administrator',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  throw new Error('Invalid email or password.');
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}
