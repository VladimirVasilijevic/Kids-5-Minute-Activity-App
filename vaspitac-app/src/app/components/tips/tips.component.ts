import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Tip } from '../../models/tip.model';
import { LanguageService } from '../../services/language.service';
import { TipsService } from '../../services/tips.service';

/**
 * Tips component for displaying parenting tips and advice
 */
@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss'],
})
export class TipsComponent implements OnInit {
  tips$!: Observable<Tip[]>;

  /**
   * Constructor for TipsComponent
   * @param _router - Router service (unused)
   * @param _http - HTTP client service (unused)
   * @param _languageService - Language service (unused)
   * @param _tipsService - Tips service for fetching tips data (unused)
   */
  constructor(
    private _router: Router,
    private _http: HttpClient,
    private _languageService: LanguageService,
    private _tipsService: TipsService
  ) {}

  /**
   * Initialize component by loading tips data
   */
  ngOnInit(): void {
    this.tips$ = this._tipsService.getTips();
  }

  /**
   * Navigate back to home page and scroll to top
   */
  goBack(): void {
    this._router.navigate(['/']).then((): void => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
