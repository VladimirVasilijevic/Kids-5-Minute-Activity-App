import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Category {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  categories: Category[] = [
    {
      id: 'about',
      title: 'HOME.CAT_ABOUT_TITLE',
      description: 'HOME.CAT_ABOUT_DESC',
      color: 'bg-blue-500',
      icon: 'user'
    },
    {
      id: 'shop',
      title: 'HOME.CAT_SHOP_TITLE',
      description: 'HOME.CAT_SHOP_DESC',
      color: 'bg-green-500',
      icon: 'shopping-cart'
    },
    {
      id: 'blog',
      title: 'HOME.CAT_BLOG_TITLE',
      description: 'HOME.CAT_BLOG_DESC',
      color: 'bg-purple-500',
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
      color: 'bg-pink-500',
      icon: 'palette'
    },
    {
      id: 'educational',
      title: 'HOME.CAT_EDUCATIONAL_TITLE',
      description: 'HOME.CAT_EDUCATIONAL_DESC',
      color: 'bg-indigo-500',
      icon: 'graduation-cap'
    },
    {
      id: 'musical',
      title: 'HOME.CAT_MUSICAL_TITLE',
      description: 'HOME.CAT_MUSICAL_DESC',
      color: 'bg-orange-500',
      icon: 'music'
    },
    {
      id: 'nature',
      title: 'HOME.CAT_NATURE_TITLE',
      description: 'HOME.CAT_NATURE_DESC',
      color: 'bg-emerald-500',
      icon: 'tree'
    }
  ];

  constructor(private router: Router) {}

  goToCategory(categoryId: string): void {
    switch (categoryId) {
      case 'about':
        this.router.navigate(['/about']);
        break;
      case 'shop':
        this.router.navigate(['/shop']);
        break;
      case 'blog':
        this.router.navigate(['/blog']);
        break;
      case 'tips':
        this.router.navigate(['/tips']);
        break;
      case 'physical':
      case 'creative':
      case 'educational':
      case 'musical':
      case 'nature':
        this.router.navigate(['/activities'], { queryParams: { category: categoryId } });
        break;
      default:
        this.router.navigate(['/activities']);
    }
  }
} 