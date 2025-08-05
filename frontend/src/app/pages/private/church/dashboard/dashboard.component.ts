import { Component, OnInit } from '@angular/core';

import { Color, PieChartModule, ScaleType } from '@swimlane/ngx-charts';

type SimpleProps = {
  name: string;
  value: number;
}[];

type ViewProps = [number, number];

@Component({
  selector: 'app-dashboard-church',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [PieChartModule],
})
export class DashboardComponent implements OnInit {
  scaleType: ScaleType = ScaleType.Ordinal;
  results: SimpleProps = [
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

  view: ViewProps = [600, 600];

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;

  colorScheme: Color = {
    name: 'vivid',
    selectable: true,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#FF0000', '#0000FF'],
    group: ScaleType.Ordinal,
  };
  constructor() {
    Object.assign(this.results);
  }

  ngOnInit() {}
}
