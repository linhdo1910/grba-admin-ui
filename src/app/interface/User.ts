export interface LoginResponse {
  userId: string;
  role: 'user' | 'admin';
  action?: 'edit all' | 'account ctrl' | 'sales ctrl' | 'just view';
  token?: string;
  message?: string;
}

export interface SignUpResponse {
  message: string;
  userId: string;
}

export interface User {
  _id: string | null;
  name: string;
  email: string;
  password?: string;
  gender?: string;
  birthDate?: {
    day?: string;
    month?: string;
    year?: string;
  };
  marketing?: boolean;
  phoneNumber?: string;
  address?: string;
  role: 'user' | 'admin';
  action: 'edit all' | 'account ctrl' | 'sales ctrl' | 'just view';
}