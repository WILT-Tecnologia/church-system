import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  standalone: true,
  imports: [MatButtonModule, NgOptimizedImage],
})
export class LogoComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  goTo(): Promise<boolean> {
    return this.router.navigateByUrl('/');
  }
}
