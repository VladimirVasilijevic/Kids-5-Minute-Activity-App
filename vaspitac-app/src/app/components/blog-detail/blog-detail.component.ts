import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, combineLatest, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { BlogPost } from '../../models/blog-post.model';
import { BlogService } from '../../services/blog.service';

/**
 * Component to display the details of a single blog post
 */
@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
})
export class BlogDetailComponent implements OnInit {
  blogPost$!: Observable<BlogPost | undefined>;
  lang!: string;

  /**
   * Initializes services
   * @param _route - Activated route for getting route parameters
   * @param _router - Angular router for navigation
   * @param _blogService - Service for blog post data
   * @param _translate - Service for internationalization
   */
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _blogService: BlogService,
    private _translate: TranslateService
  ) {}

  /**
   * Loads the specific blog post based on the route parameter
   */
  ngOnInit(): void {
    this.lang = this._translate.currentLang || this._translate.getDefaultLang() || 'sr';
    this.blogPost$ = combineLatest([
      this._route.paramMap.pipe(map((params) => params.get('id'))),
      this._translate.onLangChange.pipe(
        map((e) => e.lang as string),
        startWith(this.lang)
      ),
    ]).pipe(
      switchMap(([id, lang]) => {
        this.lang = lang;
        if (!id) return of(undefined);
        return this._blogService.getBlogPostById(Number(id));
      })
    );
  }

  /**
   * Checks if the video URL is from an embeddable platform
   * @param url - The video URL to check
   * @returns True if the video can be embedded, false otherwise
   */
  isVideoEmbeddable(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const embeddableDomains = [
        'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
        'facebook.com', 'instagram.com', 'tiktok.com'
      ];
      return embeddableDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  /**
   * Checks if the video URL is actually playable
   * @param url - The video URL to check
   * @returns True if the video should be playable, false otherwise
   */
  isVideoPlayable(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a direct video file
      const isDirectVideo = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i.test(urlObj.pathname);
      
      // Check if it's from a supported platform
      const isSupportedPlatform = this.isVideoEmbeddable(url);
      
      return isDirectVideo || isSupportedPlatform;
    } catch {
      return false;
    }
  }

  /**
   * Handles video loading errors
   * @param event - The error event from the video element
   */
  onVideoError(event: Event): void {
    console.warn('Video failed to load:', event);
    // You could add additional error handling here if needed
  }

  /**
   * Handles iframe loading errors
   * @param event - The error event from the iframe
   */
  onIframeError(event: Event): void {
    console.warn('Iframe failed to load:', event);
    // You could add additional error handling here if needed
  }

  /**
   * Handles iframe load completion
   * @param event - The load event from the iframe
   */
  onIframeLoad(event: Event): void {
    const iframe = event.target as HTMLIFrameElement;
    const container = iframe.closest('.video-container');
    if (container) {
      container.classList.remove('loading');
    }
  }

  /**
   * Handles video load start
   * @param event - The loadstart event from the video element
   */
  onVideoLoadStart(event: Event): void {
    // Keep loading state while video is loading
    console.log('Video loading started');
  }

  /**
   * Handles video can play event
   * @param event - The canplay event from the video element
   */
  onVideoCanPlay(event: Event): void {
    const video = event.target as HTMLVideoElement;
    const container = video.closest('.video-container');
    if (container) {
      container.classList.remove('loading');
    }
  }

  /**
   * Converts a video URL to an embeddable format
   * @param url - The original video URL
   * @returns The embeddable URL
   */
  getVideoEmbedUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // YouTube
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        let videoId = '';
        
        if (urlObj.hostname.includes('youtu.be')) {
          // Short URL format: youtu.be/VIDEO_ID
          videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
          // Regular URL format: youtube.com/watch?v=VIDEO_ID
          videoId = urlObj.searchParams.get('v') || '';
          
          // Handle other YouTube URL formats
          if (!videoId && urlObj.pathname.includes('/embed/')) {
            videoId = urlObj.pathname.split('/embed/')[1];
          } else if (!videoId && urlObj.pathname.includes('/v/')) {
            videoId = urlObj.pathname.split('/v/')[1];
          }
        }
        
        if (videoId) {
          // Remove any additional parameters from video ID
          videoId = videoId.split('&')[0];
          return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
        }
      }
      
      // Vimeo
      if (urlObj.hostname.includes('vimeo.com')) {
        const videoId = urlObj.pathname.slice(1);
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
        }
      }
      
      // Dailymotion
      if (urlObj.hostname.includes('dailymotion.com')) {
        const videoId = urlObj.pathname.split('/').pop();
        if (videoId && videoId !== '') {
          return `https://www.dailymotion.com/embed/video/${videoId}`;
        }
      }
      
      // Facebook
      if (urlObj.hostname.includes('facebook.com')) {
        return url.replace('/www.facebook.com/', '/www.facebook.com/plugins/video.php?href=');
      }
      
      // Instagram
      if (urlObj.hostname.includes('instagram.com')) {
        return url + '/embed/';
      }
      
      // TikTok
      if (urlObj.hostname.includes('tiktok.com')) {
        const videoId = urlObj.pathname.split('/').pop();
        if (videoId && videoId !== '') {
          return `https://www.tiktok.com/embed/${videoId}`;
        }
      }
      
      return url;
    } catch {
      return url;
    }
  }

  /**
   * Navigates back to the blog list page
   */
  goBack(): void {
    this._router.navigate(['/blog']).then(() => {
      if (typeof window !== 'undefined' && window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
} 