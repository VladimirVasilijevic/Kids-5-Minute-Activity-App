import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss']
})
export class ActivityDetailComponent implements OnInit {
  activity: any = {
    id: '001',
    title: { sr: 'Joga za decu', en: 'Yoga for Kids' },
    description: { sr: 'Jednostavna petominutna joga', en: 'Simple 5 minute yoga session' },
    videoUrl: { sr: 'https://example.com/video.mp4', en: 'https://example.com/video.mp4' }
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // TODO: Load activity by ID from service
  }
} 