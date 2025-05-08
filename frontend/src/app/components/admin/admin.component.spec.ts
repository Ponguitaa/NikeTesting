import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { AdminComponent } from './admin.component';
import { AddProductService } from '../../services/add-product.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let addProductServiceSpy: jasmine.SpyObj<AddProductService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AddProductService', ['createProduct']);
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, 
        RouterTestingModule,
        HttpClientTestingModule,
        AdminComponent
      ],
      providers: [
        { provide: AddProductService, useValue: spy }
      ]
    }).compileComponents();

    addProductServiceSpy = TestBed.inject(AddProductService) as jasmine.SpyObj<AddProductService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.productForm).toBeTruthy();
    expect(component.productForm.get('name')?.value).toBe('');
    expect(component.productForm.get('price')?.value).toBe('');
    expect(component.productForm.get('desc')?.value).toBe('');
    expect(component.productForm.get('type')?.value).toBe('');
    expect(component.productForm.get('reference')?.value).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    expect(component.productForm.valid).toBeFalsy();
  });

  it('should mark form as valid when all required fields are filled', () => {
    component.productForm.setValue({
      name: 'Nike Air Max',
      price: '150',
      desc: 'Classic running shoes',
      type: 'running',
      reference: 'REF123'
    });

    expect(component.productForm.valid).toBeTruthy();
  });

  it('should not submit the form when it is invalid', () => {
    // Leave form invalid
    component.onSubmit();
    expect(addProductServiceSpy.createProduct).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeTruthy();
  });

  it('should call createProduct service method when form is valid', () => {
    const testProduct = {
      name: 'Nike Air Max',
      price: '150',
      desc: 'Classic running shoes',
      type: 'running',
      reference: 'REF123'
    };

    component.productForm.setValue(testProduct);
    
    // Mock successful response
    addProductServiceSpy.createProduct.and.returnValue(of({
      mensaje: 'Producto agregado exitosamente',
      producto: { insertId: 1 }
    }));

    component.onSubmit();
    
    expect(addProductServiceSpy.createProduct).toHaveBeenCalledWith({
      name: testProduct.name,
      price: Number(testProduct.price),
      description: testProduct.desc,
      type: testProduct.type,
      reference: testProduct.reference
    });
    
    expect(component.successMessage).toBeTruthy();
    expect(component.errorMessage).toBeNull();
  });

  it('should display error message when product creation fails', () => {
    const testProduct = {
      name: 'Nike Air Max',
      price: '150',
      desc: 'Classic running shoes',
      type: 'running',
      reference: 'REF123'
    };

    component.productForm.setValue(testProduct);
    
    // Mock error response
    addProductServiceSpy.createProduct.and.returnValue(throwError(() => new Error('Test error')));

    component.onSubmit();
    
    expect(addProductServiceSpy.createProduct).toHaveBeenCalled();
    expect(component.errorMessage).toBeTruthy();
    expect(component.successMessage).toBeNull();
  });

  it('should reset the form after successful submission', () => {
    const testProduct = {
      name: 'Nike Air Max',
      price: '150',
      desc: 'Classic running shoes',
      type: 'running',
      reference: 'REF123'
    };

    component.productForm.setValue(testProduct);
    
    // Mock successful response
    addProductServiceSpy.createProduct.and.returnValue(of({
      mensaje: 'Producto agregado exitosamente',
      producto: { insertId: 1 }
    }));

    component.onSubmit();

    // Form should be reset
    expect(component.productForm.get('name')?.value).toBe(null);
    expect(component.productForm.get('price')?.value).toBe(null);
  });

  it('should update selectedImage when onImageSelected is called', () => {
    const mockFile = new File([''], 'test-image.jpg', { type: 'image/jpeg' });
    const mockEvent = { target: { files: [mockFile] } };
    
    component.onImageSelected(mockEvent);
    
    expect(component.selectedImage).toEqual(mockFile);
  });

  describe('UI elements', () => {
    it('should have all form fields rendered', () => {
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]'));
      const priceInput = fixture.debugElement.query(By.css('input[formControlName="price"]'));
      const descInput = fixture.debugElement.query(By.css('input[formControlName="desc"]'));
      const typeSelect = fixture.debugElement.query(By.css('select[formControlName="type"]'));
      const referenceInput = fixture.debugElement.query(By.css('input[formControlName="reference"]'));
      
      expect(nameInput).toBeTruthy();
      expect(priceInput).toBeTruthy();
      expect(descInput).toBeTruthy();
      expect(typeSelect).toBeTruthy();
      expect(referenceInput).toBeTruthy();
    });

    it('should show success message when provided', () => {
      component.successMessage = 'Product created successfully';
      fixture.detectChanges();
      
      const successElement = fixture.debugElement.query(By.css('.bg-green-600'));
      expect(successElement).toBeTruthy();
      expect(successElement.nativeElement.textContent).toContain('Product created successfully');
    });

    it('should show error message when provided', () => {
      component.errorMessage = 'Error creating product';
      fixture.detectChanges();
      
      const errorElement = fixture.debugElement.query(By.css('.bg-red-600'));
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain('Error creating product');
    });

    it('should disable submit button when form is invalid', () => {
      // Form is invalid by default
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTruthy();
      
      // Make form valid
      component.productForm.setValue({
        name: 'Nike Air Max',
        price: '150',
        desc: 'Classic running shoes',
        type: 'running',
        reference: 'REF123'
      });
      fixture.detectChanges();
      
      expect(submitButton.nativeElement.disabled).toBeFalsy();
    });
  });
});

