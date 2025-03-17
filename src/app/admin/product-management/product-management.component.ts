import { Component, OnInit } from '@angular/core';
import { Product } from '../../../interface/Product';
import { ProductAPIService } from '../../product-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
  standalone: false
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  totalProducts: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  selectedProduct: Product | null = null;
  isEditing: boolean = false;
  productForm: FormGroup;
  selectedProducts: string[] = [];
  loading: boolean = false;
  filterDept: string = '';
  canEdit: boolean = false;
  canView: boolean = false;
  images: string[] = ['', '', '', '', ''];

  constructor(
    private productService: ProductAPIService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.productForm = this.fb.group({
      product_name: ['', Validators.required],
      product_detail: [''],
      stocked_quantity: [0, [Validators.required, Validators.min(0)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0), Validators.max(1)]],
      product_dept: [''],
      rating: [4, [Validators.min(0), Validators.max(5)]],
      image_1: [''],
      image_2: [''],
      image_3: [''],
      image_4: [''],
      image_5: [''],
    });
  }

  ngOnInit(): void {
    this.setPermissions();
    if (this.canView) {
      this.loadProducts();
    }
  }

  setPermissions(): void {
    const action = this.authService.getAction();
    this.canEdit = action === 'edit all' || action === 'sales ctrl';
    this.canView = this.canEdit || action === 'just view';
  }

  clearImage(index: number): void {
    this.images[index] = '';
    this.productForm.patchValue({ [`image_${index + 1}`]: '' });
    this.productForm.updateValueAndValidity();
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
  }

  loadProducts(): void {
    if (!this.canView) {
      return;
    }
    this.loading = true;
    this.productService.getProducts(this.currentPage, this.pageSize, this.filterDept).subscribe({
      next: (data) => {
        this.products = data.products;
        this.totalProducts = data.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onImageChange(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.images[index] = base64String;
      this.productForm.patchValue({ [`image_${index + 1}`]: base64String });
    };

    reader.readAsDataURL(file);
  }

  createProduct(): void {
    if (!this.canEdit || this.productForm.invalid) {
      return;
    }

    const sanitizedProduct: Record<string, any> = { ...this.productForm.value };

    const imageFields = ['image_1', 'image_2', 'image_3', 'image_4', 'image_5'];
    for (const field of imageFields) {
      if (!sanitizedProduct[field]) {
        sanitizedProduct[field] = '';
      }
    }

    this.productService.createProduct(sanitizedProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.productForm.reset();
        this.images = ['', '', '', '', ''];
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          (input as HTMLInputElement).value = '';
        });
      },
      error: (err) => {
        alert(err.message);
      },
    });
  }

  editProduct(product: Product): void {
    if (!this.canEdit) {
      return;
    }
    this.isEditing = true;
    this.selectedProduct = product;
    this.productForm.patchValue(product);
    this.images = [
      product.image_1 || '',
      product.image_2 || '',
      product.image_3 || '',
      product.image_4 || '',
      product.image_5 || '',
    ];
  }

  updateProduct(): void {
    if (!this.canEdit || this.productForm.invalid || !this.selectedProduct) {
      return;
    }

    const sanitizedProduct: Record<string, any> = { ...this.productForm.value };

    const imageFields = ['image_1', 'image_2', 'image_3', 'image_4', 'image_5'];
    for (const field of imageFields) {
      if (!sanitizedProduct[field]) {
        sanitizedProduct[field] = '';
      }
    }

    this.productService.updateProduct(this.selectedProduct._id!, sanitizedProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.cancelEdit();
        this.images = ['', '', '', '', ''];
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          (input as HTMLInputElement).value = '';
        });
      },
      error: (err) => {
        alert(err.message);
      },
    });
  }

  deleteProduct(productId: string): void {
    if (!this.canEdit || !confirm('Are you sure you want to delete this product?')) {
      return;
    }
    this.productService.deleteProduct(productId).subscribe({
      next: () => this.loadProducts()
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedProduct = null;
    this.productForm.reset();
    this.images = ['', '', '', '', ''];
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      (input as HTMLInputElement).value = '';
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  isSelected(productId: string): boolean {
    return this.selectedProducts.includes(productId);
  }

  toggleSelect(productId: string): void {
    if (this.isSelected(productId)) {
      this.selectedProducts = this.selectedProducts.filter(id => id !== productId);
    } else {
      this.selectedProducts.push(productId);
    }
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedProducts = this.products.map(product => product._id!);
    } else {
      this.selectedProducts = [];
    }
  }

  deleteSelectedProducts(): void {
    if (!this.canEdit || !confirm('Are you sure you want to delete the selected products?')) {
      return;
    }
    this.productService.deleteMultipleProducts(this.selectedProducts).subscribe({
      next: () => {
        this.loadProducts();
        this.selectedProducts = [];
      }
    });
  }

  applyDeptFilter(dept: string): void {
    this.filterDept = dept;
    this.currentPage = 1;
    this.loadProducts();
  }
}
