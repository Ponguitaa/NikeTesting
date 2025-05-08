import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }
    register(email: string, password: string): Observable<any> {
      const role = 'customer';
      const body = { email, password, role };
      return this.http.post(`${this.apiUrl}/register`, body)
}

    login(email: string, password: string): Observable<any> {
      const body = { email, password };
      console.log("authlogin")
      console.log(body)
      return this.http.post(`${this.apiUrl}/login`, body)
}

}