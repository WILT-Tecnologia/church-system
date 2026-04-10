import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ImageRubeusAnt404Component } from './image-rubeus-ant-404/image-rubeus-ant-404.component';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
  imports: [ImageRubeusAnt404Component, MatButtonModule],
})
export class PageNotFoundComponent implements OnInit {
  constructor(private router: Router) {}

  backToHome() {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.router.navigate(['/']);
  }
}
