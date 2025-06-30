import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  categories = [
    {
      id: 'about',
      title: 'HOME.CAT_ABOUT_TITLE',
      description: 'HOME.CAT_ABOUT_DESC',
      color: 'bg-indigo-500',
      icon: 'user'
    },
    {
      id: 'shop',
      title: 'HOME.CAT_SHOP_TITLE',
      description: 'HOME.CAT_SHOP_DESC',
      color: 'bg-orange-500',
      icon: 'shopping-cart'
    },
    {
      id: 'blog',
      title: 'HOME.CAT_BLOG_TITLE',
      description: 'HOME.CAT_BLOG_DESC',
      color: 'bg-blue-500',
      icon: 'book-open'
    },
    {
      id: 'tips',
      title: 'HOME.CAT_TIPS_TITLE',
      description: 'HOME.CAT_TIPS_DESC',
      color: 'bg-yellow-500',
      icon: 'lightbulb'
    },
    {
      id: 'physical',
      title: 'HOME.CAT_PHYSICAL_TITLE',
      description: 'HOME.CAT_PHYSICAL_DESC',
      color: 'bg-red-500',
      icon: 'dumbbell'
    },
    {
      id: 'creative',
      title: 'HOME.CAT_CREATIVE_TITLE',
      description: 'HOME.CAT_CREATIVE_DESC',
      color: 'bg-purple-500',
      icon: 'palette'
    },
    {
      id: 'educational',
      title: 'HOME.CAT_EDUCATIONAL_TITLE',
      description: 'HOME.CAT_EDUCATIONAL_DESC',
      color: 'bg-green-500',
      icon: 'graduation-cap'
    },
    {
      id: 'musical',
      title: 'HOME.CAT_MUSICAL_TITLE',
      description: 'HOME.CAT_MUSICAL_DESC',
      color: 'bg-pink-500',
      icon: 'music'
    },
    {
      id: 'nature',
      title: 'HOME.CAT_NATURE_TITLE',
      description: 'HOME.CAT_NATURE_DESC',
      color: 'bg-emerald-500',
      icon: 'tree'
    }
  ]

  constructor(private router: Router) {}

  goToCategory (id: string) {
    // Route to the appropriate page (to be implemented)
    if (id === 'about') this.router.navigate(['/about'])
    else if (id === 'shop') this.router.navigate(['/shop'])
    else if (id === 'blog') this.router.navigate(['/blog'])
    else if (id === 'tips') this.router.navigate(['/tips'])
    else if (id === 'physical') this.router.navigate(['/activities'], { queryParams: { category: 'physical' } })
    else if (id === 'creative') this.router.navigate(['/activities'], { queryParams: { category: 'creative' } })
    else if (id === 'educational') this.router.navigate(['/activities'], { queryParams: { category: 'educational' } })
    else if (id === 'musical') this.router.navigate(['/activities'], { queryParams: { category: 'musical' } })
    else if (id === 'nature') this.router.navigate(['/activities'], { queryParams: { category: 'nature' } })
  }
} 