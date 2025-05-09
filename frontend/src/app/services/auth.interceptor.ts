import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtener el token de autenticación
    const authToken = this.authService.getToken();
    
    // Si hay un token disponible, clona la solicitud y añade el token en el encabezado
    if (authToken) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      // Continúa con la solicitud modificada
      return next.handle(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si recibimos un error 401 (No autorizado), puede ser que el token expiró
          if (error.status === 401) {
            // Cerrar la sesión y redirigir al login
            this.authService.logout();
            this.router.navigate(['/login']);
          }
          
          return throwError(() => error);
        })
      );
    }
    
    // Si no hay token, continúa con la solicitud original
    return next.handle(request);
  }
}