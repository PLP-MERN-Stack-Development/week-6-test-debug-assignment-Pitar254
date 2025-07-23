export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}