import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { App } from './app';
import { appConfig } from './app.config';
import { LoginComponent } from './features/auth/login/login.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('deve remover o placeholder e manter o router-outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Hello, web');
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

describe('Bootstrap da aplicação (appConfig)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [...appConfig.providers],
    }).compileComponents();
  });

  it('deve registrar o HttpClient no bootstrap da aplicação (provideHttpClient)', () => {
    expect(TestBed.inject(HttpClient)).toBeInstanceOf(HttpClient);
  });

  it('deve renderizar a tela de login (/login) com o AuthService real', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="submit-button"]'),
    ).toBeTruthy();
  });
});
