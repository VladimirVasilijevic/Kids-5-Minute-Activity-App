import { Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss']
})
export class TipsComponent {
  tips = [
    {
      id: 1,
      title: 'TIPS.TIP1_TITLE',
      description: 'TIPS.TIP1_DESC',
      icon: 'heart',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 2,
      title: 'TIPS.TIP2_TITLE',
      description: 'TIPS.TIP2_DESC',
      icon: 'brain',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 3,
      title: 'TIPS.TIP3_TITLE',
      description: 'TIPS.TIP3_DESC',
      icon: 'smile',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 4,
      title: 'TIPS.TIP4_TITLE',
      description: 'TIPS.TIP4_DESC',
      icon: 'lightbulb',
      color: 'bg-green-100 text-green-600'
    }
  ]

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
} 