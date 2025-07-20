import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { Color, PieChartModule, ScaleType } from '@swimlane/ngx-charts';

type SimpleProps = {
  name: string;
  value: number;
}[];

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './app-admin-dashboard.component.html',
  styleUrls: ['./app-admin-dashboard.component.scss'],
  imports: [CommonModule, PieChartModule],
})
export class AdminDashboardComponent implements OnInit {
  scaleType: ScaleType = ScaleType.Ordinal;
  single: SimpleProps = [
    {
      name: 'Germany',
      value: 894,
    },
    {
      name: 'USA',
      value: 500,
    },
    {
      name: 'France',
      value: 720,
    },
    {
      name: 'UK',
      value: 620,
    },
  ];

  view: [number, number] = [1000, 600];

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;

  colorScheme: Color = {
    name: 'vivid',
    selectable: true,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    group: ScaleType.Ordinal,
  };

  constructor() {
    Object.assign(this.single);
  }

  ngOnInit() {}
}
