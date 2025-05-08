import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddProductService } from '../../services/add-product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  productForm = new FormGroup({
    name: new FormControl('', Validators.required),
    price: new FormControl('', [
      Validators.required,
      Validators.min(0),
    ]),
    desc: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    reference: new FormControl('', Validators.required)
  });

  selectedImage: File | undefined;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private addProductService: AddProductService,
    private router: Router
  ) {}

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;
    
    if (this.productForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    const productData = {
      name: this.productForm.get('name')?.value || '',
      price: Number(this.productForm.get('price')?.value) || 0,
      description: this.productForm.get('desc')?.value || '',
      type: this.productForm.get('type')?.value || '',
      reference: this.productForm.get('reference')?.value || ''
    };

    this.addProductService.createProduct(productData).subscribe({
      next: (response) => {
        console.log('Producto creado exitosamente:', response);
        this.successMessage = 'Producto creado exitosamente!';
        this.productForm.reset();
        this.selectedImage = undefined;
        // Optional: Navigate to a products list view
        // this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.error('Error al crear el producto:', error);
        this.errorMessage = 'Error al crear el producto. Por favor intente de nuevo.';
      }
    });
  }
}