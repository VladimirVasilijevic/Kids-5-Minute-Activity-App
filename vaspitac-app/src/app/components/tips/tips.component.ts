import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Tip } from '../../models/tip.model'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss']
})
export class TipsComponent implements OnInit {
  tips$!: Observable<Tip[]>

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.tips$ = this.http.get<{ version: string, data: Tip[] }>('assets/tips.json')
      .pipe(map(res => res.data))
  }

  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
} 