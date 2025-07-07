import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

import { Tip } from '../../models/tip.model';
import { LanguageService } from '../../services/language.service';
import { TipsService } from '../../services/tips.service';

/**
 *
 */
@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss'],
})
export class TipsComponent implements OnInit {
  tips$!: Observable<Tip[]>;

  /**
   *
   * @param router
   * @param http
   * @param languageService
   * @param tipsService
   */
  constructor(
    private router: Router,
    private http: HttpClient,
    private languageService: LanguageService,
    private tipsService: TipsService
  ) {}

  /**
   *
   */
  ngOnInit(): void {
    this.tips$ = this.tipsService.getTips();
  }

  /**
   *
   */
  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
