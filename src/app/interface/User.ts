export interface LoginResponse {
  userId: string;
  role: 'user' | 'admin';
  action: 'edit all' | 'account ctrl' | 'sales ctrl' | 'just view';
}

export interface User {
  _id: string | null;
  profileName: string;
  email: string;
  password?: string;
  gender?: string;
  birthDate?: {
    day?: string;
    month?: string;
    year?: string;
  };
  marketing?: boolean;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  action: 'edit all' | 'account ctrl' | 'sales ctrl' | 'just view';
}
