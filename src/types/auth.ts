export type Privacity = 'public' | 'private' | 'PUBLIC' | 'PRIVATE';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  privacity: Privacity;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  privacity: Privacity;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}
