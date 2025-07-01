import { Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent {
  blogPosts = [
    {
      id: 1,
      title: 'BLOG.POST1_TITLE',
      excerpt: 'BLOG.POST1_EXCERPT',
      author: 'BLOG.POST1_AUTHOR',
      readTime: '3 min',
      date: '2024-01-15',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'BLOG.POST2_TITLE',
      excerpt: 'BLOG.POST2_EXCERPT',
      author: 'BLOG.POST2_AUTHOR',
      readTime: '4 min',
      date: '2024-01-12',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'BLOG.POST3_TITLE',
      excerpt: 'BLOG.POST3_EXCERPT',
      author: 'BLOG.POST3_AUTHOR',
      readTime: '5 min',
      date: '2024-01-10',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop'
    }
  ]

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
} 