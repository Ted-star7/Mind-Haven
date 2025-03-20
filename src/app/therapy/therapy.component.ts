import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ViewportScroller } from '@angular/common';
// import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-therapy',
  standalone: true,
  imports: [BaseChartDirective, RouterModule], 
  templateUrl: './therapy.component.html',
  styleUrls: ['./therapy.component.css'],
})
export class TherapyComponent {

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller
  ){}
  therapyEffectivenessData = {
    labels: ['No Improvement', 'Moderate Improvement', 'Significant Improvement'],
    datasets: [
      {
        label: 'Therapy Effectiveness (%)',
        data: [25, 50, 75],
        backgroundColor: ['#ff4b2b', '#ffb400', '#2b1055'],
      },
    ],
  };

  reasonsForTherapyData = {
    labels: ['Anxiety', 'Depression', 'Relationship Issues', 'Self-Improvement', 'Trauma'],
    datasets: [
      {
        data: [40, 30, 15, 10, 5],
        backgroundColor: ['#ff4b2b', '#ffb400', '#2b1055', '#6c757d', '#2f8f4f'],
      },
    ],
  };

  chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  scrollToSection(sectionId: string) {
    this.viewportScroller.scrollToAnchor(sectionId);
  }
}
