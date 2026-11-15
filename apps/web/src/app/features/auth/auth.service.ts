import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

const TOKEN_STORAGE_KEY = 'auri-motion.access-token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/auth';

  register(payload: RegisterPayload): Observable<RegisteredUser> {
    return this.http.post<RegisteredUser>(`${this.baseUrl}/register`, payload);
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload);
  }

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}
