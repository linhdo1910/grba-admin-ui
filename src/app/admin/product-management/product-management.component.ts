import { Component, OnInit } from '@angular/core';
import { Product } from '../../interface/Product';
import { ProductAPIService } from '../../product-api.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
  standalone: false,
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  totalProducts = 0;
  currentPage = 1;
  pageSize = 10;
  selectedProduct: Product | null = null;
  isEditing = false;
  productForm: FormGroup;
  selectedProducts: string[] = [];
  loading = false;
  filterDept = '';
  isAdmin = false;
  canEdit = false;
  images: string[] = ['', '', '', '', ''];
  errorMessage: string | null = null;
  private filterSubject = new Subject<string>();

  constructor(
    private productService: ProductAPIService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      brandName: [''],
      productPrice: [0, [Validators.required, Validators.min(0)]],
      productDescription: [''],
      productStock: [0, [Validators.required, Validators.min(0)]],
      productCategory: [''],
      productSubCategory: [''],
      coverImage: [''],
      images: this.fb.array(this.images.map(() => this.fb.control(''))),
      color: [''],
      size: [''],
      materials: [''],
      sort: [''],
      note: [''],
      status: [1, Validators.required],
      rating: [0, [Validators.min(0), Validators.max(5)]],
      reviews: [0, Validators.min(0)],
      discount: [0, [Validators.min(0), Validators.max(1)]],
      previousPrice: [''],
    });
  }


  
  get imageControls() {
    return (this.productForm.get('images') as FormArray).controls;
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      console.log('User is logged in, fetching profile...');
      this.authService.getUserProfile().subscribe({
        next: (user) => {
          console.log('User profile:', user);
          if (user) {
            this.isAdmin = this.authService.isAdmin();
            this.canEdit = this.isAdmin || this.authService.getAction() === 'edit all';
            console.log('isAdmin:', this.isAdmin, 'canEdit:', this.canEdit);
            this.loadProducts();
          } else {
            console.warn('No user data returned.');
            this.errorMessage = 'Please log in to manage products.';
          }
        },
        error: (err) => {
          console.error('Error loading user profile:', err);
          this.errorMessage = 'Failed to load user profile. Please log in again.';
        },
      });
    } else {
      console.warn('User is not logged in.');
      this.errorMessage = 'Please log in to access product management.';
    }

    this.filterSubject.pipe(debounceTime(300)).subscribe(dept => {
      this.filterDept = dept;
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    console.log('Loading products... Page:', this.currentPage, 'Filter:', this.filterDept); // Debug API call
    this.productService.getProducts(this.currentPage, this.pageSize, this.filterDept).subscribe({
      next: (data) => {
        console.log('Products loaded:', data); // Debug dữ liệu trả về
        this.products = data.products || []; // Đảm bảo products không undefined
        this.totalProducts = data.total || 0; // Đảm bảo total không undefined
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errorMessage = 'Failed to load products. Please check your connection or server.';
        this.loading = false;
      },
    });
  }

  resetFormAndImages(): void {
    this.productForm.reset({
      productName: '',
      brandName: '',
      productPrice: 0,
      productDescription: '',
      productStock: 0,
      productCategory: '',
      productSubCategory: '',
      coverImage: '',
      color: '',
      size: '',
      materials: '',
      sort: '',
      note: '',
      status: 1,
      rating: 0,
      reviews: 0,
      discount: 0,
      previousPrice: 0,
    });
    this.images = ['', '', '', '', ''];
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => (input as HTMLInputElement).value = '');
  }

  onImageChange(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.images[index] = base64String;
      this.imageControls[index].setValue(base64String);
    };
    reader.readAsDataURL(file);
  }

  clearImage(index: number): void {
    this.images[index] = '';
    this.imageControls[index].setValue('');
  }

  createProduct(): void {
    console.log('Creating product...', this.productForm.value);
  
    // Kiểm tra quyền và trạng thái form
    if (!this.isAdmin) {
      alert('You do not have permission to create products.');
      console.log('Not admin:', this.isAdmin);
      return;
    }
  
    if (this.productForm.invalid) {
      // Kiểm tra từng trường bắt buộc và tạo thông báo chi tiết
      const errors: string[] = [];
      if (this.productForm.get('productName')?.invalid) {
        errors.push('Product Name is required.');
      }
      if (this.productForm.get('productCategory')?.invalid) {
        errors.push('Category is required.');
      }
      if (this.productForm.get('productDescription')?.invalid) {
        errors.push('Product Description is required.');
      }
      if (this.productForm.get('productPrice')?.invalid) {
        errors.push('Price is required and must be greater than or equal to 0.');
      }
      if (this.productForm.get('productStock')?.invalid) {
        errors.push('Stock Quantity is required and must be greater than or equal to 0.');
      }
      if (this.productForm.get('discount')?.invalid) {
        errors.push('Discount is required and must be between 0 and 1.');
      }
      if (this.productForm.get('rating')?.invalid) {
        errors.push('Rating is required and must be between 0 and 5.');
      }
  
      // Hiển thị thông báo lỗi
      if (errors.length > 0) {
        alert('Please fill in all required fields:\n- ' + errors.join('\n- '));
        console.log('Form invalid:', this.productForm.errors);
      } else {
        alert('Form is invalid. Please check your inputs.');
        console.log('Form invalid:', this.productForm.errors);
      }
      return;
    }
  
    // Nếu form hợp lệ, gọi API để tạo sản phẩm
    this.productService.createProduct(this.productForm.value).subscribe({
      next: (response) => {
        console.log('Create success:', response);
        alert('Product created successfully!');
        this.loadProducts();
        this.resetFormAndImages();
      },
      error: (err) => {
        console.error('Create error:', err);
        alert(err.message || 'Error creating product.');
      },
    });
  }
  editProduct(product: Product): void {
    if (!this.isAdmin) {
      this.errorMessage = 'You do not have permission to edit products.';
      return;
    }
    this.isEditing = true;
    this.selectedProduct = product;
    this.productForm.patchValue(product);
    this.images = product.images?.slice(0, 5) || ['', '', '', '', ''];
    this.images.forEach((img, idx) => this.imageControls[idx].setValue(img));
  }

  updateProduct(): void {
    console.log('Updating product...', this.productForm.value);
    if (!this.isAdmin || this.productForm.invalid || !this.selectedProduct) {
      console.log('Form invalid or not admin:', this.productForm.errors, 'isAdmin:', this.isAdmin);
      this.errorMessage = 'You do not have permission to update products or the form is invalid.';
      return;
    }
    this.productService.updateProduct(this.selectedProduct._id!, this.productForm.value).subscribe({
      next: (response) => {
        alert('Product updated successfully!');
        console.log('Update success:', response);
        this.loadProducts();
        this.cancelEdit();
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Update error:', err);
        this.errorMessage = err.message || 'Error updating product.';
      },
    });
  }

  deleteProduct(productId: string): void {
    if (!this.isAdmin || !confirm('Are you sure you want to delete this product?')) {
      this.errorMessage = 'You do not have permission to delete products.';
      return;
    }
    this.productService.deleteProduct(productId).subscribe({
      next: () => this.loadProducts(),
      error: (err) => (this.errorMessage = err.message || 'Error deleting product.'),
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedProduct = null;
    this.resetFormAndImages();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.loading) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1 && !this.loading) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
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
    if (!this.isAdmin || !confirm('Are you sure you want to delete the selected products?')) {
      this.errorMessage = 'You do not have permission to delete products.';
      return;
    }
    this.productService.deleteMultipleProducts(this.selectedProducts).subscribe({
      next: () => {
        this.loadProducts();
        this.selectedProducts = [];
        this.errorMessage = null;
      },
      error: (err) => (this.errorMessage = err.message || 'Error deleting products.'),
    });
  }

  applyDeptFilter(dept: string): void {
    this.filterSubject.next(dept);
  }
}