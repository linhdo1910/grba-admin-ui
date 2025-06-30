import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { ProductManagementComponent } from './product-management/product-management.component';
import { OrderManagementComponent } from './order-management/order-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AuthGuard } from '../guards/auth.guard';
import { BlogComponent } from './blog/blog.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'mainpage', pathMatch: 'full' },
      { path: 'mainpage', component: MainpageComponent, data: { title: 'Trang chủ' } },
      { path: 'product-adm', component: ProductManagementComponent, data: { title: 'Product Management' } },
      { path: 'order-adm', component: OrderManagementComponent, data: { title: 'Order Management' } },
      {
        path: 'user-adm',
        component: UserManagementComponent,
        data: { title: 'UserManagement' }
      },
      { 
        path: 'blog-adm', 
        component: BlogComponent, 
        data: { title: 'Quản lý bài viết' } 
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
