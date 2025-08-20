import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) {}

  transform(value: string, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value);
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'url':
      default:
        return this.sanitizer.bypassSecurityTrustUrl(value);
    }
  }
}
