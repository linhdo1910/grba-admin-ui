import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContentBlock {
  type: string;
  value: string;
}

export interface Blog {
  slug: string;
  title: string;
  author: string;
  date: string;
  image: string;
  content: ContentBlock[];
}

@Injectable({
  providedIn: 'root',
})
export class BlogAPIService {
  private apiUrl = 'http://localhost:3000/api/blogs';

  constructor(private http: HttpClient) {}

  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  getBlog(slug: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${slug}`);
  }

  createOrUpdateBlog(blog: Blog): Observable<any> {
    return this.http.post(this.apiUrl, blog);
  }

  deleteBlog(slug: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${slug}`);
  }
}
