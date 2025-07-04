import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Observable, switchMap } from 'rxjs'
import { Tip } from '../../models/tip.model'
import { LanguageService } from '../../services/language.service'

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss']
})
export class TipsComponent implements OnInit {
  tips$!: Observable<Tip[]>

  constructor(private router: Router, private http: HttpClient, private languageService: LanguageService) {}

  ngOnInit(): void {
    this.tips$ = this.languageService.getLanguage().pipe(
      switchMap(lang => this.http.get<Tip[]>(`assets/tips_${lang}.json`))
    )
  }

  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
} 