import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Observable, switchMap } from 'rxjs'
import { BlogPost } from '../../models/blog-post.model'
import { LanguageService } from '../../services/language.service'

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  blogPosts$!: Observable<BlogPost[]>

  constructor(private router: Router, private http: HttpClient, private languageService: LanguageService) {}

  ngOnInit(): void {
    this.blogPosts$ = this.languageService.getLanguage().pipe(
      switchMap(lang => this.http.get<BlogPost[]>(`assets/blog-posts_${lang}.json`))
    )
  }

  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
} 