import { Component } from '@angular/core';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent {
  // Dummy data for now - will be replaced with JSON service
  activities = [
    { id: '001', title: { sr: 'Joga za decu', en: 'Yoga for Kids' }, description: { sr: 'Jednostavna petominutna joga', en: 'Simple 5 minute yoga session' } },
    { id: '002', title: { sr: 'Ples', en: 'Dance' }, description: { sr: 'Zabavan ples za decu', en: 'Fun dance for kids' } }
  ];

  constructor() {}
} 