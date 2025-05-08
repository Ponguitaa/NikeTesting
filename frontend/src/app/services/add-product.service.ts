import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  reference: string;
  name: string;
  price: number;
  description: string;
  type: string;
}

export interface ProductResponse {
  mensaje: string;
  producto: any;
}

@Injectable({
  providedIn: 'root'
})
export class AddProductService {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) { }

  /**
   * Creates a new product by sending a POST request to the backend API
   * @param product The product details to be created
   * @returns An observable with the server's response
   */
  createProduct(product: Product): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, product);
  }

  /**
   * Fetches all products from the backend API
   * @returns An observable with the array of products
   */
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Deletes a product by its reference
   * @param reference The reference number of the product to delete
   * @returns An observable with the server's response
   */
  deleteProduct(reference: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${reference}`);
  }
}
