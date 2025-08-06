export type UserRole = 'admin' | 'technician' | 'receptionist' | 'customer';

export interface User {
  full_name: ReactNode;
  id: string;
  email: string;
  password: string;
  full_Name: string;
  rut: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}