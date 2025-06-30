import { Component, OnInit } from '@angular/core';
import { BlogAPIService, Blog } from '../../blog-api.service';  // đường dẫn tuỳ theo bạn đặt file

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
  standalone: false
})
export class BlogComponent implements OnInit {
  blogs: Blog[] = [];
  formData: Blog = this.initForm();
  initForm(): Blog {
    return {
      slug: '',
      title: '',
      author: '',
      date: '',
      image: '',
      content: []
    };
  }
  constructor(private blogService: BlogAPIService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs() {
    this.blogService.getAllBlogs().subscribe((data) => {
      this.blogs = data;
    });
  }

  submitForm() {
    this.blogService.createOrUpdateBlog(this.formData).subscribe(() => {
      this.loadBlogs();
      this.resetForm();
    });
  }

  editBlog(blog: Blog) {
    // Tạo bản sao để tránh chỉnh trực tiếp object gốc
    this.formData = JSON.parse(JSON.stringify(blog));
  }

  deleteBlog(slug: string) {
    if (confirm('Bạn có chắc muốn xoá không?')) {
      this.blogService.deleteBlog(slug).subscribe(() => {
        this.loadBlogs();
      });
    }
  }

  addBlock() {
    this.formData.content.push({ type: 'PARAGRAPH', value: '' });
  }

  removeBlock(index: number) {
    this.formData.content.splice(index, 1);
  }

  resetForm() {
    this.formData = this.initForm();
  }
}
