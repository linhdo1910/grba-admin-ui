import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { NavComponent } from './nav/nav.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { AdminComponent } from './admin/admin.component';
import { ProductManagementComponent } from './product-management/product-management.component';
import { OrderManagementComponent } from './order-management/order-management.component';

import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from '../services/auth.service';
import { ProductAPIService } from '../product-api.service';
import { OrderAPIService } from '../order-api.service';
import { UserManagementComponent } from './user-management/user-management.component';
import { BlogComponent } from './blog/blog.component';

@NgModule({
  declarations: [
    NavComponent,
    MainpageComponent,
    AdminComponent,
    ProductManagementComponent,
    OrderManagementComponent,
    UserManagementComponent,
    BlogComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    AuthGuard,
    AuthService,
    ProductAPIService,
    OrderAPIService,
  ],
  bootstrap: [AdminComponent],
  exports: [
    AdminComponent,
    NavComponent // ✅ Xuất ra để module khác có thể sử dụng
  ]
})
export class AdminModule { }
