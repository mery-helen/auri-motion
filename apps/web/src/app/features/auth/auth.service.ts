import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TokenStore } from '../../core/session/token.store';

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

interface ApiEnvelope<T> {
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStore = inject(TokenStore);
  private readonly baseUrl = '/auth';

  register(payload: RegisterPayload): Observable<RegisteredUser> {
    return this.http
      .post<ApiEnvelope<RegisteredUser>>(`${this.baseUrl}/register`, payload)
      .pipe(map((response) => response.data));
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http
      .post<ApiEnvelope<LoginResponse>>(`${this.baseUrl}/login`, payload)
      .pipe(map((response) => response.data));
  }

  saveToken(token: string): void {
    this.tokenStore.saveToken(token);
  }

  getToken(): string | null {
    return this.tokenStore.getToken();
  }

  clearToken(): void {
    this.tokenStore.clearToken();
  }
}
