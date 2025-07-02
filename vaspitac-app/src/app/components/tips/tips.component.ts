import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Tip } from '../../models/tip.model'

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss']
})
export class TipsComponent implements OnInit {
  tips$!: Observable<Tip[]>

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.tips$ = this.http.get<Tip[]>('assets/tips.json')
  }

  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
} 