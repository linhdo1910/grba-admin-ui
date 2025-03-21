import { Component, OnInit } from '@angular/core';
import { UserAPIService } from '../../user-api.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interface/User';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: false
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  editingUserId: string | null = null;
  editedUser: Partial<User> = {};
  searchKeyword: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  roles = ['user', 'admin'];
  genders = ['male', 'female'];
  isAdmin: boolean = false;
  canEdit: boolean = false;
  actions: string[] = ['edit all', 'account ctrl', 'sales ctrl', 'just view']; // ✅ Khởi tạo biến canEdit


  constructor(
    private userService: UserAPIService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        if (user) {
          this.isAdmin = user.role === 'admin' || user.action === 'account ctrl';
          this.canEdit = user.role === 'admin' || user.action === 'edit all';
          if (this.isAdmin) {
            this.loadUsers();
          } else {
            console.warn('You do not have permission to view users.');
          }
        }
      },
      error: () => {
        console.warn('Error loading user data.');
      }
    });
  }

  loadUsers(page: number = 1): void {
    this.userService.getUsers(page, 10, this.searchKeyword).subscribe({
      next: (response) => {
        this.users = response.users;
        this.currentPage = page;
        this.totalPages = response.pages;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  onSearch(): void {
    this.loadUsers(1);
  }

  startEditing(user: User): void {
    if (!this.isAdmin) {
      alert('You do not have permission to edit users.');
      return;
    }
    if (!user._id) {
      return;
    }
    this.editingUserId = user._id;
    this.editedUser = { ...user };
  }

  saveEditing(userId: string | null): void {
    if (!this.isAdmin) {
      alert('You do not have permission to edit users.');
      return;
    }
    if (!userId || this.editingUserId !== userId) return;

    const updateData = { ...this.editedUser };
    delete updateData._id;
    delete updateData.password; // Không cập nhật password

    this.userService.updateUserProfile(userId, updateData).subscribe({
      next: () => {
        const index = this.users.findIndex(user => user._id === userId);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updateData };
        }
        this.cancelEditing();
      },
      error: (err) => {
        console.error('Failed to update user:', err);
      }
    });
  }

  cancelEditing(): void {
    this.editingUserId = null;
    this.editedUser = {};
  }

  onDeleteUser(userId: string | null): void {
    if (!this.isAdmin) {
      alert('You do not have permission to delete users.');
      return;
    }
    if (!userId) {
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUserAccount(userId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user._id !== userId);
        },
        error: (err) => {
          console.error('Failed to delete user:', err);
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.loadUsers(page);
  }
}
