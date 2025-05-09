import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AddProductService, Product, ProductResponse } from './add-product.service';
import { AdminComponent } from '../components/admin/admin.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

// Unit Tests
describe('AddProductService (Unit Tests)', () => {
  let service: AddProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddProductService]
    });
    service = TestBed.inject(AddProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifies that no requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createProduct', () => {
    it('should create a product and return the response', () => {
      const mockProduct: Product = {
        reference: 'REF123',
        name: 'Nike Air Max',
        price: 129.99,
        description: 'Iconic running shoes with Air cushioning',
        type: 'running'
      };

      const mockResponse: ProductResponse = {
        mensaje: 'Producto agregado exitosamente',
        producto: { insertId: 1 }
      };

      service.createProduct(mockProduct).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/products');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProduct);
      req.flush(mockResponse);
    });

    it('should handle errors when creating a product fails', () => {
      const mockProduct: Product = {
        reference: 'REF123',
        name: 'Nike Air Max',
        price: 129.99,
        description: 'Iconic running shoes with Air cushioning',
        type: 'running'
      };

      const mockError = { status: 500, statusText: 'Server Error' };

      service.createProduct(mockProduct).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: error => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/products');
      expect(req.request.method).toBe('POST');
      req.flush('Internal Server Error', mockError);
    });
  });

  describe('getProducts', () => {
    it('should return an array of products', () => {
      const mockProducts = [
        {
          numero_referencia: 'REF123',
          nombre_producto: 'Nike Air Max',
          precio: 129.99,
          descripcion: 'Iconic running shoes with Air cushioning',
          categoria: 'running',
          stock: 20
        },
        {
          numero_referencia: 'REF456',
          nombre_producto: 'Nike React',
          precio: 139.99,
          descripcion: 'Responsive foam for a smooth ride',
          categoria: 'casual',
          stock: 15
        }
      ];

      service.getProducts().subscribe(products => {
        expect(products.length).toBe(2);
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/products');
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product by reference', () => {
      const reference = 'REF123';
      const mockResponse = { mensaje: 'Producto eliminado exitosamente' };

      service.deleteProduct(reference).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/products/${reference}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle 404 errors when product is not found', () => {
      const reference = 'NONEXISTENT';
      const mockError = { status: 404, statusText: 'Not Found' };
      
      service.deleteProduct(reference).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/products/${reference}`);
      expect(req.request.method).toBe('DELETE');
      req.flush('Product not found', mockError);
    });
  });
});

// Integration Tests con formularios y errores
describe('AddProductService (Basic Integration Tests)', () => {
  let service: AddProductService;
  let httpClient: HttpClient;
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        AddProductService,
        FormBuilder
      ]
    });

    service = TestBed.inject(AddProductService);
    httpClient = TestBed.inject(HttpClient);
    formBuilder = TestBed.inject(FormBuilder);
  });

  // Test integration with form handling
  describe('Integration with Forms', () => {
    it('should correctly process form data into product object', () => {
      // Setup a product form similar to what would be in AdminComponent
      const productForm = formBuilder.group({
        name: ['Nike Test Shoe'],
        price: ['199.99'],
        desc: ['Integration test description'],
        type: ['running'],
        reference: ['REF-TEST-123']
      });

      // Spy on the HTTP client post method
      const httpSpy = spyOn(httpClient, 'post').and.returnValue(of({
        mensaje: 'Producto agregado exitosamente',
        producto: { insertId: 999 }
      }));

      // Create product from form values (simulating what AdminComponent would do)
      const productData = {
        name: productForm.get('name')?.value || '',
        price: Number(productForm.get('price')?.value) || 0,
        description: productForm.get('desc')?.value || '',
        type: productForm.get('type')?.value || '',
        reference: productForm.get('reference')?.value || ''
      };

      // Call the service method
      service.createProduct(productData).subscribe(response => {
        expect(response.mensaje).toBe('Producto agregado exitosamente');
        expect(response.producto.insertId).toBe(999);
      });

      // Verify the HTTP client was called with the correct data
      expect(httpSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/products', 
        {
          name: 'Nike Test Shoe',
          price: 199.99,
          description: 'Integration test description',
          type: 'running',
          reference: 'REF-TEST-123'
        }
      );
    });
  });

  // Test integration with error handling
  describe('Error handling across service and components', () => {
    it('should propagate errors to components that can be caught', () => {
      const mockProduct: Product = {
        reference: 'REF-ERR-123',
        name: 'Error Test Product',
        price: 99.99,
        description: 'Product to test error handling',
        type: 'test'
      };

      // Simulate server error
      spyOn(httpClient, 'post').and.returnValue(
        throwError(() => new Error('Server error'))
      );

      // Track if error handler was called
      let errorHandled = false;

      // Simulate component subscribing to service
      service.createProduct(mockProduct).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error) => {
          errorHandled = true;
          expect(error.message).toBe('Server error');
        }
      });

      expect(errorHandled).toBeTrue();
    });
  });

  // Test chaining of service operations (workflow test)
  describe('Product workflow operations', () => {
    it('should support full product lifecycle: create, get, and delete', () => {
      const mockProduct: Product = {
        reference: 'REF-FLOW-123',
        name: 'Workflow Test Shoe',
        price: 109.99,
        description: 'Testing product workflow',
        type: 'casual'
      };

      const mockProductList = [
        {
          numero_referencia: 'REF-FLOW-123',
          nombre_producto: 'Workflow Test Shoe',
          precio: 109.99,
          descripcion: 'Testing product workflow',
          categoria: 'casual',
          stock: 10
        }
      ];

      // Setup spy for all three HTTP methods
      const postSpy = spyOn(httpClient, 'post').and.returnValue(
        of({ mensaje: 'Producto agregado exitosamente', producto: { insertId: 777 } })
      );
      
      const getSpy = spyOn(httpClient, 'get').and.returnValue(of(mockProductList));
      
      const deleteSpy = spyOn(httpClient, 'delete').and.returnValue(
        of({ mensaje: 'Producto eliminado exitosamente' })
      );

      // Step 1: Create product
      service.createProduct(mockProduct).subscribe(createResponse => {
        expect(createResponse.mensaje).toBe('Producto agregado exitosamente');
        
        // Step 2: Get products list
        service.getProducts().subscribe(products => {
          expect(products.length).toBe(1);
          expect(products[0].numero_referencia).toBe('REF-FLOW-123');
          
          // Step 3: Delete the product
          const reference = products[0].numero_referencia;
          service.deleteProduct(reference).subscribe(deleteResponse => {
            expect(deleteResponse.mensaje).toBe('Producto eliminado exitosamente');
          });
        });
      });

      // Verify all methods were called in order
      expect(postSpy).toHaveBeenCalled();
      expect(getSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith('http://localhost:3000/api/products/REF-FLOW-123');
    });
  });
});

// Pruebas separadas para la integración con AdminComponent
describe('AdminComponent Integration with AddProductService', () => {
  let adminComponent: AdminComponent;
  let service: jasmine.SpyObj<AddProductService>;
  let router: Router;

  beforeEach(() => {
    // Creamos un spy para el servicio
    const serviceSpy = jasmine.createSpyObj('AddProductService', ['createProduct']);
    
    // Configuramos TestBed para este bloque de pruebas específico
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AddProductService, useValue: serviceSpy }
      ]
    });
    
    router = TestBed.inject(Router);
    service = TestBed.inject(AddProductService) as jasmine.SpyObj<AddProductService>;
    
    // Creamos una instancia del componente manualmente
    adminComponent = new AdminComponent(service, router);
  });
  
  it('should correctly handle product creation through AdminComponent', () => {
    // Configuramos el spy para simular una respuesta exitosa
    service.createProduct.and.returnValue(
      of({ mensaje: 'Producto agregado exitosamente', producto: { insertId: 888 } })
    );
    
    // Configuramos el formulario
    adminComponent.productForm.setValue({
      name: 'Integration Component Test',
      price: '149.99',
      desc: 'Testing with real component',
      type: 'basketball',
      reference: 'REF-COMP-123'
    });
    
    // Simulamos el envío del formulario
    adminComponent.onSubmit();
    
    // Verificamos que se llamó al servicio con los datos correctos
    expect(service.createProduct).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Integration Component Test',
      price: 149.99,
      description: 'Testing with real component',
      type: 'basketball',
      reference: 'REF-COMP-123'
    }));
    
    // Verificamos los cambios en el estado del componente
    expect(adminComponent.successMessage).toContain('exitosamente');
    expect(adminComponent.errorMessage).toBeNull();
  });
  
  it('should handle errors when product creation fails', () => {
    // Configuramos el spy para simular un error
    service.createProduct.and.returnValue(
      throwError(() => new Error('Integration error test'))
    );
    
    // Configuramos el formulario
    adminComponent.productForm.setValue({
      name: 'Error Component Test',
      price: '129.99',
      desc: 'Error handling with real component',
      type: 'football',
      reference: 'REF-ERR-COMP'
    });
    
    // Simulamos el envío del formulario
    adminComponent.onSubmit();
    
    // Verificamos que se reflejan los estados de error en el componente
    expect(adminComponent.errorMessage).toBeTruthy();
    expect(adminComponent.successMessage).toBeNull();
  });
});
