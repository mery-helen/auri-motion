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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/auth';

  register(payload: RegisterPayload): Observable<RegisteredUser> {
    return this.http.post<RegisteredUser>(`${this.baseUrl}/register`, payload);
  }
}
