import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { BlogPost } from '../../models/blog-post.model'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  blogPosts$!: Observable<BlogPost[]>

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.blogPosts$ = this.http.get<{ version: string, data: BlogPost[] }>('assets/blog-posts.json')
      .pipe(map(res => res.data))
  }

  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
} 